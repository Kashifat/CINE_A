import os
import pymysql
from pymysql.cursors import DictCursor

# Configuration MariaDB
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '3306')),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'cinea'),
    'charset': 'utf8mb4',
    'cursorclass': DictCursor
}

SECRET_KEY = "cinea_historique_key"

def get_db_connection():
    """Établit une connexion à MariaDB"""
    try:
        conn = pymysql.connect(**DB_CONFIG)
        return conn
    except pymysql.Error as e:
        print(f"Erreur de connexion MariaDB: {e}")
        return None
