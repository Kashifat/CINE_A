from flask import Blueprint, request, jsonify
import requests
from config import get_db_connection
from models import (
    ajouter_commentaire,
    get_commentaires_publication,
    get_commentaire_par_id,
    modifier_commentaire,
    supprimer_commentaire,
    get_commentaires_utilisateur,
    compter_commentaires_publication
)

commentaires_bp = Blueprint("commentaires", __name__)

# ============================================================================
# Configuration SERVICE NOTIFICATION
# ============================================================================
NOTIFICATION_SERVICE_URL = "http://localhost:5010/notifications"

def notifier_commentaire(id_utilisateur_source: int, id_publication: int, 
                        id_commentaire: int, is_reponse: bool = False, 
                        id_parent_commentaire: int = None):
    """
    Créer une notification quand quelqu'un commente ou répond à un commentaire
    
    ⚠️ Cette fonction ne doit pas bloquer la réponse
    """
    try:
        print(f"🔔 [notifier_commentaire] Tentative de notification: source={id_utilisateur_source}, pub={id_publication}, com={id_commentaire}, reponse={is_reponse}, parent={id_parent_commentaire}")
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Si c'est une réponse, récupérer le propriétaire du commentaire parent
        if is_reponse and id_parent_commentaire:
            print(f"🔔 [notifier_commentaire] Réponse détectée, recherche du commentaire parent {id_parent_commentaire}")
            cur.execute("SELECT id_utilisateur FROM commentaire WHERE id_commentaire = %s", (id_parent_commentaire,))
            result = cur.fetchone()
            
            if not result:
                print(f"❌ [notifier_commentaire] Commentaire parent {id_parent_commentaire} inexistant")
                conn.close()
                return
            
            id_utilisateur_cible = result['id_utilisateur']
            print(f"🔔 [notifier_commentaire] Propriétaire du commentaire parent: {id_utilisateur_cible}")
        else:
            # Si c'est un commentaire direct, récupérer le propriétaire de la publication
            print(f"🔔 [notifier_commentaire] Commentaire direct, recherche du propriétaire de la publication {id_publication}")
            cur.execute("SELECT id_utilisateur FROM publication WHERE id_publication = %s", (id_publication,))
            result = cur.fetchone()
            
            if not result:
                print(f"❌ [notifier_commentaire] Publication {id_publication} inexistante")
                conn.close()
                return
            
            id_utilisateur_cible = result['id_utilisateur']
            print(f"🔔 [notifier_commentaire] Propriétaire de publication: {id_utilisateur_cible}")
        
        conn.close()
        
        # Ne pas notifier si c'est un self-commentaire/self-réponse
        if id_utilisateur_source == id_utilisateur_cible:
            print(f"⚠️ [notifier_commentaire] Self-action détectée (source={id_utilisateur_source} == cible={id_utilisateur_cible}), pas de notification")
            return
        
        # Déterminer le type de notification
        type_notification = "reponse_commentaire" if is_reponse else "commentaire_publication"
        
        # Appeler SERVICE_NOTIFICATION
        payload = {
            "id_utilisateur_cible": id_utilisateur_cible,
            "id_utilisateur_source": id_utilisateur_source,
            "type_notification": type_notification,
            "id_publication": id_publication,
            "id_commentaire": id_commentaire
        }
        
        print(f"🔔 [notifier_commentaire] Payload: {payload}")
        
        response = requests.post(
            NOTIFICATION_SERVICE_URL + "/",
            json=payload,
            timeout=5
        )
        
        print(f"🔔 [notifier_commentaire] Status code: {response.status_code}")
        
        if response.status_code == 201:
            print(f"✅ [notifier_commentaire] Notification créée avec succès!")
        else:
            print(f"❌ [notifier_commentaire] Erreur {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ [notifier_commentaire] Exception: {str(e)}")
        import traceback
        traceback.print_exc()


@commentaires_bp.route("/", methods=["POST"])
def api_ajouter_commentaire():
    """
    POST / - Ajouter un commentaire à une publication
    
    Body JSON:
        {
            "id_publication": 1,
            "id_utilisateur": 1,
            "contenu": "Super publication !",
            "id_parent_commentaire": null  // ou ID pour répondre à un commentaire
        }
    
    Returns:
        201: Commentaire créé avec infos utilisateur
        400: Erreur de validation
    """
    data = request.get_json(silent=True) or {}
    
    id_publication = data.get("id_publication")
    id_utilisateur = data.get("id_utilisateur")
    contenu = data.get("contenu")
    id_parent_commentaire = data.get("id_parent_commentaire")
    
    if not id_publication or not id_utilisateur or not contenu:
        return jsonify({
            "erreur": "id_publication, id_utilisateur et contenu requis"
        }), 400
    
    try:
        commentaire = ajouter_commentaire(
            int(id_publication),
            int(id_utilisateur),
            contenu,
            int(id_parent_commentaire) if id_parent_commentaire else None
        )
        
        # ✅ Créer une notification
        is_reponse = id_parent_commentaire is not None
        notifier_commentaire(
            int(id_utilisateur),
            int(id_publication),
            commentaire.get('id_commentaire') if isinstance(commentaire, dict) else commentaire['id_commentaire'],
            is_reponse=is_reponse,
            id_parent_commentaire=int(id_parent_commentaire) if id_parent_commentaire else None
        )
        
        return jsonify(commentaire), 201
    except ValueError as e:
        return jsonify({"erreur": str(e)}), 400
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500


@commentaires_bp.route("/publication/<int:id_publication>", methods=["GET"])
def api_get_commentaires_publication(id_publication):
    """
    GET /publication/<id> - Récupérer tous les commentaires d'une publication
    
    Returns:
        200: Liste de commentaires organisés en arborescence
        Format: [
            {
                "id_commentaire": 1,
                "contenu": "Commentaire principal",
                "nom_utilisateur": "Alice",
                "reponses": [
                    {"id_commentaire": 2, "contenu": "Réponse", ...}
                ]
            }
        ]
    """
    try:
        commentaires = get_commentaires_publication(id_publication)
        return jsonify(commentaires), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500


@commentaires_bp.route("/publication/<int:id_publication>/count", methods=["GET"])
def api_compter_commentaires(id_publication):
    """
    GET /publication/<id>/count - Compter les commentaires d'une publication
    
    Returns:
        200: {"total": 42}
    """
    try:
        total = compter_commentaires_publication(id_publication)
        return jsonify({"total": total}), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500


@commentaires_bp.route("/<int:id_commentaire>", methods=["GET"])
def api_get_commentaire(id_commentaire):
    """
    GET /<id> - Récupérer un commentaire spécifique
    
    Returns:
        200: Commentaire avec infos utilisateur
        404: Commentaire introuvable
    """
    try:
        commentaire = get_commentaire_par_id(id_commentaire)
        if not commentaire:
            return jsonify({"erreur": "Commentaire introuvable"}), 404
        return jsonify(commentaire), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500


@commentaires_bp.route("/<int:id_commentaire>", methods=["PUT"])
def api_modifier_commentaire(id_commentaire):
    """
    PUT /<id> - Modifier un commentaire
    
    Body JSON:
        {
            "id_utilisateur": 1,  // Pour vérification
            "contenu": "Nouveau contenu"
        }
    
    Returns:
        200: Commentaire modifié
        400: Erreur de validation
        403: Pas autorisé (pas l'auteur)
    """
    data = request.get_json(silent=True) or {}
    
    id_utilisateur = data.get("id_utilisateur")
    contenu = data.get("contenu")
    
    if not id_utilisateur or not contenu:
        return jsonify({"erreur": "id_utilisateur et contenu requis"}), 400
    
    try:
        success = modifier_commentaire(id_commentaire, int(id_utilisateur), contenu)
        if success:
            return jsonify({"message": "Commentaire modifié"}), 200
        else:
            return jsonify({"erreur": "Non autorisé ou commentaire introuvable"}), 403
    except ValueError as e:
        return jsonify({"erreur": str(e)}), 400
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500


@commentaires_bp.route("/<int:id_commentaire>", methods=["DELETE"])
def api_supprimer_commentaire(id_commentaire):
    """
    DELETE /<id> - Supprimer un commentaire
    
    Body JSON:
        {
            "id_utilisateur": 1  // Pour vérification
        }
    
    Returns:
        200: Commentaire supprimé
        403: Pas autorisé
    """
    data = request.get_json(silent=True) or {}
    id_utilisateur = data.get("id_utilisateur")
    
    if not id_utilisateur:
        return jsonify({"erreur": "id_utilisateur requis"}), 400
    
    try:
        success = supprimer_commentaire(id_commentaire, int(id_utilisateur))
        if success:
            return jsonify({"message": "Commentaire supprimé"}), 200
        else:
            return jsonify({"erreur": "Non autorisé ou commentaire introuvable"}), 403
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500


@commentaires_bp.route("/utilisateur/<int:id_utilisateur>", methods=["GET"])
def api_get_commentaires_utilisateur(id_utilisateur):
    """
    GET /utilisateur/<id> - Récupérer tous les commentaires d'un utilisateur
    
    Returns:
        200: Liste des commentaires de l'utilisateur
    """
    try:
        commentaires = get_commentaires_utilisateur(id_utilisateur)
        return jsonify(commentaires), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500
