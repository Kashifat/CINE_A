"""
Module de gestion des uploads de fichiers
Sauvegarde les fichiers dans Serveur_Local et retourne les CHEMINS RELATIFS
"""
import os
from werkzeug.utils import secure_filename
from datetime import datetime
import uuid

# Chemin vers le serveur local (Backend/Serveur_Local)
SERVEUR_LOCAL = os.path.join(os.path.dirname(__file__), '..', 'Serveur_Local')
SERVEUR_LOCAL = os.path.abspath(SERVEUR_LOCAL)

# Extensions autorisées
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mkv', 'avi', 'mov', 'webm'}

def allowed_file(filename, file_type='image'):
    """Vérifie si l'extension du fichier est autorisée"""
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    if file_type == 'image':
        return ext in ALLOWED_IMAGE_EXTENSIONS
    elif file_type == 'video':
        return ext in ALLOWED_VIDEO_EXTENSIONS
    return False

def save_uploaded_file(file, subfolder='images', file_type='image', prefix=''):
    """
    Sauvegarde un fichier uploadé dans le serveur local
    
    Args:
        file: FileStorage object from Flask
        subfolder: Sous-dossier dans Serveur_Local (images, films, bande_annonces, etc.)
        file_type: Type de fichier ('image' ou 'video')
        prefix: Préfixe optionnel pour le nom du fichier
        
    Returns:
        dict: {"succes": True, "chemin_relatif": "films/video.mp4", "chemin_absolu": "..."}
              ou {"succes": False, "erreur": "..."}
    """
    
    if not file:
        return {"succes": False, "erreur": "Aucun fichier fourni"}
    
    if file.filename == '':
        return {"succes": False, "erreur": "Nom de fichier vide"}
    
    if not allowed_file(file.filename, file_type):
        extensions = ALLOWED_IMAGE_EXTENSIONS if file_type == 'image' else ALLOWED_VIDEO_EXTENSIONS
        return {"succes": False, "erreur": f"Extension non autorisée. Extensions valides: {', '.join(extensions)}"}
    
    try:
        # Créer un nom de fichier unique
        original_filename = secure_filename(file.filename)
        extension = original_filename.rsplit('.', 1)[1].lower()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        
        if prefix:
            filename = f"{prefix}_{timestamp}_{unique_id}.{extension}"
        else:
            filename = f"{timestamp}_{unique_id}.{extension}"
        
        # Construire le chemin complet
        folder_path = os.path.join(SERVEUR_LOCAL, subfolder)
        os.makedirs(folder_path, exist_ok=True)
        
        file_path = os.path.join(folder_path, filename)
        
        # Sauvegarder le fichier
        file.save(file_path)
        
        # Construire le chemin relatif (à stocker en BD)
        chemin_relatif = f"{subfolder}/{filename}".replace("\\", "/")
        
        return {
            "succes": True,
            "chemin_relatif": chemin_relatif,  # Ex: "films/video_123.mp4"
            "chemin_absolu": file_path,
            "filename": filename
        }
        
    except Exception as e:
        return {"succes": False, "erreur": f"Erreur lors de la sauvegarde: {str(e)}"}

def delete_file_from_server(url):
    """
    Supprime un fichier du serveur local à partir de son URL
    
    Args:
        url: URL du fichier (ex: http://localhost:5002/media/images/photo.jpg)
        
    Returns:
        dict: {"succes": True} ou {"succes": False, "erreur": "..."}
    """
    try:
        # Extraire le chemin relatif de l'URL
        # Ex: http://localhost:5002/media/images/photo.jpg -> images/photo.jpg
        if '/media/' not in url:
            return {"succes": False, "erreur": "URL invalide"}
        
        relative_path = url.split('/media/')[1]
        file_path = os.path.join(SERVEUR_LOCAL, relative_path)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return {"succes": True, "message": "Fichier supprimé"}
        else:
            return {"succes": False, "erreur": "Fichier introuvable"}
            
    except Exception as e:
        return {"succes": False, "erreur": f"Erreur lors de la suppression: {str(e)}"}
