from config import get_db_connection
import pymysql

# ============================================================================
# SERVICE HISTORIQUE - Gestion du suivi de visionnage des utilisateurs
# ============================================================================
# Ce service permet de:
# 1. Sauvegarder la position de lecture d'un utilisateur (ex: 15min 30sec)
# 2. Permettre à l'utilisateur de reprendre un film/série où il s'est arrêté
# 3. Garder un historique des films/séries visionnés
# ============================================================================

def ajouter_historique(data):
    """
    Crée un nouvel enregistrement dans l'historique de visionnage.
    Support film OU épisode.
    
    Args:
        data (dict): {
            "id_utilisateur": int,
            "id_film": int (optionnel),
            "id_episode": int (optionnel),
            "position": str ("00:00:00" par défaut)
        }
    
    Returns:
        dict: {"message": "Historique ajouté ✅", "id_historique": <id>}
    """
    if not data.get("id_utilisateur"):
        return {"erreur": "id_utilisateur requis"}, 400
    
    film_id = data.get("id_film")
    episode_id = data.get("id_episode")
    
    # Vérifier qu'on a au moins un des deux
    if not film_id and not episode_id:
        return {"erreur": "id_film ou id_episode requis"}, 400
    
    if film_id and episode_id:
        return {"erreur": "Impossible d'ajouter film ET épisode en même temps"}, 400
    
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO historiques (id_utilisateur, id_film, id_episode, position)
            VALUES (%s, %s, %s, %s)
        """, (data["id_utilisateur"], film_id, episode_id, data.get("position", "00:00:00")))
        conn.commit()
        cur.execute("SELECT LAST_INSERT_ID() AS id")
        row = cur.fetchone()
        historique_id = row["id"] if row else None
        return {"message": "Historique ajouté ✅", "id_historique": historique_id}, 201
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def get_historique_utilisateur(uid):
    """
    Récupère l'historique complet de visionnage d'un utilisateur.
    Inclut films ET épisodes.
    
    Args:
        uid (int): ID de l'utilisateur
    
    Returns:
        list: [{
            "id_historique": 42,
            "titre": "Inception" ou "Épisode 1",
            "position": "00:15:30",
            "date_visionnage": "2025-11-21...",
            "type": "film" ou "episode",
            "serie": "Breaking Bad" (si épisode)
        }, ...]
    """
    conn = get_db_connection()
    if conn is None:
        return []
    
    try:
        cur = conn.cursor()
        # Récupérer films et épisodes
        cur.execute("""
            SELECT h.id_historique, 
                   COALESCE(f.titre, e.titre) as titre,
                   h.position, h.date_visionnage,
                   CASE WHEN h.id_film IS NOT NULL THEN 'film' ELSE 'episode' END as type,
                   s.titre as serie
            FROM historiques h
            LEFT JOIN films f ON h.id_film = f.id_film
            LEFT JOIN episodes e ON h.id_episode = e.id_episode
            LEFT JOIN saisons sai ON e.id_saison = sai.id_saison
            LEFT JOIN series s ON sai.id_serie = s.id_serie
            WHERE h.id_utilisateur = %s
            ORDER BY h.date_visionnage DESC
        """, (uid,))
        result = list(cur.fetchall())
        return result
    finally:
        conn.close()

def maj_position(hid, position):
    """
    Met à jour la position de lecture dans l'historique.
    
    Args:
        hid (int): ID de l'historique à mettre à jour
        position (str): Nouvelle position au format "HH:MM:SS"
    
    Returns:
        dict: {"message": "Position mise à jour ✅"}
    """
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        # Vérifier si l'historique existe
        cur.execute("SELECT id_historique FROM historiques WHERE id_historique = %s", (hid,))
        if not cur.fetchone():
            return {"erreur": "Historique introuvable"}, 404
        
        # Mettre à jour la position de lecture
        cur.execute("UPDATE historiques SET position = %s WHERE id_historique = %s", (position, hid))
        conn.commit()
        return {"message": "Position mise à jour ✅"}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()
