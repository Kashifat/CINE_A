
import bcrypt

import pymysql
import pymysql.cursors

# ----------------------------------------------
# PARAMÈTRES DE CONNEXION
# ----------------------------------------------
DB_HOST = "localhost"
DB_PORT = 3306
DB_USER = "root"
DB_PASSWORD = ""  # ⚠️ Mets ton mot de passe ici !
DB_NAME = "cinea"
DB_CHARSET = "utf8mb4"


# ----------------------------------------------
# FONCTION DE CONNEXION À LA BASE
# ----------------------------------------------
def get_db_connection():
    """
    Retourne une connexion MariaDB (pymysql)
    Utilisée par tous les fichiers Python.
    """
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset=DB_CHARSET,
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn

    except Exception as e:
        print("❌ ERREUR DE CONNEXION À LA BASE !")
        print(e)
        return None

# ----------------------------------------------
# FONCTIONS DE HACHAGE DE MOT DE PASSE
# ----------------------------------------------

def hasher_mot_de_passe(mot_de_passe: str) -> str:
    """Hash un mot de passe avec bcrypt"""
    sel = bcrypt.gensalt()
    hash_mdp = bcrypt.hashpw(mot_de_passe.encode('utf-8'), sel)


# =======================================
# JWT CONFIGURATION
# =======================================
import jwt
import datetime

JWT_SECRET = "cinea_super_secret_key_change_en_prod_2025"  # À changer en PRODUCTION!
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 jours (24h x 7) pour développement


def create_jwt_token(id_utilisateur, role="user"):
    """Crée un JWT signé avec id_utilisateur et expiration"""
    payload = {
        "id_utilisateur": id_utilisateur,
        "role": role,
        "iat": datetime.datetime.utcnow(),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_jwt_token(token):
    """Vérifie et décode un JWT, retourne le payload ou None"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expiré
    except jwt.InvalidTokenError:
        return None  # Token invalide
    return hash_mdp.decode('utf-8')


def verifier_mot_de_passe(mot_de_passe: str, hash_enregistre: str) -> bool:
    """Vérifie qu'un mot de passe correspond à son hash"""
    return bcrypt.checkpw(mot_de_passe.encode('utf-8'), hash_enregistre.encode('utf-8'))
