from flask import Blueprint, request, jsonify
from models import (
    ajouter_utilisateur,
    verifier_connexion,
    obtenir_utilisateur_par_id,
    lister_utilisateurs,
    modifier_utilisateur,
    supprimer_utilisateur,
    lister_abonnements,
    changer_abonnement,
    obtenir_profil_complet,
    mettre_a_jour_photo_profil,
    modifier_profil_complet,
)
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from upload_helper import save_uploaded_file, delete_file_from_server

utilisateurs_bp = Blueprint("utilisateurs", __name__)

# ========== AUTHENTIFICATION ==========
@utilisateurs_bp.route("/inscription", methods=["POST"])
def inscription():
    """Inscription d'un nouvel utilisateur"""
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    result, status = ajouter_utilisateur(data)
    return jsonify(result), status

@utilisateurs_bp.route("/connexion", methods=["POST"])
def connexion():
    """Connexion utilisateur"""
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    result, status = verifier_connexion(data)
    return jsonify(result), status

# ========== GESTION DES UTILISATEURS ==========
@utilisateurs_bp.route("/", methods=["GET"])
def lister():
    """Lister les utilisateurs (avec pagination)"""
    utilisateurs = lister_utilisateurs()
    return jsonify(utilisateurs)

@utilisateurs_bp.route("/<int:user_id>", methods=["GET"])
def obtenir_par_id(user_id):
    """Obtenir un utilisateur par ID"""
    utilisateur = obtenir_utilisateur_par_id(user_id)
    if utilisateur is None:
        return jsonify({"erreur": "Utilisateur introuvable"}), 404
    return jsonify(utilisateur)

@utilisateurs_bp.route("/<int:user_id>", methods=["PUT"])
def modifier(user_id):
    """Modifier un utilisateur"""
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    result, status = modifier_utilisateur(user_id, data)
    return jsonify(result), status

@utilisateurs_bp.route("/<int:user_id>", methods=["DELETE"])
def supprimer(user_id):
    """Supprimer un utilisateur"""
    result, status = supprimer_utilisateur(user_id)
    return jsonify(result), status

# ========== PROFIL UTILISATEUR ==========
@utilisateurs_bp.route("/<int:user_id>/profil", methods=["GET"])
def profil_complet(user_id):
    """Obtenir le profil complet avec statistiques"""
    profil = obtenir_profil_complet(user_id)
    if profil is None:
        return jsonify({"erreur": "Utilisateur introuvable"}), 404
    return jsonify(profil)

# ========== ABONNEMENTS ==========
@utilisateurs_bp.route("/abonnements", methods=["GET"])
def liste_abonnements():
    """Lister tous les types d'abonnements disponibles"""
    return jsonify(lister_abonnements())

@utilisateurs_bp.route("/<int:user_id>/abonnement", methods=["PUT"])
def modifier_abonnement(user_id):
    """Changer l'abonnement d'un utilisateur"""
    data = request.get_json()
    if not data or "abonnement_id" not in data:
        return jsonify({"erreur": "abonnement_id requis"}), 400
    result, status = changer_abonnement(user_id, data["abonnement_id"])
    return jsonify(result), status

# ========== RECHERCHE ==========
@utilisateurs_bp.route("/recherche", methods=["GET"])
def recherche():
    """Rechercher des utilisateurs"""
    q = request.args.get("q", "")
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 50))
    resultat = lister_utilisateurs(page=page, page_size=page_size, q=q)
    return jsonify(resultat)

# ========== UPLOAD PHOTO DE PROFIL ==========
@utilisateurs_bp.route("/<int:user_id>/photo", methods=["POST"])
def upload_photo_profil(user_id):
    """Upload de la photo de profil"""
    if 'photo' not in request.files:
        return jsonify({"erreur": "Aucun fichier fourni"}), 400
    
    file = request.files['photo']
    
    # Sauvegarder le fichier
    result = save_uploaded_file(file, subfolder='images', file_type='image', prefix=f'profil_{user_id}')
    
    if not result.get("succes"):
        return jsonify({"erreur": result.get("erreur")}), 400
    
    # Mettre à jour la base de données avec le chemin relatif
    update_result, status = mettre_a_jour_photo_profil(user_id, result["chemin_relatif"])
    
    # Construire l'URL pour le frontend
    if status == 200:
        url_photo = f"http://localhost:5002/media/{result['chemin_relatif']}"
        update_result["photo_profil"] = url_photo
    
    return jsonify(update_result), status

@utilisateurs_bp.route("/<int:user_id>/photo", methods=["DELETE"])
def supprimer_photo_profil(user_id):
    """Supprimer la photo de profil"""
    # Récupérer l'utilisateur
    utilisateur = obtenir_utilisateur_par_id(user_id)
    if not utilisateur:
        return jsonify({"erreur": "Utilisateur introuvable"}), 404
    
    if utilisateur.get("photo_profil"):
        # delete_file_from_server s'attend à une URL complète
        # obtenir_utilisateur_par_id retourne déjà une URL
        delete_file_from_server(utilisateur["photo_profil"])
    
    # Mettre à jour la BD (NULL)
    update_result, status = mettre_a_jour_photo_profil(user_id, None)
    return jsonify(update_result), status

# ========== MODIFICATION COMPLÈTE DU PROFIL ==========
@utilisateurs_bp.route("/<int:user_id>/profil", methods=["PUT"])
def modifier_profil(user_id):
    """Modifier le profil complet (nom, email, mot de passe)"""
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    
    result, status = modifier_profil_complet(user_id, data)
    return jsonify(result), status
