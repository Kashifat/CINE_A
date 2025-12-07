from config import get_db_connection
from media_config import construire_url_media
import pymysql

#  #################################
# FILMS
def get_all_films():
    """Récupérer tous les films avec URLs complètes"""
    conn = get_db_connection()
    if conn is None:
        return []
    
    cur = conn.cursor()
    cur.execute("""
        SELECT films.id_film, films.titre, films.description, films.lien_vo, films.lien_vf,
               films.bande_annonce, films.affiche, films.date_sortie, films.duree, films.pays,
               films.type, films.popularite, films.date_ajout, films.id_categorie,
               categories.nom AS categorie
        FROM films
        LEFT JOIN categories ON films.id_categorie = categories.id_categorie
        WHERE films.type = 'Film'
        ORDER BY films.date_ajout DESC
    """)
    films = list(cur.fetchall())
    conn.close()
    
    # Convertir les chemins relatifs en URLs complètes
    for film in films:
        film['lien_vo'] = construire_url_media(film['lien_vo'])
        film['lien_vf'] = construire_url_media(film['lien_vf'])
        film['bande_annonce'] = construire_url_media(film['bande_annonce'])
        film['affiche'] = construire_url_media(film['affiche'])
    
    return films

def get_film_by_id(film_id):
    """Récupérer un film par son ID avec URLs complètes"""
    conn = get_db_connection()
    if conn is None:
        return None
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT films.id_film, films.titre, films.description, films.lien_vo, films.lien_vf,
                   films.bande_annonce, films.affiche, films.date_sortie, films.duree, films.pays,
                   films.type, films.popularite, films.date_ajout, films.id_categorie,
                   categories.nom AS categorie
            FROM films
            LEFT JOIN categories ON films.id_categorie = categories.id_categorie
            WHERE films.id_film = %s AND films.type = 'Film'
        """, (film_id,))
        film = cur.fetchone()
        
        if film:
            # Convertir les chemins relatifs en URLs complètes
            film['lien_vo'] = construire_url_media(film['lien_vo'])
            film['lien_vf'] = construire_url_media(film['lien_vf'])
            film['bande_annonce'] = construire_url_media(film['bande_annonce'])
            film['affiche'] = construire_url_media(film['affiche'])
        
        return film
    finally:
        conn.close()

def ajouter_film(data):
    """Ajouter un nouveau film"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        
        print(f"\n🗄️ INSERTION dans la base de données:")
        print(f"   titre={data['titre']}")
        print(f"   lien_vo={data.get('lien_vo')}")
        print(f"   lien_vf={data.get('lien_vf')}")
        print(f"   bande_annonce={data.get('bande_annonce')}")
        print(f"   affiche={data.get('affiche')}")
        
        cur.execute("""
            INSERT INTO films (titre, description, id_categorie, lien_vo, lien_vf,
                               bande_annonce, affiche, date_sortie, duree, pays, type, popularite)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Film', 0)
        """, (
            data["titre"], data["description"], data.get("id_categorie"), 
            data.get("lien_vo"), data.get("lien_vf"), data.get("bande_annonce"),
            data.get("affiche"), data.get("date_sortie"), data.get("duree"), data.get("pays")
        ))
        conn.commit()
        
        cur.execute("SELECT LAST_INSERT_ID() AS id")
        row = cur.fetchone()
        film_id = row["id"] if row else None
        
        # Vérifier ce qui a été inséré
        cur.execute("SELECT lien_vo, lien_vf, bande_annonce, affiche FROM films WHERE id_film = %s", (film_id,))
        inserted = cur.fetchone()
        print(f"\n✅ Vérifié dans la BD après insertion:")
        print(f"   lien_vo={inserted['lien_vo']}")
        print(f"   lien_vf={inserted['lien_vf']}")
        print(f"   bande_annonce={inserted['bande_annonce']}")
        print(f"   affiche={inserted['affiche']}\n")
        
        return {"message": "Film ajouté avec succès ✅", "id_film": film_id}, 201
    except Exception as e:
        print(f"❌ ERREUR lors de l'insertion: {str(e)}")
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def modifier_film(film_id, data):
    """Modifier un film existant"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            UPDATE films
            SET titre = %s, description = %s, id_categorie = %s, lien_vo = %s, lien_vf = %s,
                bande_annonce = %s, affiche = %s, date_sortie = %s, duree = %s, pays = %s
            WHERE id_film = %s AND type = 'Film'
        """, (
            data["titre"], data["description"], data.get("id_categorie"), 
            data.get("lien_vo"), data.get("lien_vf"), data.get("bande_annonce"),
            data.get("affiche"), data.get("date_sortie"), data.get("duree"), data.get("pays"),
            film_id
        ))
        if cur.rowcount == 0:
            return {"erreur": "Film non trouvé"}, 404
        conn.commit()
        return {"message": "Film modifié avec succès ✅"}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def supprimer_film(film_id):
    """Supprimer un film"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM films WHERE id_film = %s AND type = 'Film'", (film_id,))
        if cur.rowcount == 0:
            return {"erreur": "Film non trouvé"}, 404
        conn.commit()
        return {"message": "Film supprimé avec succès ✅"}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()


# ######################################
#  SERIES
def get_all_series():
    """Récupérer toutes les séries avec URLs complètes"""
    conn = get_db_connection()
    if conn is None:
        return []
    
    cur = conn.cursor()
    cur.execute("""
        SELECT s.id_serie, s.titre, s.description, s.affiche, s.bande_annonce,
               s.date_sortie, s.pays, s.id_categorie, c.nom AS categorie
        FROM series s
        LEFT JOIN categories c ON s.id_categorie = c.id_categorie
        ORDER BY s.id_serie DESC
    """)
    series = list(cur.fetchall())
    conn.close()
    
    # Convertir les chemins relatifs en URLs complètes
    for serie in series:
        serie['affiche'] = construire_url_media(serie['affiche'])
        serie['bande_annonce'] = construire_url_media(serie['bande_annonce'])
    
    return series

def get_serie_by_id(serie_id):
    """Récupérer une série par son ID avec URLs complètes"""
    conn = get_db_connection()
    if conn is None:
        return None
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT s.id_serie, s.titre, s.description, s.affiche, s.bande_annonce,
                   s.date_sortie, s.pays, s.id_categorie, c.nom AS categorie
            FROM series s
            LEFT JOIN categories c ON s.id_categorie = c.id_categorie
            WHERE s.id_serie = %s
        """, (serie_id,))
        serie = cur.fetchone()
        
        if serie:
            # Convertir les chemins relatifs en URLs complètes
            serie['affiche'] = construire_url_media(serie['affiche'])
            serie['bande_annonce'] = construire_url_media(serie['bande_annonce'])
        
        return serie
    finally:
        conn.close()

def ajouter_serie(data):
    """Ajouter une nouvelle série"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO series (titre, description, id_categorie, affiche, bande_annonce,
                                date_sortie, pays)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data["titre"], data["description"], data.get("id_categorie"), 
            data.get("affiche"), data.get("bande_annonce"),
            data.get("date_sortie"), data.get("pays")
        ))
        conn.commit()
        cur.execute("SELECT LAST_INSERT_ID() AS id")
        row = cur.fetchone()
        serie_id = row["id"] if row else None
        return {"message": "Série ajoutée avec succès ✅", "id_serie": serie_id}, 201
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def modifier_serie(serie_id, data):
    """Modifier une série existante"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            UPDATE series
            SET titre = %s, description = %s, id_categorie = %s, affiche = %s, 
                bande_annonce = %s, date_sortie = %s, pays = %s
            WHERE id_serie = %s
        """, (
            data["titre"], data["description"], data.get("id_categorie"), 
            data.get("affiche"), data.get("bande_annonce"), 
            data.get("date_sortie"), data.get("pays"), serie_id
        ))
        if cur.rowcount == 0:
            return {"erreur": "Série non trouvée"}, 404
        conn.commit()
        return {"message": "Série modifiée avec succès ✅"}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def supprimer_serie(serie_id):
    """Supprimer une série"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM series WHERE id_serie = %s", (serie_id,))
        if cur.rowcount == 0:
            return {"erreur": "Série non trouvée"}, 404
        conn.commit()
        return {"message": "Série supprimée avec succès ✅"}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

#######################################
# SAISONS
def ajouter_saison(data):
    """Ajouter une nouvelle saison"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO saisons (id_serie, numero_saison, titre, annee)
            VALUES (%s, %s, %s, %s)
        """, (
            data["id_serie"], data["numero_saison"], 
            data.get("titre"), data.get("annee")
        ))
        conn.commit()
        cur.execute("SELECT LAST_INSERT_ID() AS id")
        row = cur.fetchone()
        saison_id = row["id"] if row else None
        return {"message": "Saison ajoutée ✅", "id_saison": saison_id}, 201
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def get_saisons_serie(serie_id):
    """Récupérer toutes les saisons d'une série"""
    conn = get_db_connection()
    if conn is None:
        return []
    
    cur = conn.cursor()
    cur.execute("SELECT * FROM saisons WHERE id_serie = %s ORDER BY numero_saison", (serie_id,))
    saisons = list(cur.fetchall())
    conn.close()
    return saisons

def supprimer_saison(saison_id):
    """Supprimer une saison"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM saisons WHERE id_saison = %s", (saison_id,))
        if cur.rowcount == 0:
            return {"erreur": "Saison non trouvée"}, 404
        conn.commit()
        return {"message": "Saison supprimée ✅"}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

#  #################################################
# EPISODES
def ajouter_episode(data):
    """Ajouter un nouvel épisode"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO episodes (id_saison, titre, description, lien_vo, lien_vf, 
                                  bande_annonce, duree, numero_episode)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data["id_saison"], data["titre"], data.get("description"),
            data.get("lien_vo"), data.get("lien_vf"), data.get("bande_annonce"),
            data.get("duree"), data["numero_episode"]
        ))
        conn.commit()
        cur.execute("SELECT LAST_INSERT_ID() AS id")
        row = cur.fetchone()
        episode_id = row["id"] if row else None
        return {"message": "Épisode ajouté avec succès ✅", "id_episode": episode_id}, 201
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def get_episodes_saison(saison_id):
    """Récupérer tous les épisodes d'une saison avec URLs complètes"""
    conn = get_db_connection()
    if conn is None:
        return []
    
    cur = conn.cursor()
    cur.execute("SELECT * FROM episodes WHERE id_saison = %s ORDER BY numero_episode", (saison_id,))
    episodes = list(cur.fetchall())
    conn.close()
    
    # Convertir les chemins relatifs en URLs complètes
    for episode in episodes:
        episode['lien_vo'] = construire_url_media(episode.get('lien_vo'))
        episode['lien_vf'] = construire_url_media(episode.get('lien_vf'))
        episode['bande_annonce'] = construire_url_media(episode.get('bande_annonce'))
    
    return episodes

def modifier_episode(episode_id, data):
    """Modifier un épisode existant"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            UPDATE episodes
            SET id_saison = %s, titre = %s, description = %s, lien_vo = %s, lien_vf = %s, 
                bande_annonce = %s, duree = %s, numero_episode = %s
            WHERE id_episode = %s
        """, (
            data["id_saison"], data["titre"], data.get("description"),
            data.get("lien_vo"), data.get("lien_vf"), data.get("bande_annonce"),
            data.get("duree"), data["numero_episode"], episode_id
        ))
        if cur.rowcount == 0:
            return {"erreur": "Épisode non trouvé"}, 404
        conn.commit()
        return {"message": "Épisode modifié avec succès ✅"}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def supprimer_episode(episode_id):
    """Supprimer un épisode"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM episodes WHERE id_episode = %s", (episode_id,))
        if cur.rowcount == 0:
            return {"erreur": "Épisode non trouvé"}, 404
        conn.commit()
        return {"message": "Épisode supprimé avec succès ✅"}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()


#  ####################################
# RECHERCHE GLOBALE
def rechercher_contenus(mot_cle):
    """Recherche globale dans films, séries et épisodes"""
    conn = get_db_connection()
    if conn is None:
        return {"films": [], "series": [], "episodes": []}
    
    cur = conn.cursor()
    pattern = f"%{mot_cle.lower()}%"
    
    films = []
    series = []
    episodes = []

    try:
        # Recherche films
        cur.execute("""
            SELECT 'Film' AS type_contenu, f.id_film, f.titre, f.description, f.affiche, 
                   f.date_sortie, f.pays, c.nom AS categorie, f.bande_annonce, f.popularite
            FROM films f
            LEFT JOIN categories c ON f.id_categorie = c.id_categorie
            WHERE LOWER(f.titre) LIKE %s 
               OR LOWER(c.nom) LIKE %s
               OR LOWER(f.pays) LIKE %s
               OR LOWER(f.description) LIKE %s
            ORDER BY f.popularite DESC
        """, (pattern, pattern, pattern, pattern))
        films = list(cur.fetchall())
    except Exception as e:
        print(f"Erreur recherche films: {e}")

    try:
        # Recherche séries
        cur.execute("""
            SELECT 'Série' AS type_contenu, s.id_serie, s.titre, s.description, s.affiche,
                   s.date_sortie, s.pays, c.nom AS categorie, s.bande_annonce
            FROM series s
            LEFT JOIN categories c ON s.id_categorie = c.id_categorie
            WHERE LOWER(s.titre) LIKE %s
               OR LOWER(c.nom) LIKE %s
               OR LOWER(s.pays) LIKE %s
               OR LOWER(s.description) LIKE %s
        """, (pattern, pattern, pattern, pattern))
        series = list(cur.fetchall())
    except Exception as e:
        print(f"Erreur recherche séries: {e}")

    try:
        # Recherche épisodes
        cur.execute("""
            SELECT 'Épisode' AS type_contenu, e.id_episode, e.titre, e.description, e.lien_vf, 
                   e.lien_vo, e.bande_annonce, e.numero_episode, s.numero_saison, se.titre AS serie
            FROM episodes e
            JOIN saisons s ON e.id_saison = s.id_saison
            JOIN series se ON s.id_serie = se.id_serie
            WHERE LOWER(e.titre) LIKE %s OR LOWER(se.titre) LIKE %s
        """, (pattern, pattern))
        episodes = list(cur.fetchall())
    except Exception as e:
        print(f"Erreur recherche épisodes: {e}")

    conn.close()
    return {
        "films": films,
        "series": series,
        "episodes": episodes
    }
