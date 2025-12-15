from flask import Flask
from flask_cors import CORS
from routes import notifications_bp

# ============================================================================
# SERVICE NOTIFICATION - Application Flask
# ============================================================================
# Microservice gérant les notifications sociales (likes, commentaires, réponses)
# Port: 5010 (suivant la séquence 5001-5009)
# ============================================================================

def create_app():
    """Initialiser l'application Flask avec configuration CORS"""
    app = Flask(__name__)
    
    # =====================================================
    # CORS Configuration - Autoriser toutes les origines
    # =====================================================
    CORS(app, resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # =====================================================
    # Enregistrement du Blueprint
    # =====================================================
    app.register_blueprint(notifications_bp, url_prefix="/notifications")
    
    # =====================================================
    # Route de santé (Health Check)
    # =====================================================
    @app.route("/health", methods=["GET"])
    def health_check():
        """
        Vérifier que le service est actif
        Utilisé par le gateway pour le load balancing
        """
        return {"status": "ok", "service": "SERVICE_NOTIFICATION"}, 200
    
    return app


if __name__ == "__main__":
    """Lancer le serveur de développement"""
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=5010,
        debug=True
    )
