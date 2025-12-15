from flask import Blueprint, request, jsonify
from models import (
    creer_notification,
    lister_notifications_utilisateur,
    marquer_notification_lue,
    marquer_toutes_lues,
    supprimer_notifications_anciennes,
    obtenir_nombre_non_lues
)

# ============================================================================
# ROUTES API - SERVICE NOTIFICATION
# ============================================================================
# Endpoints pour gérer les notifications sociales (likes, commentaires, réponses)
# ============================================================================

notifications_bp = Blueprint("notifications", __name__)


# ===========================================
# 1. CRÉER UNE NOTIFICATION
# ===========================================
@notifications_bp.route("/", methods=["POST"])
def api_creer_notification():
    """
    POST / - Créer une notification
    
    Body JSON:
        {
            "id_utilisateur_cible": 1,
            "id_utilisateur_source": 2,
            "type_notification": "like_publication",  # like_publication | commentaire_publication | reponse_commentaire
            "id_publication": 123,                     # Optionnel
            "id_commentaire": 456,                     # Optionnel
            "message": "Alice a aimé votre publication" # Optionnel (auto-généré si absent)
        }
    
    Responses:
        201: {notification créée avec tous les détails}
        400: {"erreur": "..."}
        500: {"erreur": "..."}
    
    Cas d'usage:
        • Quelqu'un aime une publication → type: like_publication + id_publication
        • Quelqu'un commente → type: commentaire_publication + id_publication
        • Quelqu'un répond à un commentaire → type: reponse_commentaire + id_commentaire
    """
    data = request.get_json(silent=True) or {}
    
    # Validation
    if not data.get("id_utilisateur_cible") or not data.get("id_utilisateur_source"):
        return jsonify({"erreur": "id_utilisateur_cible et id_utilisateur_source requis"}), 400
    
    if not data.get("type_notification"):
        return jsonify({"erreur": "type_notification requis"}), 400
    
    try:
        notif = creer_notification(
            int(data["id_utilisateur_cible"]),
            int(data["id_utilisateur_source"]),
            data["type_notification"],
            id_publication=data.get("id_publication"),
            id_commentaire=data.get("id_commentaire"),
            message=data.get("message")
        )
        return jsonify(notif), 201
    except ValueError as e:
        print(f"❌ ValueError: {str(e)}")
        return jsonify({"erreur": str(e)}), 400
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"erreur": str(e)}), 500


# ===========================================
# 2. LISTER LES NOTIFICATIONS D'UN UTILISATEUR
# ===========================================
@notifications_bp.route("/<int:id_utilisateur>", methods=["GET"])
def api_lister_notifications(id_utilisateur):
    """
    GET /<id_utilisateur> - Lister les notifications d'un utilisateur
    
    Query Parameters:
        ?uniquement_non_lues=true  (optionnel, par défaut: false)
    
    Responses:
        200: [{notification1}, {notification2}, ...]
        400: {"erreur": "..."}
    
    Exemples:
        • Toutes les notifications:  GET /1
        • Seulement non-lues:        GET /1?uniquement_non_lues=true
    
    Retour:
        [
            {
                "id_notification": 1,
                "id_utilisateur_cible": 1,
                "id_utilisateur_source": 2,
                "type_notification": "like_publication",
                "id_publication": 123,
                "id_commentaire": null,
                "message": "Alice a aimé votre publication ❤️",
                "est_lu": 0,
                "date_creation": "2025-12-08 10:30:45",
                "nom_source": "Alice",
                "photo_source": "photos_profil/alice.jpg"
            },
            ...
        ]
    """
    try:
        # Récupérer le paramètre query
        uniquement_non_lues = request.args.get("uniquement_non_lues", "false").lower() == "true"
        
        notifs = lister_notifications_utilisateur(id_utilisateur, uniquement_non_lues)
        return jsonify(notifs), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500


# ===========================================
# 3. MARQUER UNE NOTIFICATION COMME LUE
# ===========================================
@notifications_bp.route("/<int:id_notification>/lue", methods=["PUT"])
def api_marquer_notification_lue(id_notification):
    """
    PUT /<id_notification>/lue - Marquer une notification comme lue
    
    Body JSON:
        {
            "id_utilisateur": 1  # Vérification de propriété
        }
    
    Responses:
        200: {"message": "Notification marquée comme lue"}
        401: {"erreur": "Vous ne pouvez pas modifier cette notification"}
        400: {"erreur": "..."}
    
    Sécurité:
        - Vérifie que c'est l'utilisateur propriétaire qui la marque lue
        - Empêche quelqu'un de marquer les notifications d'un autre comme lues
    """
    data = request.get_json(silent=True) or {}
    id_utilisateur = data.get("id_utilisateur")
    
    if not id_utilisateur:
        return jsonify({"erreur": "id_utilisateur requis"}), 400
    
    try:
        success = marquer_notification_lue(id_notification, int(id_utilisateur))
        if success:
            return jsonify({"message": "Notification marquée comme lue"}), 200
        else:
            return jsonify({"erreur": "Notification introuvable ou accès refusé"}), 401
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500


# ===========================================
# 4. MARQUER TOUTES LES NOTIFICATIONS COMME LUES
# ===========================================
@notifications_bp.route("/<int:id_utilisateur>/lues", methods=["PUT"])
def api_marquer_toutes_lues(id_utilisateur):
    """
    PUT /<id_utilisateur>/lues - Marquer TOUTES les notifications comme lues
    
    Responses:
        200: {"message": "5 notifications marquées comme lues", "nombre": 5}
    
    Cas d'usage:
        • Bouton "Marquer tout comme lu" dans le panneau notifications
    """
    try:
        nombre = marquer_toutes_lues(id_utilisateur)
        return jsonify({
            "message": f"{nombre} notifications marquées comme lues",
            "nombre": nombre
        }), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500


# ===========================================
# 5. OBTENIR LE NOMBRE DE NOTIFICATIONS NON LUES
# ===========================================
@notifications_bp.route("/<int:id_utilisateur>/non-lues", methods=["GET"])
def api_obtenir_non_lues(id_utilisateur):
    """
    GET /<id_utilisateur>/non-lues - Obtenir le nombre de notifications non lues
    
    Responses:
        200: {"nombre": 5}
    
    Cas d'usage:
        • Afficher un badge de notification avec le nombre non lu
        • Exemple: "🔔 5" ou "🔔 (5)"
    
    Exemple frontend:
        const response = await fetch(`http://localhost:5010/notifications/1/non-lues`);
        const data = await response.json();
        console.log(`Vous avez ${data.nombre} notifications non lues`);
    """
    try:
        nombre = obtenir_nombre_non_lues(id_utilisateur)
        return jsonify({"nombre": nombre}), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500


# ===========================================
# 6. NETTOYER LES VIEILLES NOTIFICATIONS (Admin/Cron)
# ===========================================
@notifications_bp.route("/maintenance/nettoyer", methods=["POST"])
def api_nettoyer_notifications():
    """
    POST /maintenance/nettoyer - Supprimer les notifications de plus de 3 mois
    
    Responses:
        200: {"message": "42 notifications supprimées", "nombre": 42}
    
    Cas d'usage:
        • À exécuter via un cron job tous les jours/semaines
        • Ou via admin panel pour maintenance manuelle
    
    Exemple cron (tous les jours à 2h du matin):
        0 2 * * * curl -X POST http://localhost:5010/notifications/maintenance/nettoyer
    
    À implémenter en frontend si vous voulez:
        // Admin panel
        const response = await fetch(`http://localhost:5010/notifications/maintenance/nettoyer`, {
            method: 'POST'
        });
        const data = await response.json();
        console.log(`${data.nombre} notifications supprimées`);
    """
    try:
        nombre = supprimer_notifications_anciennes()
        return jsonify({
            "message": f"{nombre} notifications supprimées",
            "nombre": nombre
        }), 200
    except Exception as e:
        return jsonify({"erreur": str(e)}), 500
