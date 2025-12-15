"""
Contrôleur Chatbot CinéA - Gestion des intentions et actions
Adapté depuis le SERVICE_IA pour le contexte cinéma/streaming
"""
import requests
import re
from typing import Dict, Any, Optional, List
from datetime import datetime

# URLs des services backend CinéA
SERVICE_FILMS_URL = "http://127.0.0.1:5002"
SERVICE_UTILISATEUR_URL = "http://127.0.0.1:5001"
SERVICE_HISTORIQUE_URL = "http://127.0.0.1:5005"


# ============================================
# INTENTIONS POSSIBLES
# ============================================
class Intent:
    """Intentions détectées dans les messages utilisateur"""
    GREETING = "greeting"
    # Recherche générique désactivée côté chatbot (remplacée par Mood Picker)
    SEARCH_FILMS = "search_films"
    LIST_FILMS = "list_films"
    RECOMMEND = "recommend"
    MOOD = "mood_picker"
    INFO_PLATFORM = "info_platform"
    INFO_ONLY = "info_only"  # Réponse RAG pure


# ============================================
# DÉTECTION D'INTENTION
# ============================================
def detect_intent(message: str) -> str:
    """Détecte l'intention de l'utilisateur
    
    Args:
        message: Message de l'utilisateur
        
    Returns:
        Intent détecté
    """
    message_lower = message.lower().strip()
    
    # 1. Salutations
    greeting_keywords = ["bonjour", "salut", "bonsoir", "hello", "coucou", "hey"]
    greeting_patterns = [
        r"^comment (ça )?va\??$",
        r"^ça va\??$",
        r"^tu vas bien\??$",
    ]
    
    if any(message_lower == kw or message_lower.startswith(kw + " ") for kw in greeting_keywords):
        return Intent.GREETING
    
    for pattern in greeting_patterns:
        if re.match(pattern, message_lower):
            return Intent.GREETING
    
    # 2. Mood Picker (Humeur)
    mood_patterns = [
        (r"\b(triste|j'ai le cafard|deprim|chagrin)\b", "triste"),
        (r"\b(envie de rire|je veux rire|rigoler|drôle|comique)\b", "rire"),
        (r"\b(intense|haletant|stressant|suspense|thriller)\b", "intense"),
        (r"\b(copine|petite amie|romantique|love|amour)\b", "romantique"),
        (r"\b(famille|enfants|feel\s*good|léger)\b", "feelgood"),
        (r"\b(peur|frisson|horreur|angoisse)\b", "peur"),
    ]
    for pattern, _label in mood_patterns:
        if re.search(pattern, message_lower):
            return Intent.MOOD

    # 3. Recommandations générales
    recommend_keywords = [
        "recommand", "conseil", "suggèr", "propose", "que regarder",
        "quoi regarder", "film à voir", "série à voir"
    ]
    
    if any(kw in message_lower for kw in recommend_keywords):
        return Intent.RECOMMEND
    
    # 4. Infos sur la plateforme
    platform_keywords = [
        "comment", "fonctionne", "utiliser", "profil", "compte",
        "abonnement", "inscription", "connexion", "mot de passe",
        "historique", "publication", "communauté"
    ]
    
    if any(kw in message_lower for kw in platform_keywords):
        return Intent.INFO_PLATFORM
    
    # Par défaut : réponse RAG pure
    return Intent.INFO_ONLY


# ============================================
# EXTRACTION DE FILTRES POUR RECHERCHE (legacy)
# ============================================
def extract_film_filters(message: str) -> Dict[str, Any]:
    """Extrait les filtres de recherche depuis le message
    
    Args:
        message: Message utilisateur
        
    Returns:
        Dict avec les filtres (genre, pays, année, etc.)
    """
    message_lower = message.lower()
    filters = {}
    
    # Genres
    genres_map = {
        "action": "Action",
        "comédie": "Comédie",
        "drame": "Drame",
        "romance": "Romance",
        "romantique": "Romance",
        "thriller": "Thriller",
        "horreur": "Horreur",
        "science-fiction": "Science-Fiction",
        "sci-fi": "Science-Fiction",
        "documentaire": "Documentaire",
        "animation": "Animation",
        "aventure": "Aventure",
    }
    
    for key, value in genres_map.items():
        if key in message_lower:
            filters["genre"] = value
            break
    
    # Pays/origine
    if any(term in message_lower for term in ["africain", "afrique"]):
        filters["pays"] = "Afrique"
    elif any(term in message_lower for term in ["ivoirien", "côte d'ivoire", "cote d'ivoire"]):
        filters["pays"] = "Côte d'Ivoire"
    elif any(term in message_lower for term in ["nigérian", "nigeria", "nollywood"]):
        filters["pays"] = "Nigeria"
    elif any(term in message_lower for term in ["français", "france"]):
        filters["pays"] = "France"
    
    # Année
    year_match = re.search(r'\b(19\d{2}|20\d{2})\b', message)
    if year_match:
        filters["annee"] = int(year_match.group(1))
    
    # Type de contenu
    if "série" in message_lower or "series" in message_lower:
        filters["type"] = "serie"
    elif "film" in message_lower:
        filters["type"] = "film"
    
    # Mot-clé libre
    # Extraire les mots importants (excluant les mots-outils)
    stopwords = {
        "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
        "un", "une", "le", "la", "les", "de", "du", "des", "à", "au", "aux",
        "cherche", "veux", "montre", "trouve", "film", "série", "pour", "me", "moi"
    }
    
    words = message_lower.split()
    keywords = [w for w in words if len(w) > 3 and w not in stopwords]
    
    if keywords and "genre" not in filters:
        filters["query"] = " ".join(keywords[:3])  # Max 3 mots-clés
    
    return filters


# ============================================
# MOOD PICKER -> FILTRES
# ============================================
def map_mood_to_filters(message: str) -> Dict[str, Any]:
    """Mappe une humeur exprimée en français vers des filtres simples.
    Retourne des mots-clés pour la recherche plein-texte + genre/pays si évident."""
    msg = message.lower()
    filters: Dict[str, Any] = {"keywords": []}

    def add_kw(*words):
        for w in words:
            if w and w not in filters["keywords"]:
                filters["keywords"].append(w)

    # Humeurs principales
    if re.search(r"\b(triste|cafard|déprim|chagrin)\b", msg):
        filters["genre"] = "Drame"
        add_kw("drame", "émouvant", "touchant")
    if re.search(r"\b(envie de rire|je veux rire|rigoler|drôle|comique)\b", msg):
        filters["genre"] = filters.get("genre") or "Comédie"
        add_kw("comédie", "humour", "feel good")
    if re.search(r"\b(intense|haletant|stressant|suspense|thriller)\b", msg):
        filters["genre"] = filters.get("genre") or "Action"
        add_kw("thriller", "suspense", "intense", "action")
    if re.search(r"\b(copine|petite amie|romantique|love|amour)\b", msg):
        filters["genre"] = filters.get("genre") or "Romance"
        add_kw("romance", "amour", "couple")
    if re.search(r"\b(famille|enfants|feel\s*good|léger)\b", msg):
        add_kw("familial", "feel good", "léger")
        filters["genre"] = filters.get("genre") or "Comédie"
    if re.search(r"\b(peur|frisson|horreur|angoisse)\b", msg):
        filters["genre"] = filters.get("genre") or "Horreur"
        add_kw("horreur", "frisson", "angoisse")

    # Pays / origine éventuels
    if "ivoir" in msg:
        filters["pays"] = "Côte d'Ivoire"
        add_kw("ivoirien", "côte d'ivoire")
    elif "nigeria" in msg or "nigé" in msg or "nollywood" in msg:
        filters["pays"] = "Nigeria"
        add_kw("nigeria", "nollywood")
    elif "franç" in msg or "france" in msg:
        filters["pays"] = "France"
        add_kw("français")
    elif "afric" in msg:
        add_kw("africain")

    # Durée indicative
    if re.search(r"\b(court|rapide|<\s*90|min)\b", msg):
        add_kw("court")
    if re.search(r"\b(long|>\s*120|min)\b", msg):
        add_kw("long")

    # Nettoyage final
    filters["query"] = " ".join(filters["keywords"]) if filters["keywords"] else None
    return filters


# ============================================
# ACTIONS BACKEND
# ============================================
def action_search_films(filters: Dict[str, Any], user_id: Optional[int] = None) -> Dict[str, Any]:
    """Recherche des films via le service FILMS
    
    Args:
        filters: Filtres de recherche (genre, pays, année, query)
        user_id: ID utilisateur (optionnel, pour personnalisation)
        
    Returns:
        Dict avec success, data, message, ui
    """
    try:
        params = {}
        
        if filters.get("query"):
            params["q"] = filters["query"]
        
        if filters.get("genre"):
            params["genre"] = filters["genre"]
        
        if filters.get("pays"):
            params["pays"] = filters["pays"]
        
        if filters.get("annee"):
            params["annee"] = filters["annee"]
        
        # Appel API
        response = requests.get(
            f"{SERVICE_FILMS_URL}/contenus/films",
            params=params,
            timeout=8
        )
        
        print(f"[DEBUG] SERVICE_FILMS response status: {response.status_code}")
        
        if response.ok:
            films = response.json()
            print(f"[DEBUG] Films type: {type(films)}")
            print(f"[DEBUG] Films content: {films if not isinstance(films, list) else f'Liste de {len(films)} films'}")
            
            # Vérifier que films est une liste
            if not isinstance(films, list):
                print(f"[ERROR] Films n'est pas une liste: {films}")
                films = []
            
            total = len(films)
            
            # Message personnalisé
            message_parts = [f"J'ai trouvé {total} film(s)"]
            if filters.get("genre"):
                message_parts.append(f"de genre {filters['genre']}")
            if filters.get("pays"):
                message_parts.append(f"de {filters['pays']}")
            if filters.get("annee"):
                message_parts.append(f"de l'année {filters['annee']}")
            
            message = " ".join(message_parts) + "."
            
            # Limiter à 10 résultats
            films_limited = films[:10] if len(films) > 10 else films
            
            return {
                "success": True,
                "data": films_limited,
                "message": message,
                "ui": {
                    "type": "films",
                    "items": films_limited,
                    "total": total,
                    "filters": filters
                }
            }
        
        return {"success": False, "message": "Aucun film trouvé."}
        
    except Exception as e:
        print(f"[ERROR] action_search_films: {e}")
        return {"success": False, "message": f"Erreur: {str(e)}"}


def action_mood_recommendations(message: str, user_id: Optional[int] = None) -> Dict[str, Any]:
    """Utilise la transformation humeur->filtres pour interroger SERVICE_FILMS via /recherche.
    Combine des mots-clés (query) et éventuellement un genre/pays pour améliorer la pertinence."""
    try:
        filters = map_mood_to_filters(message)
        # Construire la requête plein-texte à partir des mots-clés + genre/pays
        terms: List[str] = []
        if filters.get("genre"):
            terms.append(filters["genre"])
        if filters.get("pays"):
            terms.append(filters["pays"])
        if filters.get("query"):
            terms.append(filters["query"])
        q = " ".join(terms).strip() or ""

        # Appel de la recherche globale pour profiter du plein-texte (titre, description, catégorie, pays)
        resp = requests.get(f"{SERVICE_FILMS_URL}/contenus/recherche", params={"q": q}, timeout=8)
        if not resp.ok:
            return {"success": False, "message": "Impossible de récupérer des recommandations."}

        data = resp.json() or {}
        films = data.get("films", [])

        # Limiter et formater
        films_limited = films[:10] if isinstance(films, list) else []
        msg_parts = ["Voici des suggestions selon votre humeur"]
        if filters.get("genre"):
            msg_parts.append(f"(genre {filters['genre']}")
            if filters.get("pays"):
                msg_parts[-1] += f", {filters['pays']}"
            msg_parts[-1] += ")"
        message_txt = " ".join(msg_parts) + ":"

        return {
            "success": True,
            "data": films_limited,
            "message": message_txt,
            "ui": {
                "type": "films",
                "items": films_limited,
                "total": len(films_limited),
                "filters": filters,
                "title": "Suggestions par humeur",
            },
        }
    except Exception as e:
        print(f"[ERROR] action_mood_recommendations: {e}")
        return {"success": False, "message": f"Erreur: {str(e)}"}


def action_list_films(limit: int = 20) -> Dict[str, Any]:
    """Liste les films disponibles
    
    Args:
        limit: Nombre maximum de films à retourner
        
    Returns:
        Dict avec success, data, message, ui
    """
    try:
        response = requests.get(
            f"{SERVICE_FILMS_URL}/contenus/films",
            params={"limit": limit},
            timeout=8
        )
        
        if response.ok:
            films = response.json()
            
            # Vérifier que films est une liste
            if not isinstance(films, list):
                films = []
            
            return {
                "success": True,
                "data": films,
                "message": f"Voici {len(films)} films disponibles sur CinéA.",
                "ui": {
                    "type": "films",
                    "items": films,
                    "total": len(films)
                }
            }
        
        return {"success": False, "message": "Impossible de récupérer les films."}
        
    except Exception as e:
        print(f"[ERROR] action_list_films: {e}")
        return {"success": False, "message": f"Erreur: {str(e)}"}


def action_get_recommendations(user_id: Optional[int] = None) -> Dict[str, Any]:
    """Obtient des recommandations personnalisées
    
    Args:
        user_id: ID utilisateur (optionnel)
        
    Returns:
        Dict avec success, data, message, ui
    """
    try:
        # Si user_id fourni, récupérer l'historique
        if user_id:
            response = requests.get(
                f"{SERVICE_HISTORIQUE_URL}/historique/utilisateur/{user_id}",
                timeout=8
            )
            
            if response.ok:
                historique = response.json() or []
                # Recommander des films similaires basés sur l'historique
                # Pour l'instant, retourner des films populaires
                pass
        
        # Fallback: films populaires
        response = requests.get(
            f"{SERVICE_FILMS_URL}/contenus/films",
            params={"limit": 10, "sort": "populaire"},
            timeout=8
        )
        
        if response.ok:
            films = response.json()
            
            # Vérifier que films est une liste
            if not isinstance(films, list):
                films = []
            
            return {
                "success": True,
                "data": films,
                "message": "Voici quelques films populaires que je te recommande.",
                "ui": {
                    "type": "films",
                    "items": films,
                    "total": len(films),
                    "title": "Recommandations pour vous"
                }
            }
        
        return {"success": False, "message": "Impossible de récupérer les recommandations."}
        
    except Exception as e:
        print(f"[ERROR] action_get_recommendations: {e}")
        return {"success": False, "message": f"Erreur: {str(e)}"}


# ============================================
# EXÉCUTION D'ACTIONS
# ============================================
def execute_action(
    intent: str,
    message: str,
    user_id: Optional[int] = None,
    meta: Dict[str, Any] = None
) -> Optional[Dict[str, Any]]:
    """Exécute l'action correspondant à l'intention
    
    Args:
        intent: Intention détectée
        message: Message utilisateur
        user_id: ID utilisateur
        meta: Métadonnées additionnelles
        
    Returns:
        Résultat de l'action ou None
    """
    meta = meta or {}
    
    if intent == Intent.GREETING:
        return {
            "success": True,
            "message": "Bonjour ! Je suis CinéaBot, ton assistant pour découvrir des films et séries. Comment puis-je t'aider ? 🎬"
        }
    
    # Recherche générique et liste désactivées pour le chatbot (on privilégie le Mood Picker)
    elif intent in (Intent.SEARCH_FILMS, Intent.LIST_FILMS):
        return {
            "success": True,
            "data": [],
            "message": "La recherche générique est désactivée. Exprimez votre humeur (ex: 'envie de rire', 'je me sens triste', 'quelque chose d'intense', 'à regarder avec ma copine').",
            "ui": {"type": "text"}
        }
    
    elif intent == Intent.RECOMMEND:
        return action_get_recommendations(user_id)
    
    elif intent == Intent.MOOD:
        return action_mood_recommendations(message, user_id)
    
    return None


# ============================================
# FORMATAGE DES RÉSULTATS
# ============================================
def format_action_result(result: Dict[str, Any], intent: str) -> str:
    """Formate le résultat d'action en texte naturel
    
    Args:
        result: Résultat de l'action
        intent: Intention originale
        
    Returns:
        Message formaté
    """
    try:
        if not result or not result.get("success"):
            return result.get("message", "Désolé, je n'ai pas pu traiter votre demande.")
        
        # Pour GREETING, retourner directement le message
        if intent == Intent.GREETING:
            return result.get("message", "Bonjour ! Je suis CinéaBot, ton assistant pour découvrir des films et séries. Comment puis-je t'aider ? 🎬")
        
        message = result.get("message", "")
        
        # Pour les recherches de films avec résultats
        if result.get("data") and isinstance(result["data"], list) and len(result["data"]) > 0:
            films = result["data"]
            total = len(films)
            
            # Message principal avec nombre de résultats
            if intent == Intent.SEARCH_FILMS:
                message = f"J'ai trouvé {total} film{'s' if total > 1 else ''} qui correspond{'ent' if total > 1 else ''} à votre recherche ! 🎬\n\n"
            elif intent == Intent.LIST_FILMS:
                message = f"Voici {total} film{'s' if total > 1 else ''} disponibles sur CinéA ! 🎬\n\n"
            elif intent == Intent.RECOMMEND:
                message = f"Je vous recommande ces {total} film{'s' if total > 1 else ''} ! 🎬\n\n"
            
            # Ajouter les 3 premiers films avec détails
            for i, film in enumerate(films[:3], 1):
                try:
                    titre = film.get("titre", "Film inconnu")
                    annee = film.get("date_sortie", "") or film.get("annee", "")
                    genre = film.get("categorie", "") or film.get("genre", "")
                    note = film.get("note", "")
                    
                    message += f"{i}. **{titre}**"
                    
                    details = []
                    if annee:
                        # Convertir en string et extraire l'année
                        annee_str = str(annee)
                        year = annee_str[:4] if len(annee_str) >= 4 else annee_str
                        details.append(year)
                    if genre:
                        details.append(str(genre))
                    if note:
                        details.append(f"⭐ {note}/10")
                    
                    if details:
                        message += f" ({', '.join(details)})"
                    message += "\n"
                except Exception as e:
                    print(f"[ERROR] Erreur formatage film {i}: {e}")
                    continue
            
            if total > 3:
                message += f"\n... et {total - 3} autres film{'s' if total - 3 > 1 else ''} !\n"
            
            message += "\n💡 Cliquez sur une carte ci-dessous pour voir les détails et lancer la lecture !"
        
        elif not result.get("data") or len(result.get("data", [])) == 0:
            # Aucun résultat trouvé
            message = "Je n'ai trouvé aucun film correspondant à votre recherche. 😕\n\n"
            message += "💡 Essayez de :\n"
            message += "• Rechercher par genre (action, comédie, drame, etc.)\n"
            message += "• Préciser le pays (africain, ivoirien, nigérian, etc.)\n"
            message += "• Utiliser des mots-clés plus généraux\n"
        
        return message
        
    except Exception as e:
        print(f"[ERROR] format_action_result: {e}")
        import traceback
        traceback.print_exc()
        return f"Erreur lors du formatage de la réponse: {str(e)}"
