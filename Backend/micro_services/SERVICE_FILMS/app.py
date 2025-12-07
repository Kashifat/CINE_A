from flask import Flask
from flask_cors import CORS
from routes import films_bp
from static import configure_static_routes

app = Flask(__name__)
app.url_map.strict_slashes = False  # Accepte URLs avec ou sans slash final
CORS(app)
app.register_blueprint(films_bp, url_prefix="/contenus")

# Configuration des routes pour les fichiers statiques
configure_static_routes(app)

if __name__ == "__main__":
    app.run(port=5002, debug=True)
