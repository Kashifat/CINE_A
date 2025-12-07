"""
Configuration centralisée pour la gestion des médias
- Chemins relatifs stockés en BD
- URLs complètes générées dynamiquement
- Serveur de fichiers statiques unifié
"""
import os

# Chemin absolu vers Serveur_Local
# Depuis SERVICE_FILMS -> micro_services -> Backend -> Serveur_Local
MEDIA_ROOT = os.path.abspath(os.path.join(
    os.path.dirname(__file__), 
    "..",  # micro_services
    "..",  # Backend
    "Serveur_Local"
))

# URL de base pour accéder aux médias
BASE_MEDIA_URL = "http://localhost:5002/media"

# Sous-dossiers dans Serveur_Local
SUBFOLDERS = {
    'films': 'films',
    'series': 'series',
    'episodes': 'episodes',
    'images': 'images',
    'bande_annonces': 'bande_annonces',
    'photos_profil': 'photos_profil'
}


def construire_url_media(chemin_relatif):
    """
    Construit une URL complète à partir d'un chemin relatif
    
    Args:
        chemin_relatif (str): Chemin relatif depuis Serveur_Local
                             Ex: "films/film_vo_20251205.mp4"
    
    Returns:
        str: URL complète ou None si chemin vide
             Ex: "http://localhost:5002/media/films/film_vo_20251205.mp4"
    """
    if not chemin_relatif:
        return None
    
    # Normaliser le chemin (remplacer \ par /)
    chemin_relatif = chemin_relatif.replace("\\", "/")
    
    # Construire l'URL complète
    return f"{BASE_MEDIA_URL}/{chemin_relatif}"


def extraire_chemin_relatif(url_complete):
    """
    Extrait le chemin relatif depuis une URL complète (utile pour migration)
    
    Args:
        url_complete (str): URL complète
                           Ex: "http://localhost:5002/media/films/video.mp4"
    
    Returns:
        str: Chemin relatif ou la chaîne originale si pas une URL
             Ex: "films/video.mp4"
    """
    if not url_complete:
        return None
    
    if BASE_MEDIA_URL in url_complete:
        return url_complete.replace(f"{BASE_MEDIA_URL}/", "")
    
    return url_complete


def verifier_media_existe(chemin_relatif):
    """
    Vérifie si un fichier média existe physiquement
    
    Args:
        chemin_relatif (str): Chemin relatif depuis Serveur_Local
    
    Returns:
        bool: True si le fichier existe
    """
    if not chemin_relatif:
        return False
    
    chemin_complet = os.path.join(MEDIA_ROOT, chemin_relatif)
    return os.path.exists(chemin_complet)
