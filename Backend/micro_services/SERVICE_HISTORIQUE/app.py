from flask import Flask
from routes import historique_bp
from flask_cors import CORS

app = Flask(__name__)
app.url_map.strict_slashes = False  # Accepte URLs avec ou sans slash final
CORS(app)
app.register_blueprint(historique_bp, url_prefix="/historique")

if __name__ == "__main__":
    app.run(port=5005, debug=True)
