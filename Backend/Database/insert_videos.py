"""
Script interactif pour insérer les films et épisodes avec leurs métadonnées
"""
import os
from pathlib import Path
import pymysql
from datetime import datetime

# Configuration
SERVEUR_LOCAL = Path(__file__).parent.parent / 'Serveur_Local'
API_BASE_URL = 'http://localhost:5002/media'
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'cinea',
    'charset': 'utf8mb4'
}

VIDEO_EXTENSIONS = {'.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'}

def get_video_duration(filepath):
    """Récupérer la durée d'une vidéo (stub - à implémenter avec ffmpeg si besoin)"""
    # Pour l'instant, retourner une valeur par défaut
    # À améliorer avec: ffprobe ou ffmpeg
    return "120"  # 2 heures par défaut

def list_files_in_directory(directory_path):
    """Lister tous les fichiers vidéo d'un dossier"""
    if not directory_path.exists():
        print(f"⚠️  Dossier non trouvé: {directory_path}")
        return []
    
    videos = []
    for file in directory_path.rglob('*'):
        if file.is_file() and file.suffix.lower() in VIDEO_EXTENSIONS:
            videos.append(file)
    
    return sorted(videos)

def get_categories(conn):
    """Récupérer toutes les catégories"""
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("SELECT id_categorie, nom FROM categories ORDER BY nom")
            return {row['nom']: row['id_categorie'] for row in cursor.fetchall()}
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return {}

def insert_film(conn, titre, description, id_categorie, lien_vo, lien_vf, duree, date_sortie):
    """Insérer un film"""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO films (titre, description, id_categorie, lien_vo, lien_vf, duree, date_sortie, date_ajout)
                VALUES (%s, %s, %s, %s, %s, %s, %s, NOW())
            """, (titre, description, id_categorie, lien_vo, lien_vf, duree, date_sortie))
        conn.commit()
        return True
    except Exception as e:
        print(f"❌ Erreur insertion film: {e}")
        return False

def insert_episode(conn, id_saison, numero, titre, description, lien_vo, lien_vf, duree):
    """Insérer un épisode"""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO episodes (id_saison, numero_episode, titre, description, lien_vo, lien_vf, duree)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (id_saison, numero, titre, description, lien_vo, lien_vf, duree))
        conn.commit()
        return True
    except Exception as e:
        print(f"❌ Erreur insertion épisode: {e}")
        return False

def insert_films_interactive():
    """Interface interactive pour insérer les films"""
    print("\n" + "=" * 70)
    print("🎬 INSERTION DES FILMS")
    print("=" * 70)
    
    # Connexion BD
    try:
        conn = pymysql.connect(**DB_CONFIG)
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return
    
    # Récupérer catégories
    categories = get_categories(conn)
    if not categories:
        print("❌ Aucune catégorie trouvée dans la BD")
        conn.close()
        return
    
    print("\n📋 Catégories disponibles:")
    for nom, id_cat in sorted(categories.items()):
        print(f"   {id_cat}. {nom}")
    
    # Scanner les vidéos
    films_path = SERVEUR_LOCAL / 'films'
    videos = list_files_in_directory(films_path)
    
    if not videos:
        print(f"\n⚠️  Aucune vidéo trouvée dans {films_path}")
        conn.close()
        return
    
    print(f"\n📂 {len(videos)} vidéo(s) détectée(s) dans {films_path}:")
    for i, video in enumerate(videos, 1):
        print(f"   {i}. {video.name}")
    
    # Insertion interactif
    print("\n" + "─" * 70)
    print("Entrez les informations pour chaque film (ou 'skip' pour sauter):")
    print("─" * 70)
    
    inserted = 0
    for video in videos:
        print(f"\n📹 Traitement: {video.name}")
        
        # Titre
        titre = input("   Titre du film: ").strip()
        if titre.lower() == 'skip':
            print("   ⏭️  Skippé")
            continue
        
        # Description
        description = input("   Description: ").strip()
        
        # Catégorie
        cat_input = input("   ID Catégorie: ").strip()
        try:
            id_categorie = int(cat_input)
            if id_categorie not in categories.values():
                print(f"   ❌ ID {id_categorie} invalide")
                continue
        except ValueError:
            print("   ❌ ID invalide")
            continue
        
        # Durée
        duree = input("   Durée (min) [120]: ").strip() or "120"
        
        # Date sortie
        date_sortie = input("   Date de sortie (YYYY-MM-DD) [2024-12-04]: ").strip() or "2024-12-04"
        
        # URLs
        url_base = f"{API_BASE_URL}/films/{video.name}"
        lien_vo = url_base
        
        # Demander VF
        vf = input("   Version française disponible? (o/n) [n]: ").strip().lower()
        lien_vf = url_base if vf == 'o' else None
        
        # Insérer
        if insert_film(conn, titre, description, id_categorie, lien_vo, lien_vf, duree, date_sortie):
            print(f"   ✅ Film inséré: {titre}")
            inserted += 1
        else:
            print(f"   ❌ Erreur lors de l'insertion de {titre}")
    
    conn.close()
    print(f"\n{'=' * 70}")
    print(f"✅ {inserted} film(s) inséré(s)")
    print("=" * 70)

def insert_episodes_interactive():
    """Interface interactive pour insérer les épisodes"""
    print("\n" + "=" * 70)
    print("📺 INSERTION DES ÉPISODES DE SÉRIE")
    print("=" * 70)
    
    # Connexion BD
    try:
        conn = pymysql.connect(**DB_CONFIG)
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return
    
    # Récupérer les séries et saisons
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            cursor.execute("""
                SELECT s.id_serie, s.titre as serie_titre, 
                       sa.id_saison, sa.numero_saison
                FROM series s
                LEFT JOIN saisons sa ON s.id_serie = sa.id_serie
                ORDER BY s.titre, sa.numero_saison
            """)
            results = cursor.fetchall()
    except Exception as e:
        print(f"❌ Erreur: {e}")
        conn.close()
        return
    
    if not results:
        print("❌ Aucune série ou saison trouvée dans la BD")
        conn.close()
        return
    
    # Afficher les séries/saisons
    saisons_map = {}
    print("\n📋 Séries et saisons disponibles:")
    for row in results:
        key = (row['id_serie'], row['serie_titre'])
        if key not in saisons_map:
            saisons_map[key] = []
        if row['id_saison']:
            saisons_map[key].append((row['id_saison'], row['numero_saison']))
            print(f"   Série: {row['serie_titre']} / Saison {row['numero_saison']} (ID: {row['id_saison']})")
    
    # Scanner vidéos
    series_path = SERVEUR_LOCAL / 'series'
    videos = list_files_in_directory(series_path)
    
    if not videos:
        print(f"\n⚠️  Aucune vidéo trouvée dans {series_path}")
        conn.close()
        return
    
    print(f"\n📂 {len(videos)} vidéo(s) détectée(s) dans {series_path}:")
    for i, video in enumerate(videos, 1):
        print(f"   {i}. {video.relative_to(series_path)}")
    
    # Insertion interactif
    print("\n" + "─" * 70)
    print("Entrez les informations pour chaque épisode (ou 'skip' pour sauter):")
    print("─" * 70)
    
    inserted = 0
    for video in videos:
        print(f"\n📹 Traitement: {video.name}")
        
        # ID Saison
        saison_input = input("   ID Saison: ").strip()
        if saison_input.lower() == 'skip':
            print("   ⏭️  Skippé")
            continue
        
        try:
            id_saison = int(saison_input)
        except ValueError:
            print("   ❌ ID invalide")
            continue
        
        # Numéro épisode
        numero = input("   Numéro d'épisode: ").strip()
        try:
            numero = int(numero)
        except ValueError:
            print("   ❌ Numéro invalide")
            continue
        
        # Titre
        titre = input("   Titre de l'épisode: ").strip()
        
        # Description
        description = input("   Description: ").strip()
        
        # Durée
        duree = input("   Durée (min) [45]: ").strip() or "45"
        
        # URLs
        url_base = f"{API_BASE_URL}/series/{video.name}"
        lien_vo = url_base
        
        # Demander VF
        vf = input("   Version française disponible? (o/n) [n]: ").strip().lower()
        lien_vf = url_base if vf == 'o' else None
        
        # Insérer
        if insert_episode(conn, id_saison, numero, titre, description, lien_vo, lien_vf, duree):
            print(f"   ✅ Épisode inséré: {titre}")
            inserted += 1
        else:
            print(f"   ❌ Erreur lors de l'insertion de {titre}")
    
    conn.close()
    print(f"\n{'=' * 70}")
    print(f"✅ {inserted} épisode(s) inséré(s)")
    print("=" * 70)

def main():
    """Menu principal"""
    print("\n" + "=" * 70)
    print("🎬 SYSTÈME D'INSERTION DE VIDÉOS")
    print("=" * 70)
    print("\n1. Insérer des FILMS")
    print("2. Insérer des ÉPISODES DE SÉRIE")
    print("0. Quitter")
    
    choix = input("\nChoisissez une option (0-2): ").strip()
    
    if choix == '1':
        insert_films_interactive()
    elif choix == '2':
        insert_episodes_interactive()
    elif choix == '0':
        print("Au revoir! 👋")
    else:
        print("❌ Option invalide")

if __name__ == '__main__':
    main()
