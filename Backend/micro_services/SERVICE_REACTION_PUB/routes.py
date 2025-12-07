from flask import Blueprint, request, jsonify
from models import (
    ajouter_reaction,
    supprimer_reaction,
    get_reactions_publication,
    verifier_reaction_utilisateur,
    get_statistiques_reactions
)

reactions_bp = Blueprint("reactions", __name__)

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
