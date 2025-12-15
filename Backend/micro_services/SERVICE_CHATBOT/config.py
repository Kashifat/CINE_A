"""Configuration du Service Chatbot CinéA"""

SERVICE_NAME = "SERVICE_CHATBOT_CINEA"
SERVICE_HOST = "127.0.0.1"
SERVICE_PORT = 5012

# Répertoires RAG
DATA_DIR = "data"          # Documents pour le RAG (films, séries, infos plateforme)
PERSIST_DIR = "storage"    # Stockage de l'index vectoriel

# Configuration modèle IA
DEFAULT_MODEL_TYPE = "openai"  # 'openai' ou 'ollama'
# IMPORTANT : Si vous changez de modèle, SUPPRIMEZ le dossier `storage/` avant redémarrage.
DEFAULT_MODEL_NAME = "gpt-5"  # Pour OpenAI: gpt-3.5-turbo, gpt-4, gpt-4-turbo, gpt-4o


# Nombre de passages similaires à récupérer dans le RAG
DEFAULT_TOP_K = 5
