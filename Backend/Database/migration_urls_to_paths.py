"""
Script de migration : Convertir les URLs complètes en chemins relatifs
Transforme http://localhost:5002/media/films/video.mp4 → films/video.mp4
"""
import pymysql

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'cinea',
    'charset': 'utf8mb4'
}

def extraire_chemin_relatif(url):
    """Extrait le chemin relatif depuis une URL complète"""
    if not url:
        return None
    
    # Si c'est déjà un chemin relatif, on le garde
    if not url.startswith('http'):
        return url
    
    # Extraire le chemin après /media/
    if '/media/' in url:
        return url.split('/media/', 1)[1]
    
    return url

def migrer_films():
    """Migrer les URLs des films vers des chemins relatifs"""
    conn = pymysql.connect(**DB_CONFIG)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    
    # Récupérer tous les films
    cur.execute("SELECT id_film, lien_vo, lien_vf, bande_annonce, affiche FROM films")
    films = cur.fetchall()
    
    count_updated = 0
    
    for film in films:
        new_lien_vo = extraire_chemin_relatif(film['lien_vo'])
        new_lien_vf = extraire_chemin_relatif(film['lien_vf'])
        new_bande_annonce = extraire_chemin_relatif(film['bande_annonce'])
        new_affiche = extraire_chemin_relatif(film['affiche'])
        
        # Mettre à jour si nécessaire
        if (new_lien_vo != film['lien_vo'] or 
            new_lien_vf != film['lien_vf'] or 
            new_bande_annonce != film['bande_annonce'] or 
            new_affiche != film['affiche']):
            
            cur.execute("""
                UPDATE films 
                SET lien_vo = %s, lien_vf = %s, bande_annonce = %s, affiche = %s
                WHERE id_film = %s
            """, (new_lien_vo, new_lien_vf, new_bande_annonce, new_affiche, film['id_film']))
            
            count_updated += 1
            print(f"✅ Film {film['id_film']} migré")
            print(f"   Ancien: {film['lien_vo']}")
            print(f"   Nouveau: {new_lien_vo}\n")
    
    conn.commit()
    conn.close()
    
    return count_updated

def migrer_series():
    """Migrer les URLs des séries vers des chemins relatifs"""
    conn = pymysql.connect(**DB_CONFIG)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    
    # Récupérer toutes les séries
    cur.execute("SELECT id_serie, affiche, bande_annonce FROM series")
    series = cur.fetchall()
    
    count_updated = 0
    
    for serie in series:
        new_affiche = extraire_chemin_relatif(serie['affiche'])
        new_bande_annonce = extraire_chemin_relatif(serie['bande_annonce'])
        
        if (new_affiche != serie['affiche'] or 
            new_bande_annonce != serie['bande_annonce']):
            
            cur.execute("""
                UPDATE series 
                SET affiche = %s, bande_annonce = %s
                WHERE id_serie = %s
            """, (new_affiche, new_bande_annonce, serie['id_serie']))
            
            count_updated += 1
            print(f"✅ Série {serie['id_serie']} migrée")
    
    conn.commit()
    conn.close()
    
    return count_updated

def migrer_episodes():
    """Migrer les URLs des épisodes vers des chemins relatifs"""
    conn = pymysql.connect(**DB_CONFIG)
    cur = conn.cursor(pymysql.cursors.DictCursor)
    
    # Récupérer tous les épisodes
    cur.execute("SELECT id_episode, lien_vo, lien_vf, bande_annonce FROM episodes")
    episodes = cur.fetchall()
    
    count_updated = 0
    
    for episode in episodes:
        new_lien_vo = extraire_chemin_relatif(episode['lien_vo'])
        new_lien_vf = extraire_chemin_relatif(episode['lien_vf'])
        new_bande_annonce = extraire_chemin_relatif(episode['bande_annonce'])
        
        if (new_lien_vo != episode['lien_vo'] or 
            new_lien_vf != episode['lien_vf'] or 
            new_bande_annonce != episode['bande_annonce']):
            
            cur.execute("""
                UPDATE episodes 
                SET lien_vo = %s, lien_vf = %s, bande_annonce = %s
                WHERE id_episode = %s
            """, (new_lien_vo, new_lien_vf, new_bande_annonce, episode['id_episode']))
            
            count_updated += 1
            print(f"✅ Épisode {episode['id_episode']} migré")
    
    conn.commit()
    conn.close()
    
    return count_updated

if __name__ == "__main__":
    print("=" * 80)
    print("MIGRATION : URLs complètes → Chemins relatifs")
    print("=" * 80)
    print()
    
    print("🎬 Migration des films...")
    films_count = migrer_films()
    print(f"✅ {films_count} films migrés\n")
    
    print("📺 Migration des séries...")
    series_count = migrer_series()
    print(f"✅ {series_count} séries migrées\n")
    
    print("🎞️ Migration des épisodes...")
    episodes_count = migrer_episodes()
    print(f"✅ {episodes_count} épisodes migrés\n")
    
    print("=" * 80)
    print(f"✅ MIGRATION TERMINÉE : {films_count + series_count + episodes_count} entrées converties")
    print("=" * 80)
