from flask import Flask
from routes import utilisateurs_bp
from flask_cors import CORS

app = Flask(__name__)
app.url_map.strict_slashes = False  # Accepte URLs avec ou sans slash final
CORS(app)  # autorise le frontend React
app.register_blueprint(utilisateurs_bp, url_prefix="/utilisateurs")

if __name__ == "__main__":
    app.run(port=5001, debug=True)
