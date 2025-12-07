from flask import Blueprint, request, jsonify
from models import (
    obtenir_publication,
    supprimer_publication,
    statistiques_publication,
    creer_publication,
    lister_publications,
)
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from upload_helper import save_uploaded_file

publications_bp = Blueprint("publications", __name__)


@publications_bp.route("/upload-image/", methods=["POST"])
def upload_image():
    """Upload une image pour une publication"""
    if 'image' not in request.files:
        return jsonify({"erreur": "Aucun fichier fourni"}), 400
    
    file = request.files['image']
    if not file.filename:
        return jsonify({"erreur": "Nom de fichier vide"}), 400
    
    result = save_uploaded_file(file, subfolder='images', file_type='image', prefix='publication')
    
    if not result.get("succes"):
        return jsonify({"erreur": result.get("erreur")}), 400
    
    # Retourner l'URL construite
    image_url = f"http://localhost:5002/media/{result['chemin_relatif']}"
    return jsonify({
        "succes": True,
        "url": image_url,
        "chemin_relatif": result['chemin_relatif']
    }), 201


@publications_bp.route("/", methods=["POST"])
def api_creer_publication():
    """Créer une publication avec ou sans image"""
    
    # Vérifier si c'est du multipart/form-data (avec fichier) ou du JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        # Récupérer les données du form
        utilisateur_id = request.form.get("id_utilisateur")
        contenu = request.form.get("contenu", "")
        
        image_url = None
        if 'image' in request.files:
            file = request.files['image']
            if file.filename:
                # Sauvegarder l'image
                result = save_uploaded_file(file, subfolder='images', file_type='image', prefix='publication')
                if result.get("succes"):
                    image_url = f"http://localhost:5002/media/{result['chemin_relatif']}"
                else:
                    return jsonify({"erreur": result.get("erreur")}), 400
    else:
        # JSON classique
        data = request.get_json(silent=True) or {}
        utilisateur_id = data.get("id_utilisateur")
        contenu = data.get("contenu", "")
        image_url = data.get("image")  # URL déjà existante

    try:
        pub = creer_publication(int(utilisateur_id), contenu, image_url)
    except (TypeError, ValueError):
        return jsonify({"erreur": "Champ 'id_utilisateur' invalide ou manquant."}), 400

    return jsonify(pub), 201


@publications_bp.route("/", methods=["GET"])
def api_lister_publications():
    utilisateur_id = request.args.get("id_utilisateur", default=None, type=int)  # Utiliser id_utilisateur
    rows = lister_publications(utilisateur_id)
    return jsonify(rows)


@publications_bp.route("/<int:pub_id>", methods=["GET"])
def api_obtenir_publication(pub_id):
    row = obtenir_publication(pub_id)
    if not row:
        return jsonify({"erreur": "Publication introuvable."}), 404
    return jsonify(row)


@publications_bp.route("/<int:pub_id>", methods=["PUT"])
def api_modifier_publication(pub_id):
    """Modifier une publication existante"""
    data = request.get_json(silent=True) or {}
    contenu = data.get("contenu")
    
    if not contenu or not contenu.strip():
        return jsonify({"erreur": "Le contenu est requis"}), 400
    
    from models import modifier_publication
    pub = modifier_publication(pub_id, contenu)
    
    if not pub:
        return jsonify({"erreur": "Publication introuvable."}), 404
    
    return jsonify(pub), 200


@publications_bp.route("/<int:pub_id>", methods=["DELETE"])
def api_supprimer_publication(pub_id):
    ok = supprimer_publication(pub_id)
    if not ok:
        return jsonify({"erreur": "Publication introuvable."}), 404
    return ("", 204)


@publications_bp.route("/<int:pub_id>/statistiques", methods=["GET"])
def api_statistiques_publication(pub_id):
    stats = statistiques_publication(pub_id)
    if stats is None:
        return jsonify({"erreur": "Publication introuvable."}), 404
    return jsonify(stats)

