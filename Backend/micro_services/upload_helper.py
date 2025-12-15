"""
Helper pour l'upload de fichiers (images, vidéos) dans le Serveur_Local
"""
import os
from datetime import datetime
import uuid
from werkzeug.utils import secure_filename

# Chemin racine du Serveur_Local (2 niveaux au-dessus de micro_services)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVEUR_LOCAL_PATH = os.path.join(BASE_DIR, "Serveur_Local")

# Extensions autorisées
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'avi', 'mkv', 'mov', 'webm'}
ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}


def allowed_file(filename, file_type):
    """Vérifie si l'extension du fichier est autorisée"""
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    if file_type == 'video':
        return ext in ALLOWED_VIDEO_EXTENSIONS
    elif file_type == 'image':
        return ext in ALLOWED_IMAGE_EXTENSIONS
    return False


def save_uploaded_file(file, subfolder, file_type, prefix="file"):
    """
    Sauvegarde un fichier uploadé dans Serveur_Local
    
    Args:
        file: Fichier Flask (request.files['...'])
        subfolder: Sous-dossier dans Serveur_Local (ex: "films", "images", "episodes")
        file_type: Type de fichier ("video" ou "image")
        prefix: Préfixe pour le nom du fichier (ex: "film_vo", "affiche_film")
    
    Returns:
        dict: {
            "succes": bool,
            "chemin_relatif": str (chemin relatif pour la BD, ex: "films/film_vo_20250101_123456_abc123.mp4"),
            "erreur": str (si succes=False)
        }
    """
    try:
        # Vérifier que le fichier existe
        if not file or file.filename == '':
            return {"succes": False, "erreur": "Aucun fichier fourni"}
        
        # Vérifier l'extension
        if not allowed_file(file.filename, file_type):
            return {"succes": False, "erreur": f"Extension de fichier non autorisée pour {file_type}"}
        
        # Obtenir l'extension
        ext = file.filename.rsplit('.', 1)[1].lower()
        
        # Générer un nom de fichier unique avec timestamp + uuid court
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        nouveau_nom = f"{prefix}_{timestamp}_{unique_id}.{ext}"
        
        # Construire le chemin complet
        dossier_destination = os.path.join(SERVEUR_LOCAL_PATH, subfolder)
        chemin_complet = os.path.join(dossier_destination, nouveau_nom)
        
        # Créer le dossier s'il n'existe pas
        os.makedirs(dossier_destination, exist_ok=True)
        
        # Sauvegarder le fichier
        file.save(chemin_complet)
        
        # Retourner le chemin relatif pour la BD (ex: "films/film_vo_20250101_123456_abc123.mp4")
        chemin_relatif = f"{subfolder}/{nouveau_nom}"
        
        return {
            "succes": True,
            "chemin_relatif": chemin_relatif,
            "chemin_complet": chemin_complet
        }
        
    except Exception as e:
        return {"succes": False, "erreur": f"Erreur lors de la sauvegarde: {str(e)}"}


def delete_file(chemin_relatif):
    """
    Supprime un fichier du Serveur_Local
    
    Args:
        chemin_relatif: Chemin relatif (ex: "films/film_vo_20250101_123456_abc123.mp4")
    
    Returns:
        dict: {"succes": bool, "erreur": str}
    """
    try:
        chemin_complet = os.path.join(SERVEUR_LOCAL_PATH, chemin_relatif)
        
        if os.path.exists(chemin_complet):
            os.remove(chemin_complet)
            return {"succes": True}
        else:
            return {"succes": False, "erreur": "Fichier introuvable"}
            
    except Exception as e:
        return {"succes": False, "erreur": f"Erreur lors de la suppression: {str(e)}"}


# Alias pour compatibilité avec service_utilisateur
delete_file_from_server = delete_file
