from flask import Flask, request, jsonify
from flask_cors import CORS
from routes import publications_bp
import sys
import os

# Importer upload_helper depuis le dossier parent
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from upload_helper import save_uploaded_file

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False  # Accepte URLs avec ou sans slash final
    
    # Configuration CORS plus permissive
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Route upload-image directe (hors Blueprint pour éviter conflit de préfixe)
    @app.route("/upload-image", methods=["OPTIONS"])
    @app.route("/upload-image/", methods=["OPTIONS"])
    def preflight_upload():
        """Gérer les requêtes OPTIONS pour CORS"""
        return "", 204
    
    @app.route("/upload-image", methods=["POST"])
    @app.route("/upload-image/", methods=["POST"])
    def upload_image_direct():
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
    
    app.register_blueprint(publications_bp, url_prefix="/publications")
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=5007, debug=True)
