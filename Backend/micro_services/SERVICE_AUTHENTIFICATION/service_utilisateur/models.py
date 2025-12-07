from config import get_db_connection, hasher_mot_de_passe, verifier_mot_de_passe


def ajouter_utilisateur(data):
    """Inscription d'un nouvel utilisateur"""
    # Normaliser les clés (accepter motdepasse ou mot_de_passe)
    if "motdepasse" in data and "mot_de_passe" not in data:
        data["mot_de_passe"] = data["motdepasse"]
    
    if not all(k in data for k in ["nom", "courriel", "mot_de_passe"]):
        return {"erreur": "Nom, courriel et mot de passe requis"}, 400
    
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    cur = conn.cursor()
    
    # Vérifier si le courriel existe déjà
    cur.execute(
        "SELECT id_utilisateur FROM utilisateurs WHERE courriel = %s",
        (data["courriel"],)
    )
    existing = cur.fetchone()
    if existing:
        conn.close()
        return {"erreur": "Ce courriel est déjà utilisé"}, 400
    
    # Construire le nom complet si prenom est fourni
    nom_complet = data["nom"]
    if "prenom" in data and data["prenom"]:
        nom_complet = f"{data['prenom']} {data['nom']}"
    
    # Hash du mot de passe
    hashed = hasher_mot_de_passe(data["mot_de_passe"])

    cur.execute(
        """
        INSERT INTO utilisateurs (nom, courriel, mot_de_passe)
        VALUES (%s, %s, %s)
        """,
        (nom_complet, data["courriel"], hashed)
    )
    conn.commit()

    # Récupérer l'id inséré et les infos complètes
    cur.execute("SELECT LAST_INSERT_ID() AS id")
    row = cur.fetchone()
    user_id = row["id"] if row else None
    
    # Récupérer l'utilisateur complet
    cur.execute(
        """
        SELECT id_utilisateur, nom, courriel, date_inscription
        FROM utilisateurs
        WHERE id_utilisateur = %s
        """,
        (user_id,)
    )
    utilisateur = cur.fetchone()
    conn.close()
    
    # Générer un token
    import secrets
    token = secrets.token_urlsafe(32)
    
    return {
        "message": "Utilisateur ajouté avec succès",
        "utilisateur": dict(utilisateur) if utilisateur else None,
        "token": token
    }, 201


def verifier_connexion(data):
    """Connexion utilisateur"""
    # Normaliser les clés
    if "motdepasse" in data and "mot_de_passe" not in data:
        data["mot_de_passe"] = data["motdepasse"]
    
    if not data.get("courriel") or not data.get("mot_de_passe"):
        return {"erreur": "Courriel et mot de passe requis"}, 400
    
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500

    cur = conn.cursor()
    cur.execute(
        """
        SELECT u.id_utilisateur, u.nom, u.courriel, u.mot_de_passe, u.photo_profil, u.date_inscription
        FROM utilisateurs u
        WHERE u.courriel = %s
        """,
        (data["courriel"],)
    )
    utilisateur = cur.fetchone()
    conn.close()

    if utilisateur and verifier_mot_de_passe(
        data["mot_de_passe"],
        utilisateur["mot_de_passe"]
    ):
        user_dict = {
            "id_utilisateur": utilisateur["id_utilisateur"],
            "nom": utilisateur["nom"],
            "courriel": utilisateur["courriel"],
            "photo_profil": utilisateur["photo_profil"],
            "date_inscription": utilisateur["date_inscription"],
        }
        # Convertir le chemin relatif en URL
        if user_dict.get("photo_profil"):
            user_dict["photo_profil"] = f"http://localhost:5002/media/{user_dict['photo_profil']}"
        
        # Générer un token simple (en production : JWT)
        import secrets
        token = secrets.token_urlsafe(32)
        return {"succes": True, "utilisateur": user_dict, "token": token}, 200

    return {"erreur": "Identifiants incorrects"}, 401


def obtenir_utilisateur_par_id(user_id):
    """Obtenir un utilisateur par ID"""
    conn = get_db_connection()
    if conn is None:
        return None

    cur = conn.cursor()
    cur.execute(
        """
        SELECT u.id_utilisateur, u.nom, u.courriel, u.date_inscription, u.photo_profil
        FROM utilisateurs u
        WHERE u.id_utilisateur = %s
        """,
        (user_id,)
    )
    utilisateur = cur.fetchone()
    conn.close()

    if utilisateur:
        utilisateur_dict = dict(utilisateur)
        # Convertir le chemin relatif en URL si la photo existe
        if utilisateur_dict.get('photo_profil'):
            utilisateur_dict['photo_profil'] = f"http://localhost:5002/media/{utilisateur_dict['photo_profil']}"
        return utilisateur_dict
    return None


def modifier_utilisateur(user_id, data):
    """Modifier un utilisateur"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500

    cur = conn.cursor()
    
    # Vérifier que l'utilisateur existe
    cur.execute(
        "SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur = %s",
        (user_id,)
    )
    if not cur.fetchone():
        conn.close()
        return {"erreur": "Utilisateur non trouvé"}, 404
    
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
    
    if not updates:
        conn.close()
        return {"erreur": "Aucune donnée à modifier"}, 400
    
    values.append(user_id)
    query = f"UPDATE utilisateurs SET {', '.join(updates)} WHERE id_utilisateur = %s"
    cur.execute(query, values)
    conn.commit()
    conn.close()

    return {"message": "Utilisateur modifié avec succès"}, 200


def supprimer_utilisateur(user_id):
    """Supprimer un utilisateur"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500

    cur = conn.cursor()
    cur.execute(
        "SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur = %s",
        (user_id,)
    )
    if not cur.fetchone():
        conn.close()
        return {"erreur": "Utilisateur non trouvé"}, 404
    
    cur.execute(
        "DELETE FROM utilisateurs WHERE id_utilisateur = %s",
        (user_id,)
    )
    conn.commit()
    conn.close()

    return {"message": "Utilisateur supprimé avec succès"}, 200


def lister_utilisateurs(page=1, page_size=50, q=""):
    """Lister les utilisateurs avec pagination et recherche"""
    conn = get_db_connection()
    if conn is None:
        return {"utilisateurs": [], "page": page, "page_size": page_size, "total": 0}

    cur = conn.cursor()
    
    offset = (page - 1) * page_size
    
    if q:
        query = """
            SELECT u.id_utilisateur, u.nom, u.courriel, u.date_inscription
            FROM utilisateurs u
            WHERE u.nom LIKE %s OR u.courriel LIKE %s
            ORDER BY u.date_inscription DESC
            LIMIT %s OFFSET %s
        """
        search = f"%{q}%"
        cur.execute(query, (search, search, page_size, offset))
    else:
        query = """
            SELECT u.id_utilisateur, u.nom, u.courriel, u.date_inscription
            FROM utilisateurs u
            ORDER BY u.date_inscription DESC
            LIMIT %s OFFSET %s
        """
        cur.execute(query, (page_size, offset))
    
    utilisateurs = list(cur.fetchall())
    
    # Compter le total
    if q:
        cur.execute(
            "SELECT COUNT(*) as count FROM utilisateurs WHERE nom LIKE %s OR courriel LIKE %s",
            (search, search)
        )
    else:
        cur.execute("SELECT COUNT(*) as count FROM utilisateurs")
    total_row = cur.fetchone()
    total = total_row["count"] if total_row else 0
    
    conn.close()
    return {
        "utilisateurs": utilisateurs,
        "page": page,
        "page_size": page_size,
        "total": total
    }


def lister_abonnements():
    """Lister tous les types d'abonnements disponibles (logique métier)"""
    # Types d'abonnement selon le schéma ENUM
    return [
        {"type": "mensuel"},
        {"type": "annuel"}
    ]


def changer_abonnement(user_id, abonnement_type):
    """
    Changer l'abonnement d'un utilisateur.
    abonnement_type doit être 'mensuel' ou 'annuel'.
    """
    if abonnement_type not in ("mensuel", "annuel"):
        return {"erreur": "Type d'abonnement invalide"}, 400

    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500

    cur = conn.cursor()
    
    # Vérifier que l'utilisateur existe
    cur.execute(
        "SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur = %s",
        (user_id,)
    )
    if not cur.fetchone():
        conn.close()
        return {"erreur": "Utilisateur non trouvé"}, 404
    
    # Désactiver anciens abonnements actifs
    cur.execute(
        "UPDATE abonnements SET actif = 0 WHERE id_utilisateur = %s AND actif = 1",
        (user_id,)
    )

    # Insérer le nouvel abonnement
    if abonnement_type == "mensuel":
        cur.execute(
            """
            INSERT INTO abonnements (id_utilisateur, type, date_debut, date_fin, actif)
            VALUES (%s, 'mensuel', NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 1)
            """,
            (user_id,)
        )
    else:  # annuel
        cur.execute(
            """
            INSERT INTO abonnements (id_utilisateur, type, date_debut, date_fin, actif)
            VALUES (%s, 'annuel', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 1)
            """,
            (user_id,)
        )

    conn.commit()
    conn.close()

    return {"message": "Abonnement modifié avec succès"}, 200


def obtenir_profil_complet(user_id):
    """Obtenir le profil complet d'un utilisateur avec statistiques"""
    conn = get_db_connection()
    if conn is None:
        return None

    cur = conn.cursor()
    
    # Info utilisateur
    cur.execute(
        """
        SELECT u.id_utilisateur, u.nom, u.courriel, u.photo_profil, u.date_inscription
        FROM utilisateurs u
        WHERE u.id_utilisateur = %s
        """,
        (user_id,)
    )
    utilisateur = cur.fetchone()
    
    if not utilisateur:
        conn.close()
        return None
    
    profil = dict(utilisateur)
    
    # Convertir le chemin relatif en URL
    if profil.get("photo_profil"):
        profil["photo_profil"] = f"http://localhost:5002/media/{profil['photo_profil']}"
    
    # Abonnement actif
    cur.execute(
        """
        SELECT a.id_abonnement, a.type, a.date_debut, a.date_fin, a.actif
        FROM abonnements a
        WHERE a.id_utilisateur = %s AND a.actif = 1
        ORDER BY a.date_debut DESC
        LIMIT 1
        """,
        (user_id,)
    )
    abonnement = cur.fetchone()
    profil["abonnement"] = dict(abonnement) if abonnement else None
    
    # Statistiques
    cur.execute(
        "SELECT COUNT(*) as count FROM historiques WHERE id_utilisateur = %s",
        (user_id,)
    )
    profil["total_visionnages"] = (cur.fetchone() or {"count": 0})["count"]
    
    cur.execute(
        "SELECT COUNT(*) as count FROM favoris WHERE id_utilisateur = %s",
        (user_id,)
    )
    profil["total_favoris"] = (cur.fetchone() or {"count": 0})["count"]
    
    cur.execute(
        "SELECT COUNT(*) as count FROM avis WHERE id_utilisateur = %s",
        (user_id,)
    )
    profil["total_avis"] = (cur.fetchone() or {"count": 0})["count"]
    
    cur.execute(
        "SELECT COUNT(*) as count FROM publication WHERE id_utilisateur = %s",
        (user_id,)
    )
    profil["total_publications"] = (cur.fetchone() or {"count": 0})["count"]
    
    # Paiements récents
    cur.execute(
        """
        SELECT id_paiement, montant, methode, statut, date_paiement
        FROM paiements
        WHERE id_utilisateur = %s
        ORDER BY date_paiement DESC
        LIMIT 5
        """,
        (user_id,)
    )
    profil["paiements_recents"] = [dict(p) for p in cur.fetchall()]
    
    # Publications récentes avec statistiques
    cur.execute(
        """
        SELECT p.id_publication, p.contenu, p.image, p.statut, p.date_ajout,
               (SELECT COUNT(*) FROM publication_reactions WHERE id_publication = p.id_publication) as nb_reactions,
               (SELECT COUNT(*) FROM publication_commentaires WHERE id_publication = p.id_publication) as nb_commentaires
        FROM publication p
        WHERE p.id_utilisateur = %s
        ORDER BY p.date_ajout DESC
        LIMIT 10
        """,
        (user_id,)
    )
    profil["publications_recentes"] = [dict(pub) for pub in cur.fetchall()]
    
    conn.close()
    return profil


def mettre_a_jour_photo_profil(user_id, photo_url):
    """Mettre à jour la photo de profil d'un utilisateur"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE utilisateurs SET photo_profil = %s WHERE id_utilisateur = %s",
            (photo_url, user_id)
        )
        
        if cur.rowcount == 0:
            return {"erreur": "Utilisateur introuvable"}, 404
        
        conn.commit()
        return {"message": "Photo de profil mise à jour", "photo_profil": photo_url}, 200
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()


def modifier_profil_complet(user_id, data):
    """Modifier le profil complet: nom, courriel, mot de passe"""
    conn = get_db_connection()
    if conn is None:
        return {"erreur": "Connexion base de données indisponible"}, 500
    
    try:
        cur = conn.cursor()
        
        # Vérifier que l'utilisateur existe
        cur.execute(
            "SELECT id_utilisateur FROM utilisateurs WHERE id_utilisateur = %s",
            (user_id,)
        )
        if not cur.fetchone():
            return {"erreur": "Utilisateur introuvable"}, 404
        
        # Construire la requête de mise à jour dynamiquement
        updates = []
        params = []
        
        if "nom" in data and data["nom"]:
            updates.append("nom = %s")
            params.append(data["nom"])
        
        if "courriel" in data and data["courriel"]:
            # Vérifier que le nouvel email n'est pas déjà pris
            cur.execute(
                "SELECT id_utilisateur FROM utilisateurs WHERE courriel = %s AND id_utilisateur != %s",
                (data["courriel"], user_id)
            )
            if cur.fetchone():
                return {"erreur": "Ce courriel est déjà utilisé"}, 400
            
            updates.append("courriel = %s")
            params.append(data["courriel"])
        
        if "mot_de_passe" in data and data["mot_de_passe"]:
            hashed = hasher_mot_de_passe(data["mot_de_passe"])
            updates.append("mot_de_passe = %s")
            params.append(hashed)
        
        if not updates:
            return {"erreur": "Aucune donnée à mettre à jour"}, 400
        
        # Exécuter la mise à jour
        params.append(user_id)
        query = f"UPDATE utilisateurs SET {', '.join(updates)} WHERE id_utilisateur = %s"
        cur.execute(query, tuple(params))
        conn.commit()
        
        return {"message": "Profil mis à jour avec succès"}, 200
        
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()
