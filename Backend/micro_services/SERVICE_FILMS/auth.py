"""
Middleware d'authentification pour les endpoints sensibles
Valide que id_utilisateur dans la requête correspond à un utilisateur existant
"""

from flask import request, jsonify
from functools import wraps
from config import get_db_connection

def require_auth_user(f):
    """Décorateur pour vérifier qu'un id_utilisateur valide est fourni"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Récupérer les données JSON ou form
        data = request.get_json() or {}
        id_utilisateur = data.get("id_utilisateur")
        
        # Validation basique
        if not id_utilisateur:
            return jsonify({
                "erreur": "id_utilisateur requis",
                "code": "MISSING_USER_ID"
            }), 400
        
        # Vérifier que l'utilisateur existe
        try:
            conn = get_db_connection()
            if conn is None:
                return jsonify({
                    "erreur": "Connexion base de données indisponible",
                    "code": "DB_ERROR"
                }), 500
            
            cur = conn.cursor()
            cur.execute(
                "SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur = %s",
                (id_utilisateur,)
            )
            utilisateur = cur.fetchone()
            conn.close()
            
            if not utilisateur:
                return jsonify({
                    "erreur": f"Utilisateur {id_utilisateur} inexistant",
                    "code": "USER_NOT_FOUND"
                }), 404
            
        except Exception as e:
            return jsonify({
                "erreur": f"Erreur authentification: {str(e)}",
                "code": "AUTH_ERROR"
            }), 500
        
        # Appeler la fonction protégée
        return f(*args, **kwargs)
    
    return decorated_function
