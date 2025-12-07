"""
Serveur de fichiers statiques unifié
Sert tous les médias depuis Serveur_Local via une seule route
"""
from flask import send_from_directory
from media_config import MEDIA_ROOT


def configure_static_routes(app):
    """
    Configure une route unique pour servir tous les fichiers médias
    Route: /media/<path:filepath>
    """
    
    @app.route('/media/<path:filepath>')
    def serve_media(filepath):
        """
        Sert n'importe quel fichier depuis Serveur_Local
        
        Exemples:
        - /media/films/video.mp4 → Serveur_Local/films/video.mp4
        - /media/images/affiche.jpg → Serveur_Local/images/affiche.jpg
        - /media/series/serie1/saison1/ep1.mp4 → Serveur_Local/series/serie1/saison1/ep1.mp4
        """
        return send_from_directory(MEDIA_ROOT, filepath)

    