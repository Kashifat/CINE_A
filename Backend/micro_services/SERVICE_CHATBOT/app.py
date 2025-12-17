"""
Service Chatbot CinéA avec RAG (Retrieval Augmented Generation)
Intègre la logique du SERVICE_IA avec adaptation pour le cinéma/streaming
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import traceback
import os
import hashlib
import asyncio
import shutil
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI as OpenAIClient

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, load_index_from_storage
from llama_index.llms.openai import OpenAI as LlamaOpenAI
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.core.prompts import PromptTemplate
from llama_index.core import Settings

from config import (
    SERVICE_NAME,
    SERVICE_HOST,
    SERVICE_PORT,
    DATA_DIR,
    PERSIST_DIR,
    DEFAULT_MODEL_NAME,
    DEFAULT_TOP_K,
)

from controller import (
    detect_intent,
    execute_action,
    format_action_result,
    Intent,
)

load_dotenv()

# ============================================
# Configuration globale LlamaIndex
# ============================================
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("[WARN] OPENAI_API_KEY non trouvée dans .env")
else:
    Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small", api_key=api_key)
    Settings.llm = LlamaOpenAI(model=DEFAULT_MODEL_NAME, temperature=0.1, api_key=api_key)

app = FastAPI(
    title=SERVICE_NAME,
    version="1.0.0",
    description="Service Chatbot CinéA avec RAG pour recommandations de films/séries"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

index = None  # Index vectoriel RAG
last_data_hash = None  # Hash des fichiers data pour détecter changements
reindex_task = None  # Tâche de réindexation périodique

# ============================================
# Template de prompt pour CinéA
# ============================================
CINEA_PROMPT_TEMPLATE = PromptTemplate(
    """Tu es **CinéaBot**, l'assistant virtuel OFFICIEL de **CinéA**, une plateforme de streaming 
spécialisée dans les **films et séries africains (surtout ivoiriens)**, mais qui propose aussi 
des contenus internationaux.

===========================
RÔLE PRINCIPAL
===========================
Tu aides les utilisateurs à :
- Découvrir des **films et séries** à regarder sur CinéA (par genre, pays, année, humeur…).
- Comprendre le **fonctionnement de la plateforme** : comptes, profils, historique, publications.
- Gérer leur expérience : problème de lecture, qualité vidéo, langues (VO/VF).
- Découvrir les **nouveautés**, les contenus populaires, et les recommandations personnalisées.
- Encourager la découverte du **cinéma africain** (réalisateurs, acteurs, thèmes).

===========================
STYLE DE COMMUNICATION
===========================
- Toujours **EN FRANÇAIS**.
- Ton ton est **chaleureux**, **simple** et **accessible**, comme un ami cinéphile.
- Tu peux utiliser quelques emojis liés au cinéma , mais sans en abuser.
- Réponses **claires et concises** (3–5 phrases).
- Tu peux proposer des recommandations sous forme de listes claires (puces).

===========================
RÈGLES IMPORTANTES
===========================

1. Tu restes dans l'univers **CinéA / cinéma / streaming**.
   - Si la question est hors sujet (maths, politique, santé, etc.), tu réponds poliment :
     "Je suis CinéaBot, l'assistant de CinéA. Je peux surtout vous aider pour les films, 
     séries et la plateforme."

2. Tu ne donnes pas de **liens de streaming externes illégaux**.
   - Si on te demande des sites pirates, tu refuses poliment.

3. Tu ne promets pas de choses que la plateforme ne fait pas.
   - Si tu n'as pas l'info exacte, tu restes général :
     "Je n'ai pas cette précision dans mes ressources, mais généralement…"

4. Tu peux t'appuyer sur des modèles de réponses :
   - Recommandation : "Si tu aimes [X], tu pourrais aimer [Y] parce que…"
   - Aide plateforme : "Pour regarder un film, tu dois d'abord t'identifier, puis cliquer sur le film."

5. Tu adaptes tes réponses selon le contexte utilisateur si fourni (page actuelle, user_id).

6. Tu ne dois JAMAIS inventer des films ou séries qui n'existent pas dans la base de données.

===========================
CONTEXTE RAG (CATALOGUE CINÉA) :
{context_str}

QUESTION UTILISATEUR :
{query_str}

RÉPONSE (CHALEUREUSE, NATURELLE ET UTILE) :
"""
)


# ============================================
# Schémas Pydantic
# ============================================
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[int] = None
    page: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    top_k: int = DEFAULT_TOP_K


class ChatResponse(BaseModel):
    question: str
    answer: str
    intent: str
    action_result: Optional[Dict[str, Any]] = None
    ui_data: Optional[Dict[str, Any]] = None


class SuggestionsRequest(BaseModel):
    page: Optional[str] = None
    user_id: Optional[int] = None


class SuggestionsResponse(BaseModel):
    suggestions: List[str]


# ============================================
# Initialisation de l'index RAG
# ============================================
def calculate_data_hash():
    """Calcule un hash MD5 de tous les fichiers dans DATA_DIR"""
    try:
        if not os.path.exists(DATA_DIR):
            return None
        
        hash_md5 = hashlib.md5()
        
        # Parcourir tous les fichiers du dossier data
        for root, dirs, files in os.walk(DATA_DIR):
            for file in sorted(files):  # Tri pour ordre déterministe
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'rb') as f:
                        # Hash du contenu du fichier
                        for chunk in iter(lambda: f.read(4096), b""):
                            hash_md5.update(chunk)
                except Exception as e:
                    print(f"[WARN] Impossible de hasher {file_path}: {e}")
        
        return hash_md5.hexdigest()
    except Exception as e:
        print(f"[ERROR] Erreur lors du calcul du hash: {e}")
        return None


def should_reindex():
    """Détermine si l'index doit être recréé"""
    global last_data_hash
    
    current_hash = calculate_data_hash()
    
    if current_hash is None:
        print("[RAG] Aucun fichier trouvé dans data/")
        return False
    
    # Premier démarrage ou hash différent
    if last_data_hash is None or current_hash != last_data_hash:
        print(f"[RAG] Changement détecté (hash: {current_hash[:8]}...)")
        return True
    
    return False


def initialize_index(force=False):
    """Charge ou crée l'index vectoriel
    
    Args:
        force: Force la réindexation même si pas de changements
    """
    global index, last_data_hash
    
    try:
        # Vérifier si réindexation nécessaire
        needs_reindex = force or should_reindex()
        
        if os.path.exists(PERSIST_DIR) and not needs_reindex:
            print(f"[RAG] Chargement de l'index depuis {PERSIST_DIR}")
            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            index = load_index_from_storage(storage_context)
            last_data_hash = calculate_data_hash()
            print("[RAG] Index chargé avec succès")
        else:
            if needs_reindex:
                print(f"[RAG] Réindexation nécessaire (fichiers modifiés)")
                # Supprimer l'ancien index
                if os.path.exists(PERSIST_DIR):
                    shutil.rmtree(PERSIST_DIR)
                    print(f"[RAG] Ancien index supprimé")
            
            print(f"[RAG] Création d'un nouvel index depuis {DATA_DIR}")
            if not os.path.exists(DATA_DIR) or not os.listdir(DATA_DIR):
                print(f"[WARN] Aucun document trouvé dans {DATA_DIR}")
                print("[INFO] L'index sera créé vide et utilisera uniquement les connaissances du LLM")
                index = None
                last_data_hash = None
                return
            
            documents = SimpleDirectoryReader(DATA_DIR).load_data()
            index = VectorStoreIndex.from_documents(documents)
            index.storage_context.persist(persist_dir=PERSIST_DIR)
            last_data_hash = calculate_data_hash()
            print(f"[RAG] Index créé et sauvegardé (hash: {last_data_hash[:8]}...)")
    except Exception as e:
        print(f"[ERROR] Erreur lors de l'initialisation de l'index: {e}")
        traceback.print_exc()
        index = None


async def periodic_reindex():
    """Tâche périodique de réindexation (toutes les 15 minutes)"""
    while True:
        try:
            await asyncio.sleep(900)  # 15 minutes = 900 secondes
            
            print(f"\n[RAG] Vérification périodique de réindexation ({datetime.now().strftime('%H:%M:%S')})")
            
            if should_reindex():
                print("[RAG] Changements détectés, réindexation en cours...")
                initialize_index(force=True)
                print("[RAG] Réindexation périodique terminée")
            else:
                print("[RAG] Aucun changement détecté, index à jour")
                
        except Exception as e:
            print(f"[ERROR] Erreur lors de la réindexation périodique: {e}")
            traceback.print_exc()


# ============================================
# Routes API
# ============================================
@app.on_event("startup")
async def startup_event():
    """Initialise l'index au démarrage et lance la réindexation périodique"""
    global reindex_task
    
    print("\n" + "="*70)
    print("DEMARRAGE DU SERVICE CHATBOT CINEA")
    print("="*70)
    
    # Initialisation de l'index RAG
    initialize_index()
    
    # Lancer la tâche de réindexation périodique
    reindex_task = asyncio.create_task(periodic_reindex())
    print("[RAG] Réindexation périodique activée (toutes les 15 minutes)")
    print("="*70 + "\n")


@app.on_event("shutdown")
async def shutdown_event():
    """Arrête la tâche de réindexation périodique"""
    global reindex_task
    
    if reindex_task:
        reindex_task.cancel()
        try:
            await reindex_task
        except asyncio.CancelledError:
            print("[RAG] Tâche de réindexation périodique arrêtée")
# ============================================
@app.on_event("startup")
async def startup_event():
    """Initialise l'index au démarrage"""
    initialize_index()


@app.get("/")
async def root():
    return {
        "service": SERVICE_NAME,
        "status": "OK",
        "rag_enabled": index is not None,
        "openai_api_key_configured": bool(api_key),
        "data_hash": last_data_hash[:8] + "..." if last_data_hash else None,
    }


@app.get("/health")
async def health():
    return {
        "status": "OK",
        "rag_index": "loaded" if index else "not_loaded",
        "last_reindex": last_data_hash[:8] + "..." if last_data_hash else None,
    }


@app.post("/reindex")
async def force_reindex():
    """Force la réindexation de l'index RAG"""
    try:
        print("\n[RAG] Réindexation forcée via API")
        initialize_index(force=True)
        
        return {
            "status": "success",
            "message": "Index réindexé avec succès",
            "data_hash": last_data_hash[:8] + "..." if last_data_hash else None,
            "rag_enabled": index is not None,
        }
    except Exception as e:
        print(f"[ERROR] Erreur lors de la réindexation: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur de réindexation: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Endpoint principal du chatbot avec RAG + actions"""
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Le message ne peut pas être vide")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY manquante")
    
    try:
        # 1. Détection d'intention
        intent = detect_intent(req.message)
        print(f"[CHAT] Intent détecté: {intent}")
        
        # 2. Exécution d'action si nécessaire
        # Actions backend pour recommandations et Mood Picker (recherche générique désactivée)
        action_result = None
        if intent in [Intent.GREETING, Intent.RECOMMEND, Intent.MOOD, Intent.SEARCH_FILMS, Intent.LIST_FILMS]:
            action_result = execute_action(
                intent=intent,
                message=req.message,
                user_id=req.user_id,
                meta=req.meta or {}
            )
            print(f"[CHAT] Action result: {action_result}")
        
        # 3. Génération de la réponse
        # Utiliser RAG UNIQUEMENT pour les questions sur la plateforme (INFO_ONLY, INFO_PLATFORM)
        # Pour les recherches de films, utiliser le résultat de l'action backend
        if index and intent in [Intent.INFO_ONLY, Intent.INFO_PLATFORM]:
            # RAG : Questions sur comment utiliser CinéA, FAQ, etc.
            print(f"[CHAT] Utilisation du RAG pour intent: {intent}")
            query_engine = index.as_query_engine(
                similarity_top_k=req.top_k,
                text_qa_template=CINEA_PROMPT_TEMPLATE
            )
            
            # Contexte additionnel pour la requête
            context_info = ""
            if req.page:
                context_info += f"\nPage actuelle: {req.page}"
            if req.user_id:
                context_info += f"\nUtilisateur ID: {req.user_id}"
            
            full_query = f"{context_info}\n\n{req.message}"
            rag_response = query_engine.query(full_query)
            answer = str(rag_response)
        elif action_result:
            # Action backend : Utiliser le message de l'action (recherche films, liste, etc.)
            print(f"[CHAT] Utilisation du résultat d'action pour intent: {intent}")
            answer = format_action_result(action_result, intent)
        else:
            # Pas d'action ni de RAG : réponse générique
            print(f"[CHAT] Réponse générique pour intent: {intent}")
            answer = "Je suis CinéaBot, votre assistant pour découvrir des films et séries ! Comment puis-je vous aider ?"
        
        # 4. Construction de la réponse
        ui_data = None
        if action_result and action_result.get("ui"):
            ui_data = action_result["ui"]
        
        return ChatResponse(
            question=req.message,
            answer=answer,
            intent=intent,
            action_result=action_result,
            ui_data=ui_data
        )
        
    except Exception as e:
        print(f"[ERROR] /chat: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur du chatbot: {str(e)}")


@app.post("/suggestions", response_model=SuggestionsResponse)
async def get_suggestions(req: SuggestionsRequest):
    """Retourne des suggestions de questions selon la page"""
    base_suggestions = [
        "J’ai envie de rire",
        "Je me sens triste",
        "Je veux quelque chose d’intense",
        "Je veux un film à regarder avec ma copine",
    ]
    
    if req.page == "films":
        return SuggestionsResponse(suggestions=[
            "J’ai envie de rire",
            "Je me sens triste",
            "Je veux quelque chose d’intense",
            "Je veux un film romantique",
        ])
    elif req.page == "series":
        return SuggestionsResponse(suggestions=[
            "Je veux une série légère (feel good)",
            "Je cherche une série dramatique",
            "Une série romantique pour ce soir",
            "Une série à suspense (intense)",
        ])
    elif req.page == "historique":
        return SuggestionsResponse(suggestions=[
            "Recommande-moi un film basé sur mon historique",
            "Quels genres je regarde le plus ?",
            "Propose quelque chose de différent",
        ])
    elif req.page == "profil":
        return SuggestionsResponse(suggestions=[
            "Comment modifier mon profil ?",
            "Comment changer mon mot de passe ?",
            "Comment gérer mes publications ?",
        ])
    elif req.page == "communaute":
        return SuggestionsResponse(suggestions=[
            "Comment créer une publication ?",
            "Comment réagir aux publications ?",
            "Comment commenter une publication ?",
        ])
    
    return SuggestionsResponse(suggestions=base_suggestions)


@app.post("/rebuild-index")
async def rebuild_index():
    """Reconstruit l'index RAG depuis les documents"""
    try:
        initialize_index()
        return {"success": True, "message": "Index reconstruit avec succès"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=SERVICE_HOST, port=SERVICE_PORT, reload=True)
