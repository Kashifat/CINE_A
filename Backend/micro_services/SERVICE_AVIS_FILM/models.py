from config import get_db_connection
import pymysql

def ajouter_avis(data):
    """Ajouter un avis sur un film ou un épisode"""
    # Validation: doit avoir utilisateur_id ET (film_id OU episode_id)
    if not data.get("id_utilisateur"):
        return {"erreur": "id_utilisateur requis"}, 400
    
    film_id = data.get("id_film")
    episode_id = data.get("id_episode")
    
    # Vérifier qu'on a exactement un des deux (film OU épisode)
    if not film_id and not episode_id:
        return {"erreur": "id_film ou id_episode requis"}, 400
    if film_id and episode_id:
        return {"erreur": "Impossible d'ajouter un avis sur film ET épisode en même temps"}, 400
    
    note = data.get("note")
    if note is None or not isinstance(note, int) or note < 0 or note > 5:
        return {"erreur": "La note doit être un entier entre 0 et 5"}, 400
    
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO avis (id_utilisateur, id_film, id_episode, note, commentaire)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (data["id_utilisateur"], film_id, episode_id, note, data.get("commentaire", ""))
        )
        conn.commit()
        cur.execute("SELECT LAST_INSERT_ID() AS id")
        row = cur.fetchone()
        avis_id = row["id"] if row else None
        return {"message": "Avis ajouté ✅", "id_avis": avis_id}, 201
    except pymysql.IntegrityError as e:
        return {"erreur": f"Erreur d'intégrité: {str(e)}"}, 400
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def get_avis_film(film_id):
    """Obtenir tous les avis d'un film"""
    conn = get_db_connection()
    if conn is None:
        return []
    
    cur = conn.cursor()
    cur.execute(
        """
        SELECT avis.id_avis, utilisateurs.nom, utilisateurs.photo_profil, avis.note, avis.commentaire, avis.date_commentaire
        FROM avis
        JOIN utilisateurs ON avis.id_utilisateur = utilisateurs.id_utilisateur
        WHERE avis.id_film = %s
        ORDER BY avis.date_commentaire DESC
        """,
        (film_id,)
    )
    result = list(cur.fetchall())
    
    # Convertir photo_profil en URL
    for avis in result:
        if avis.get('photo_profil'):
            avis['photo_profil'] = f"http://localhost:5002/media/{avis['photo_profil']}"
    
    conn.close()
    return result

def get_avis_episode(episode_id):
    """Obtenir tous les avis d'un épisode"""
    conn = get_db_connection()
    if conn is None:
        return []
    
    cur = conn.cursor()
    cur.execute(
        """
        SELECT avis.id_avis, utilisateurs.nom, utilisateurs.photo_profil, avis.note, avis.commentaire, avis.date_commentaire
        FROM avis
        JOIN utilisateurs ON avis.id_utilisateur = utilisateurs.id_utilisateur
        WHERE avis.id_episode = %s
        ORDER BY avis.date_commentaire DESC
        """,
        (episode_id,)
    )
    result = list(cur.fetchall())
    
    # Convertir photo_profil en URL
    for avis in result:
        if avis.get('photo_profil'):
            avis['photo_profil'] = f"http://localhost:5002/media/{avis['photo_profil']}"
    
    conn.close()
    return result

def get_avis_utilisateur(user_id):
    """Obtenir tous les avis d'un utilisateur"""
    conn = get_db_connection()
    if conn is None:
        return []
    
    cur = conn.cursor()
    cur.execute(
        """
        SELECT a.id_avis, a.id_film, a.id_episode, a.note, a.commentaire, a.date_commentaire,
               f.titre as film_titre, e.titre as episode_titre
        FROM avis a
        LEFT JOIN films f ON a.id_film = f.id_film
        LEFT JOIN episodes e ON a.id_episode = e.id_episode
        WHERE a.id_utilisateur = %s
        ORDER BY a.date_commentaire DESC
        """,
        (user_id,)
    )
    result = list(cur.fetchall())
    conn.close()
    return result

def supprimer_avis(avis_id):
    """Supprimer un avis"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        # Vérifier si l'avis existe
        cur.execute("SELECT id_avis FROM avis WHERE id_avis = %s", (avis_id,))
        if not cur.fetchone():
            return {"erreur": "Avis introuvable"}, 404
        
        cur.execute("DELETE FROM avis WHERE id_avis = %s", (avis_id,))
        conn.commit()
        return {"message": "Avis supprimé ✅"}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def modifier_avis(avis_id, data):
    """Modifier un avis existant"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        # Vérifier si l'avis existe
        cur.execute("SELECT id_avis FROM avis WHERE id_avis = %s", (avis_id,))
        if not cur.fetchone():
            return {"erreur": "Avis introuvable"}, 404
        
        updates = []
        values = []
        
        if "note" in data:
            note = data["note"]
            if not isinstance(note, int) or note < 0 or note > 5:
                return {"erreur": "La note doit être un entier entre 0 et 5"}, 400
            updates.append("note = %s")
            values.append(note)
        
        if "commentaire" in data:
            updates.append("commentaire = %s")
            values.append(data["commentaire"])
        
        if not updates:
            return {"erreur": "Aucune donnée à modifier"}, 400
        
        values.append(avis_id)
        query = f"UPDATE avis SET {', '.join(updates)} WHERE id_avis = %s"
        cur.execute(query, values)
        conn.commit()
        
        return {"message": "Avis modifié ✅"}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()
