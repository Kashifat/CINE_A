from flask import Blueprint, request, jsonify
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
