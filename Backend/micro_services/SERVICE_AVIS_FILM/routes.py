from flask import Blueprint, jsonify, request
from models import (
    ajouter_avis, 
    get_avis_film, 
    get_avis_episode,
    get_avis_utilisateur,
    supprimer_avis,
    modifier_avis
)

avis_bp = Blueprint("avis", __name__)

@avis_bp.route("/", methods=["POST"])
def ajout_avis():
    """Ajouter un avis sur un film ou épisode"""
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    
    result = ajouter_avis(data)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result), 201

@avis_bp.route("/film/<int:film_id>", methods=["GET"])
def avis_film(film_id):
    """Obtenir tous les avis d'un film"""
    return jsonify(get_avis_film(film_id)), 200

@avis_bp.route("/episode/<int:episode_id>", methods=["GET"])
def avis_episode(episode_id):
    """Obtenir tous les avis d'un épisode"""
    return jsonify(get_avis_episode(episode_id)), 200

@avis_bp.route("/utilisateur/<int:user_id>", methods=["GET"])
def avis_utilisateur(user_id):
    """Obtenir tous les avis d'un utilisateur"""
    return jsonify(get_avis_utilisateur(user_id)), 200

@avis_bp.route("/<int:avis_id>", methods=["PUT"])
def modifier(avis_id):
    """Modifier un avis"""
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    
    result = modifier_avis(avis_id, data)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result), 200

@avis_bp.route("/<int:avis_id>", methods=["DELETE"])
def delete_avis(avis_id):
    """Supprimer un avis"""
    result = supprimer_avis(avis_id)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result), 200
