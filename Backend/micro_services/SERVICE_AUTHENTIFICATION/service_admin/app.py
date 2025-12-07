from flask import Flask
from routes import admin_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
    app.run(port=5004, debug=True)
