from flask import Blueprint, request, jsonify
import requests
from config import get_db_connection
from models import (
    ajouter_reaction,
    supprimer_reaction,
    get_reactions_publication,
    verifier_reaction_utilisateur,
    get_statistiques_reactions
)

reactions_bp = Blueprint("reactions", __name__)

# ============================================================================
# Configuration SERVICE NOTIFICATION
# ============================================================================
NOTIFICATION_SERVICE_URL = "http://localhost:5010/notifications"

def notifier_like_publication(id_utilisateur_source: int, id_publication: int):
    """
    Créer une notification quand quelqu'un aime une publication
    
    ⚠️ Cette fonction est asynchrone et ne doit pas bloquer la réponse
    Si le service notification est down, on log juste l'erreur
    """
    try:
        print(f"🔔 [notifier_like_publication] Tentative de notification: source={id_utilisateur_source}, pub={id_publication}")
        
        # Récupérer les infos du propriétaire de la publication
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id_utilisateur FROM publication WHERE id_publication = %s", (id_publication,))
        result = cur.fetchone()
        conn.close()
        
        print(f"🔔 [notifier_like_publication] Résultat BD: {result}")
        
        if not result:
            print(f"❌ [notifier_like_publication] Publication {id_publication} inexistante")
            return  # Publication inexistante
        
        id_utilisateur_cible = result['id_utilisateur']
        print(f"🔔 [notifier_like_publication] Propriétaire de publication: {id_utilisateur_cible}")
        
        # Ne pas notifier si c'est un self-like
        if id_utilisateur_source == id_utilisateur_cible:
            print(f"⚠️ [notifier_like_publication] Self-like détecté, pas de notification")
            return
        
        # Appeler SERVICE_NOTIFICATION
        payload = {
            "id_utilisateur_cible": id_utilisateur_cible,
            "id_utilisateur_source": id_utilisateur_source,
            "type_notification": "like_publication",
            "id_publication": id_publication
        }
        
        print(f"🔔 [notifier_like_publication] Payload: {payload}")
        print(f"🔔 [notifier_like_publication] URL: {NOTIFICATION_SERVICE_URL + '/'}")
        
        response = requests.post(
            NOTIFICATION_SERVICE_URL + "/",
            json=payload,
            timeout=5
        )
        
        print(f"🔔 [notifier_like_publication] Status code: {response.status_code}")
        
        if response.status_code == 201:
            print(f"✅ [notifier_like_publication] Notification créée avec succès!")
        else:
            print(f"❌ [notifier_like_publication] Erreur {response.status_code}: {response.text}")
    except Exception as e:
        print(f"❌ [notifier_like_publication] Exception: {str(e)}")
        import traceback
        traceback.print_exc()

# Ajouter ou modifier une réaction à une publication
@reactions_bp.route("/", methods=["POST"])
def api_ajouter_reaction():
    data = request.get_json(silent=True) or {}
    utilisateur_id = data.get("id_utilisateur")  # Utiliser id_utilisateur
    publication_id = data.get("id_publication")  # Utiliser id_publication
    type_reaction = data.get("type", "like")  # Par défaut: like
    
    if not utilisateur_id or not publication_id:
        return jsonify({"erreur": "id_utilisateur et id_publication requis"}), 400
    
    # Valider le type de réaction
    types_valides = ['like', 'adore', 'triste', 'rigole', 'surpris', 'en_colere']
    if type_reaction not in types_valides:
        return jsonify({
            "erreur": f"Type de réaction invalide. Types valides: {', '.join(types_valides)}"
        }), 400
    
    try:
        result = ajouter_reaction(int(utilisateur_id), int(publication_id), type_reaction)
        if result:
            # ✅ Créer une notification
            notifier_like_publication(int(utilisateur_id), int(publication_id))
            return jsonify(result), 201
        else:
            return jsonify({"erreur": "Réaction déjà existante avec ce type"}), 409
    except ValueError as e:
        return jsonify({"erreur": str(e)}), 400
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500

# Supprimer une réaction (contrairement à ajouter, supprime quelle que soit le type)
@reactions_bp.route("/", methods=["DELETE"])
def api_supprimer_reaction():
    data = request.get_json(silent=True) or {}
    utilisateur_id = data.get("id_utilisateur")  # Utiliser id_utilisateur
    publication_id = data.get("id_publication")  # Utiliser id_publication
    
    if not utilisateur_id or not publication_id:
        return jsonify({"erreur": "id_utilisateur et id_publication requis"}), 400
    
    try:
        ok = supprimer_reaction(int(utilisateur_id), int(publication_id))
        if ok:
            return jsonify({"message": "Réaction supprimée"}), 200
        else:
            return jsonify({"erreur": "Réaction introuvable"}), 404
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500

# Obtenir toutes les réactions d'une publication (avec détails utilisateurs)
@reactions_bp.route("/publication/<int:publication_id>", methods=["GET"])
def api_get_reactions(publication_id):
    try:
        reactions = get_reactions_publication(publication_id)
        return jsonify(reactions), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500

# Obtenir les statistiques des réactions par type
@reactions_bp.route("/publication/<int:publication_id>/stats", methods=["GET"])
def api_get_statistiques(publication_id):
    try:
        stats = get_statistiques_reactions(publication_id)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500

# Vérifier le type de réaction d'un utilisateur sur une publication
@reactions_bp.route("/check", methods=["GET"])
def api_verifier_reaction():
    utilisateur_id = request.args.get("id_utilisateur", type=int)  # Utiliser id_utilisateur
    publication_id = request.args.get("id_publication", type=int)  # Utiliser id_publication
    
    if not utilisateur_id or not publication_id:
        return jsonify({"erreur": "id_utilisateur et id_publication requis"}), 400
    
    try:
        type_reaction = verifier_reaction_utilisateur(utilisateur_id, publication_id)
        return jsonify({
            "has_reacted": type_reaction is not None,
            "type": type_reaction
        }), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500

# Route alternative pour vérifier la réaction d'un utilisateur (format RESTful)
@reactions_bp.route("/utilisateur/<int:utilisateur_id>/publication/<int:publication_id>", methods=["GET"])
def api_verifier_reaction_utilisateur(utilisateur_id, publication_id):
    """Vérifier la réaction d'un utilisateur spécifique sur une publication"""
    try:
        type_reaction = verifier_reaction_utilisateur(utilisateur_id, publication_id)
        return jsonify({
            "has_reacted": type_reaction is not None,
            "type": type_reaction
        }), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500
