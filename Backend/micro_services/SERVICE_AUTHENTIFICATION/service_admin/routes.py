from flask import Blueprint, request, jsonify
from models import (
    admin_login,
    valider_publication, supprimer_publication_admin,
    liste_publications_non_validees, statistiques_globales,
    creer_admin, lister_admins, obtenir_admin, modifier_admin, supprimer_admin,
    lister_utilisateurs_admin, modifier_utilisateur_admin, supprimer_utilisateur_admin
)

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")

# ========== AUTHENTIFICATION ==========
@admin_bp.route("/login", methods=["POST"])
def login_admin():
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    result, status = admin_login(data)
    return jsonify(result), status

# ========== GESTION DES ADMINS ==========
@admin_bp.route("/admins", methods=["GET"])
def liste_admins():
    """Lister tous les administrateurs"""
    return jsonify(lister_admins())

@admin_bp.route("/admins", methods=["POST"])
def creer_nouvel_admin():
    """Créer un nouvel administrateur"""
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    result, status = creer_admin(data)
    return jsonify(result), status

@admin_bp.route("/admins/<int:admin_id>", methods=["GET"])
def obtenir_admin_par_id(admin_id):
    """Obtenir un administrateur par ID"""
    admin = obtenir_admin(admin_id)
    if not admin:
        return jsonify({"erreur": "Administrateur non trouvé"}), 404
    return jsonify(admin)

@admin_bp.route("/admins/<int:admin_id>", methods=["PUT"])
def modifier_admin_route(admin_id):
    """Modifier un administrateur"""
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    result, status = modifier_admin(admin_id, data)
    return jsonify(result), status

@admin_bp.route("/admins/<int:admin_id>", methods=["DELETE"])
def supprimer_admin_route(admin_id):
    """Supprimer un administrateur"""
    result, status = supprimer_admin(admin_id)
    return jsonify(result), status

# ========== GESTION DES UTILISATEURS (VUE ADMIN) ==========
@admin_bp.route("/utilisateurs", methods=["GET"])
def liste_utilisateurs():
    """Lister tous les utilisateurs avec leurs abonnements"""
    return jsonify(lister_utilisateurs_admin())

@admin_bp.route("/utilisateurs/<int:user_id>", methods=["PUT"])
def modifier_utilisateur_route(user_id):
    """Modifier un utilisateur"""
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    result, status = modifier_utilisateur_admin(user_id, data)
    return jsonify(result), status

@admin_bp.route("/utilisateurs/<int:user_id>", methods=["DELETE"])
def supprimer_utilisateur_route(user_id):
    """Supprimer un utilisateur"""
    result, status = supprimer_utilisateur_admin(user_id)
    return jsonify(result), status

# ========== MODÉRATION DES PUBLICATIONS ==========
@admin_bp.route("/publications/non-validees", methods=["GET"])
def publications_en_attente():
    """Liste des publications en attente de validation"""
    return jsonify(liste_publications_non_validees())

@admin_bp.route("/publications/<int:pub_id>/valider", methods=["POST"])
def valider(pub_id):
    """Valider une publication"""
    return jsonify(valider_publication(pub_id))

@admin_bp.route("/publications/<int:pub_id>", methods=["DELETE"])
def supprimer(pub_id):
    """Supprimer une publication"""
    return jsonify(supprimer_publication_admin(pub_id))

# ========== STATISTIQUES ==========
@admin_bp.route("/statistiques", methods=["GET"])
def stats():
    """Obtenir les statistiques globales de la plateforme"""
    result = statistiques_globales()
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result)
