from config import get_db_connection, hasher_mot_de_passe, verifier_mot_de_passe

def admin_login(data):
    """Connexion admin"""
    if not data.get("courriel") or not data.get("mot_de_passe"):
        return {"erreur": "Courriel et mot de passe requis"}, 400
    
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id_admin, nom, courriel, mot_de_passe, role
        FROM administrateurs
        WHERE courriel = %s
        """,
        (data["courriel"],)
    )
    admin = cur.fetchone()
    conn.close()
    if admin and verifier_mot_de_passe(data["mot_de_passe"], admin["mot_de_passe"]):
        admin_info = {
            "id_admin": admin["id_admin"],
            "nom": admin["nom"],
            "courriel": admin["courriel"],
            "role": admin["role"],
        }
        return {"succes": True, "admin": admin_info}, 200
    return {"erreur": "Identifiants incorrects"}, 401

def valider_publication(pub_id):
    """Valider une publication"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    cur = conn.cursor()
    cur.execute("UPDATE publication SET statut = 'valide' WHERE id_publication = %s", (pub_id,))
    if cur.rowcount == 0:
        conn.close()
        return {"erreur": "Publication non trouvée"}, 404
    conn.commit()
    conn.close()
    return {"message": "Publication validée"}

def supprimer_publication_admin(pub_id):
    """Supprimer une publication (accès admin)"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    cur = conn.cursor()
    cur.execute("DELETE FROM publication WHERE id_publication = %s", (pub_id,))
    if cur.rowcount == 0:
        conn.close()
        return {"erreur": "Publication non trouvée"}, 404
    conn.commit()
    conn.close()
    return {"message": "Publication supprimée"}

def liste_publications_non_validees():
    """Liste les publications en attente de validation"""
    conn = get_db_connection()
    if conn is None:
        return []
    cur = conn.cursor()
    cur.execute(
        """
        SELECT p.id_publication, p.id_utilisateur, p.image, p.contenu, p.date_ajout, p.statut,
               u.nom as auteur
        FROM publication p
        JOIN utilisateurs u ON p.id_utilisateur = u.id_utilisateur
        WHERE p.statut = 'en_attente'
        ORDER BY p.date_ajout DESC
        """
    )
    result = list(cur.fetchall())
    conn.close()
    return result

def statistiques_globales():
    """Obtenir des statistiques globales"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    cur = conn.cursor()
    stats = {}
    
    try:
        # Utilisateurs 
        cur.execute("SELECT COUNT(*) as count FROM utilisateurs")
        stats["total_utilisateurs"] = (cur.fetchone() or {"count":0})["count"]
       
        # Publications
        cur.execute("SELECT COUNT(*) as count FROM publication")
        stats["total_publications"] = (cur.fetchone() or {"count":0})["count"]
        cur.execute("SELECT COUNT(*) as count FROM publication WHERE statut = 'en_attente'")
        stats["publications_en_attente"] = (cur.fetchone() or {"count":0})["count"]
        
        # Contenu
        cur.execute("SELECT COUNT(*) as count FROM films")
        stats["total_films"] = (cur.fetchone() or {"count":0})["count"]
        cur.execute("SELECT COUNT(*) as count FROM series")
        stats["total_series"] = (cur.fetchone() or {"count":0})["count"]
        cur.execute("SELECT COUNT(*) as count FROM episodes")
        stats["total_episodes"] = (cur.fetchone() or {"count":0})["count"]
        
        # Activité
        cur.execute("SELECT COUNT(*) as count FROM avis")
        stats["total_avis"] = (cur.fetchone() or {"count":0})["count"]
        cur.execute("SELECT COUNT(*) as count FROM historiques")
        stats["total_visionnages"] = (cur.fetchone() or {"count":0})["count"]
        
    except Exception as e:
        conn.close()
        return {"erreur": f"Erreur lors du calcul des statistiques: {str(e)}"}, 500
    
    conn.close()
    return stats

def creer_admin(data):
    """Créer un nouvel administrateur"""
    if not all(k in data for k in ["nom", "courriel", "mot_de_passe"]):
        return {"erreur": "Nom, courriel et mot de passe requis"}, 400
    
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    cur = conn.cursor()
    
    # Vérifier si le courriel existe déjà
    cur.execute("SELECT id_admin FROM administrateurs WHERE courriel = %s", (data["courriel"],))
    if cur.fetchone():
        conn.close()
        return {"erreur": "Ce courriel est déjà utilisé"}, 400
    
    role = data.get("role", "Modérateur")
    hashed = hasher_mot_de_passe(data["mot_de_passe"]) 
    cur.execute(
        """
        INSERT INTO administrateurs (nom, courriel, mot_de_passe, role)
        VALUES (%s, %s, %s, %s)
        """,
        (data["nom"], data["courriel"], hashed, role)
    )
    conn.commit()
    cur.execute("SELECT LAST_INSERT_ID() AS id")
    row = cur.fetchone()
    admin_id = row["id"] if row else None
    conn.close()
    return {"message": "Administrateur créé avec succès", "id": admin_id}, 201

def lister_admins():
    """Lister tous les administrateurs"""
    conn = get_db_connection()
    if conn is None:
        return []
    cur = conn.cursor()
    cur.execute("SELECT id_admin, nom, courriel, role FROM administrateurs ORDER BY id_admin")
    admins = list(cur.fetchall())
    conn.close()
    return admins

def obtenir_admin(admin_id):
    """Obtenir un admin par ID"""
    conn = get_db_connection()
    if conn is None:
        return None
    cur = conn.cursor()
    cur.execute("SELECT id_admin, nom, courriel, role FROM administrateurs WHERE id_admin = %s", (admin_id,))
    admin = cur.fetchone()
    conn.close()
    if admin:
        return dict(admin)
    return None

def modifier_admin(admin_id, data):
    """Modifier un administrateur"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    cur = conn.cursor()
    
    # Vérifier que l'admin existe
    cur.execute("SELECT id_admin FROM administrateurs WHERE id_admin = %s", (admin_id,))
    if not cur.fetchone():
        conn.close()
        return {"erreur": "Administrateur non trouvé"}, 404
    
    # Construire la requête de mise à jour dynamiquement
    updates = []
    values = []
    if "nom" in data:
        updates.append("nom = %s")
        values.append(data["nom"])
    if "courriel" in data:
        updates.append("courriel = %s")
        values.append(data["courriel"])
    if "mot_de_passe" in data:
        updates.append("mot_de_passe = %s")
        values.append(hasher_mot_de_passe(data["mot_de_passe"]))
    if "role" in data:
        updates.append("role = %s")
        values.append(data["role"])
    
    if not updates:
        conn.close()
        return {"erreur": "Aucune donnée à modifier"}, 400
    
    values.append(admin_id)
    query = f"UPDATE administrateurs SET {', '.join(updates)} WHERE id_admin = %s"
    cur.execute(query, values)
    conn.commit()
    conn.close()
    return {"message": "Administrateur modifié avec succès"}, 200

def supprimer_admin(admin_id):
    """Supprimer un administrateur"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    cur = conn.cursor()
    cur.execute("SELECT id_admin FROM administrateurs WHERE id_admin = %s", (admin_id,))
    if not cur.fetchone():
        conn.close()
        return {"erreur": "Administrateur non trouvé"}, 404
    
    cur.execute("DELETE FROM administrateurs WHERE id_admin = %s", (admin_id,))
    conn.commit()
    conn.close()
    return {"message": "Administrateur supprimé avec succès"}, 200

def lister_utilisateurs_admin():
    """Lister tous les utilisateurs (vue admin)"""
    conn = get_db_connection()
    if conn is None:
        return []
    cur = conn.cursor()
    cur.execute(
        """
        SELECT u.id_utilisateur, u.nom, u.courriel, u.date_inscription
        FROM utilisateurs u
        ORDER BY u.date_inscription DESC
        """
    )
    users = list(cur.fetchall())
    conn.close()
    return users

def modifier_utilisateur_admin(user_id, data):
    """Modifier un utilisateur (accès admin)"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    cur = conn.cursor()
    
    # Vérifier que l'utilisateur existe
    cur.execute("SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur = %s", (user_id,))
    if not cur.fetchone():
        conn.close()
        return {"erreur": "Utilisateur non trouvé"}, 404
    
    updates = []
    values = []
    if "nom" in data:
        updates.append("nom = %s")
        values.append(data["nom"])
    if "courriel" in data:
        updates.append("courriel = %s")
        values.append(data["courriel"])
    
    if not updates:
        conn.close()
        return {"erreur": "Aucune donnée à modifier"}, 400
    
    values.append(user_id)
    query = f"UPDATE utilisateurs SET {', '.join(updates)} WHERE id_utilisateur = %s"
    cur.execute(query, values)
    conn.commit()
    conn.close()
    return {"message": "Utilisateur modifié avec succès"}, 200

def supprimer_utilisateur_admin(user_id):
    """Supprimer un utilisateur (accès admin)"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    cur = conn.cursor()
    cur.execute("SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur = %s", (user_id,))
    if not cur.fetchone():
        conn.close()
        return {"erreur": "Utilisateur non trouvé"}, 404
    
    cur.execute("DELETE FROM utilisateurs WHERE id_utilisateur = %s", (user_id,))
    conn.commit()
    conn.close()
    return {"message": "Utilisateur supprimé avec succès"}, 200
