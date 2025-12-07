# ==============================================
# insert.py
# Insertion de données de test dans la BD CINEA
# - 1 film (VO/VF)
# - 1 série
# - 1 saison
# - 1 épisode
# ==============================================

from config import get_db_connection

def inserer_donnees_demo():
    conn = get_db_connection()
    if conn is None:
        print("❌ Impossible de se connecter à la base. Vérifie config.py.")
        return

    try:
        cur = conn.cursor()

        print("\n===== INSERTION DE DONNÉES DANS CINEA =====\n")

        # ==============================
        #  FILM
        # ==============================
        film_titre = "Film 1 - Le Début"
        film_description = "Un film de démonstration pour tester la lecture VF/VO et la bande-annonce."
        categorie_id = 1  # Action (doit exister dans la table categories)
        lien_vo = "http://localhost:5002/media/films/film1_vo.mp4"
        lien_vf = "http://localhost:5002/media/films/film1_vf.mp4"
        bande_annonce = "http://localhost:5002/media/bande_annonces/film1_trailer.mp4"
        affiche = "http://localhost:5002/media/images/img_film1.jpg"
        date_sortie = "2025-01-01"
        duree = "00:25:00"
        pays = "Côte d'Ivoire"

        sql_film = """
        INSERT INTO films (titre, description, id_categorie, lien_vo, lien_vf, bande_annonce, affiche, date_sortie, duree, pays, type)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Film')
        """

        cur.execute(sql_film, (
            film_titre,
            film_description,
            categorie_id,
            lien_vo,
            lien_vf,
            bande_annonce,
            affiche,
            date_sortie,
            duree,
            pays
        ))

        film_id = cur.lastrowid
        print(f"🎬 Film inséré avec succès ! ID = {film_id}")

        # ==============================
        #  SÉRIE
        # ==============================
        serie_titre = "Série 1 - Les Débuts"
        serie_description = "Une série fictive de test avec 1 saison et 1 épisode VF/VO."
        serie_categorie_id = 1  # Action
        serie_affiche = "http://localhost:5002/media/images/img_film1.jpg"
        serie_bande_annonce = "http://localhost:5002/media/bande_annonces/film1_trailer.mp4"
        serie_date_sortie = "2025-02-01"
        serie_pays = "Côte d'Ivoire"

        sql_serie = """
        INSERT INTO series (titre, description, id_categorie, affiche, bande_annonce, date_sortie, pays)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        cur.execute(sql_serie, (
            serie_titre,
            serie_description,
            serie_categorie_id,
            serie_affiche,
            serie_bande_annonce,
            serie_date_sortie,
            serie_pays
        ))

        serie_id = cur.lastrowid
        print(f"📺 Série insérée avec succès ! ID = {serie_id}")

        # ==============================
        #  SAISON 1
        # ==============================
        sql_saison = """
        INSERT INTO saisons (id_serie, numero_saison, titre, annee)
        VALUES (%s, %s, %s, %s)
        """

        cur.execute(sql_saison, (serie_id, 1, "Saison 1", "2025"))
        saison1_id = cur.lastrowid

        print(f"📦 Saison 1 insérée ! ID = {saison1_id}")

        # ==============================
        #  ÉPISODE 1 DE LA SAISON 1
        # ==============================
        episode_titre = "Épisode 1 - Première Scène"
        episode_description = "Premier épisode de la série de test."
        lien_vo_episode = "http://localhost:5002/media/series/serie1/saison1/eps1_vo.mp4"
        lien_vf_episode = "http://localhost:5002/media/series/serie1/saison1/eps1_vf.mp4"
        duree_episode = "00:24:00"

        sql_episode = """
        INSERT INTO episodes (id_saison, titre, description, lien_vo, lien_vf, bande_annonce, duree, numero_episode)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        cur.execute(sql_episode, (
            saison1_id,
            episode_titre,
            episode_description,
            lien_vo_episode,
            lien_vf_episode,
            serie_bande_annonce,  # on réutilise la bande annonce de la série
            duree_episode,
            1
        ))

        episode1_id = cur.lastrowid
        print(f"🎞️ Épisode 1 inséré ! ID = {episode1_id}")

        # ==============================
        #  VALIDATION
        # ==============================
        conn.commit()
        print("\n✅ INSERTIONS TERMINÉES AVEC SUCCÈS !\n")

    except Exception as e:
        conn.rollback()
        print("❌ Erreur lors de l'insertion :")
        print(e)

    finally:
        conn.close()
        print("🔚 Connexion fermée.")


if __name__ == "__main__":
    inserer_donnees_demo()
