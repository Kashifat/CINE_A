from flask import Blueprint, request, jsonify
from models import ajouter_historique, get_historique_utilisateur, maj_position

# ============================================================================
# ROUTES API - SERVICE HISTORIQUE
# ============================================================================
# Endpoints pour gérer l'historique de visionnage des utilisateurs
# ============================================================================

historique_bp = Blueprint("historique", __name__)

@historique_bp.route("/", methods=["POST"])
def ajout():
    """
    POST / - Créer un nouvel historique de visionnage
    
    Body JSON:
        {
            "utilisateur_id": 1,
            "film_id": 5,
            "position": "00:00:00"  # Optionnel, par défaut "00:00:00"
        }
    
    Responses:
        201: {"message": "Historique ajouté ✅", "id": 42}
        400: {"erreur": "utilisateur_id et film_id requis"}
    
    Usage: Appelé au démarrage de la lecture d'un nouveau film
    """
    data = request.get_json()
    result = ajouter_historique(data)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result), 201

@historique_bp.route("/<int:uid>", methods=["GET"])
def liste(uid):
    """
    GET /<utilisateur_id> - Récupérer l'historique d'un utilisateur
    
    Params:
        uid (int): ID de l'utilisateur
    
    Response:
        200: [
            {
                "id": 42,
                "titre": "Inception",
                "position": "00:15:30",
                "date_visionnage": "2025-11-21..."
            },
            ...
        ]
    
    Usage: Afficher "Continuer à regarder" sur la page d'accueil
    """
    return jsonify(get_historique_utilisateur(uid))

@historique_bp.route("/maj/<int:hid>", methods=["PUT"])
def update(hid):
    """
    PUT /maj/<historique_id> - Mettre à jour la position de lecture
    
    Params:
        hid (int): ID de l'historique
    
    Body JSON:
        {
            "position": "00:15:30"  # Format HH:MM:SS
        }
    
    Responses:
        200: {"message": "Position mise à jour ✅"}
        404: {"erreur": "Historique introuvable"}
    
    Usage: Appelé toutes les 30 secondes pendant la lecture
    Exemple de flux frontend:
        setInterval(() => {
            fetch(`/maj/${historique_id}`, {
                method: 'PUT',
                body: JSON.stringify({position: video.currentTime})
            })
        }, 30000)
    """
    data = request.get_json()
    result = maj_position(hid, data["position"])
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result)
