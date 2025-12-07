
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
    return hash_mdp.decode('utf-8')


def verifier_mot_de_passe(mot_de_passe: str, hash_enregistre: str) -> bool:
    """Vérifie qu'un mot de passe correspond à son hash"""
    try:
        return bcrypt.checkpw(mot_de_passe.encode('utf-8'), hash_enregistre.encode('utf-8'))
    except ValueError:
        # Hash invalide (ex: mot de passe en clair ou format non bcrypt)
        return False
