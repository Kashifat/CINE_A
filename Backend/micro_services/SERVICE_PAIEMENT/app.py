from flask import Flask
from routes import paiements_bp
from flask_cors import CORS

app = Flask(__name__)
app.url_map.strict_slashes = False  # Accepte URLs avec ou sans slash final
CORS(app)
app.register_blueprint(paiements_bp, url_prefix="/paiements")

if __name__ == "__main__":
    app.run(port=5003, debug=True)
