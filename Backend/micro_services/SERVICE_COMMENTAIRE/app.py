from flask import Flask
from flask_cors import CORS
from routes import commentaires_bp

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False  # Accepte URLs avec ou sans slash final
    CORS(app)
    app.register_blueprint(commentaires_bp, url_prefix="/commentaires")
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=5009, debug=True)
