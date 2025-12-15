from config import get_db_connection
import pymysql

# Configuration media
MEDIA_BASE_URL = "http://localhost:5002/media"

def construire_url_media(chemin_relatif):
    """Construit une URL complète pour les fichiers media"""
    if not chemin_relatif:
        return None
    return f"{MEDIA_BASE_URL}/{chemin_relatif}"

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
    ✅ VÉRIFIE SI LE FILM/ÉPISODE EXISTE DÉJÀ EN HISTORIQUE
    ✅ GÈRE LES ERREURS D'UNICITÉ (DOUBLE INSERT)
    
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
        
        # ✅ VÉRIFIER SI CE CONTENU EXISTE DÉJÀ EN HISTORIQUE
        if film_id:
            cur.execute("""
                SELECT id_historique FROM historiques 
                WHERE id_utilisateur = %s AND id_film = %s
            """, (data["id_utilisateur"], film_id))
        else:
            cur.execute("""
                SELECT id_historique FROM historiques 
                WHERE id_utilisateur = %s AND id_episode = %s
            """, (data["id_utilisateur"], episode_id))
        
        existing = cur.fetchone()
        
        if existing:
            # ✅ DÉJÀ EN HISTORIQUE → RETOURNER L'ID EXISTANT
            print(f"✅ {('Film' if film_id else 'Épisode')} déjà en historique: {existing['id_historique']}")
            return {
                "message": f"{'Film' if film_id else 'Épisode'} déjà en historique",
                "id_historique": existing['id_historique'],
                "nouveau": False
            }, 200
        
        # ❌ PAS EN HISTORIQUE → CRÉER UNE NOUVELLE ENTRÉE
        try:
            cur.execute("""
                INSERT INTO historiques (id_utilisateur, id_film, id_episode, position)
                VALUES (%s, %s, %s, %s)
            """, (data["id_utilisateur"], film_id, episode_id, data.get("position", "00:00:00")))
            conn.commit()
            cur.execute("SELECT LAST_INSERT_ID() AS id")
            row = cur.fetchone()
            historique_id = row["id"] if row else None
            
            print(f"✨ Nouvel historique créé: {historique_id}")
            return {
                "message": f"{'Film' if film_id else 'Épisode'} ajouté à l'historique ✅",
                "id_historique": historique_id,
                "nouveau": True
            }, 201
        except pymysql.IntegrityError as e:
            # ✅ ERREUR D'UNICITÉ (DOUBLE INSERT DÉTECTÉ)
            # Récupérer l'ID existant
            if film_id:
                cur.execute("""
                    SELECT id_historique FROM historiques 
                    WHERE id_utilisateur = %s AND id_film = %s
                """, (data["id_utilisateur"], film_id))
            else:
                cur.execute("""
                    SELECT id_historique FROM historiques 
                    WHERE id_utilisateur = %s AND id_episode = %s
                """, (data["id_utilisateur"], episode_id))
            
            existing = cur.fetchone()
            if existing:
                print(f"⚠️ Double insert détecté, retour ID existant: {existing['id_historique']}")
                return {
                    "message": f"{'Film' if film_id else 'Épisode'} en historique (concurrent)",
                    "id_historique": existing['id_historique'],
                    "nouveau": False
                }, 200
            raise e
    
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def get_historique_utilisateur(uid):
    """
    Récupère l'historique complet de visionnage d'un utilisateur.
    Inclut films ET épisodes avec affiche.
    
    Args:
        uid (int): ID de l'utilisateur
    
    Returns:
        list: [{
            "id_historique": 42,
            "titre": "Inception" ou "Épisode 1",
            "position": "00:15:30",
            "date_visionnage": "2025-11-21...",
            "type": "film" ou "episode",
            "affiche": "http://localhost:5002/media/...",
            "id_film": 5,
            "id_serie": 3
        }, ...]
    """
    conn = get_db_connection()
    if conn is None:
        return []
    
    try:
        cur = conn.cursor()
        # Récupérer films et épisodes avec affiche
        cur.execute("""
            SELECT h.id_historique, 
                   COALESCE(f.titre, e.titre) as titre,
                   h.position, h.date_visionnage,
                   CASE WHEN h.id_film IS NOT NULL THEN 'film' ELSE 'episode' END as type,
                   CASE WHEN h.id_film IS NOT NULL THEN f.affiche ELSE NULL END as affiche,
                   h.id_film,
                   CASE WHEN h.id_episode IS NOT NULL THEN s.id_serie ELSE NULL END as id_serie
            FROM historiques h
            LEFT JOIN films f ON h.id_film = f.id_film
            LEFT JOIN episodes e ON h.id_episode = e.id_episode
            LEFT JOIN saisons sai ON e.id_saison = sai.id_saison
            LEFT JOIN series s ON sai.id_serie = s.id_serie
            WHERE h.id_utilisateur = %s
            ORDER BY h.date_visionnage DESC
        """, (uid,))
        result = list(cur.fetchall())
        
        # Convertir les chemins d'affiche en URLs complètes
        for item in result:
            if item.get('affiche'):
                item['affiche'] = construire_url_media(item['affiche'])
        
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
