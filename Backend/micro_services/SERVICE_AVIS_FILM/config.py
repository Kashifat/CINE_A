import pymysql
from pymysql.cursors import DictCursor

# Configuration MariaDB
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'cinea',
    'charset': 'utf8mb4',
    'cursorclass': DictCursor
}

SECRET_KEY = "cinea_avis_key"

def get_db_connection():
    """Établit une connexion à MariaDB"""
    try:
        conn = pymysql.connect(**DB_CONFIG)
        return conn
    except pymysql.Error as e:
        print(f"Erreur de connexion MariaDB: {e}")
        return None
