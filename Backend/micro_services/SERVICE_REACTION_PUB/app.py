from flask import Flask
from flask_cors import CORS
from routes import reactions_bp

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False  # Accepte URLs avec ou sans slash final
    CORS(app)
    app.register_blueprint(reactions_bp, url_prefix="/reactions")
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(port=5008, debug=True)
