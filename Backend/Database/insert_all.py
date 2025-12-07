"""
======================================================
 Script d'insertion de données supplémentaires
 pour la base de données CINÉA (MariaDB)

 - Catégories
 - Films supplémentaires
 - Séries, saisons, épisodes supplémentaires
 - Avis
 - Historiques de visionnage
 - Paiements
 - Favoris
 - Publications
 - Réactions sur publications
 - Commentaires et réponses
======================================================
"""

from config import get_db_connection

# =====================================================
# Fonction utilitaire : récupérer des IDs d'une table
# =====================================================
def obtenir_ids(curseur, table, colonne, limite=5):
    """
    Retourne une liste d'IDs à partir d'une table donnée.
    """
    curseur.execute(f"SELECT {colonne} FROM {table} ORDER BY {colonne} ASC LIMIT {limite}")
    lignes = curseur.fetchall()
    return [ligne[colonne] for ligne in lignes]


# =====================================================
# FONCTION PRINCIPALE
# =====================================================
def inserer_donnees_supplementaires():
    connexion = get_db_connection()

    if connexion is None:
        print("❌ Erreur : impossible de se connecter à la base.")
        return

    curseur = connexion.cursor()

    print("\n🔄 Insertion des données supplémentaires...\n")

    try:
        # =====================================================
        # 1️⃣ CATEGORIES
        # =====================================================
        print("📁 Vérification des catégories...")

        curseur.execute("SELECT COUNT(*) AS total FROM categories")
        total_categories = curseur.fetchone()["total"]

        if total_categories == 0:
            print("👉 Aucune catégorie trouvée. Insertion des catégories par défaut...")
            curseur.executemany(
                "INSERT INTO categories (nom) VALUES (%s)",
                [
                    ("Action",),
                    ("Drame",),
                    ("Comédie",),
                    ("Romance",),
                    ("Série",),
                    ("Documentaire",),
                ],
            )
            print("   ✅ Catégories insérées.")
        else:
            print(f"👍 {total_categories} catégories déjà présentes.")

        # =====================================================
        # Récupération d'IDs utiles
        # =====================================================
        id_utilisateurs = obtenir_ids(curseur, "utilisateurs", "id_utilisateur", limite=10)
        id_films = obtenir_ids(curseur, "films", "id_film", limite=10)
        id_series = obtenir_ids(curseur, "series", "id_serie", limite=10)

        # Si pas d'utilisateurs ou films → avertissement
        if not id_utilisateurs:
            print("⚠️ Aucun utilisateur trouvé. Exécute d'abord insert_users_admins.py.")
        if not id_films:
            print("⚠️ Aucun film trouvé. Exécute d'abord insert.py.")
        if not id_series:
            print("⚠️ Aucune série trouvée. Exécute d'abord insert.py.")

        # =====================================================
        # 2️⃣ FILM SUPPLÉMENTAIRE
        # =====================================================
        print("\n🎬 Ajout d'un deuxième film...")

        curseur.execute("SELECT id_categorie FROM categories LIMIT 1")
        ligne_cat = curseur.fetchone()
        id_cat = ligne_cat["id_categorie"] if ligne_cat else None

        curseur.execute(
            """
            INSERT INTO films
            (titre, description, id_categorie, lien_vo, lien_vf, bande_annonce,
             affiche, date_sortie, duree, pays, type)
            VALUES
            (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Film')
            """,
            (
                "Film 2 - La Suite",
                "Deuxième film utilisé pour les tests.",
                id_cat,
                "http://localhost:5002/media/films/film2_vo.mp4",
                "http://localhost:5002/media/films/film2_vf.mp4",
                "http://localhost:5002/media/bande_annonces/film2_trailer.mp4",
                "http://localhost:5002/media/images/img_film2.jpg",
                "2025-03-10",
                "01:10:00",
                "Côte d'Ivoire",
            ),
        )

        id_film2 = curseur.lastrowid
        id_films.append(id_film2)
        print(f"   ✅ Film 2 ajouté (ID = {id_film2})")

        # =====================================================
        # 3️⃣ SÉRIE + SAISON + ÉPISODES
        # =====================================================
        print("\n📺 Ajout d'une deuxième série...")

        curseur.execute(
            """
            INSERT INTO series
            (titre, description, id_categorie, affiche, bande_annonce, date_sortie, pays)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                "Série 2 - Les Retours",
                "Deuxième série de test pour démonstration.",
                id_cat,
                "http://localhost:5002/media/images/img_serie2.jpg",
                "http://localhost:5002/media/bande_annonces/serie2_trailer.mp4",
                "2025-04-01",
                "Côte d'Ivoire",
            ),
        )

        id_serie2 = curseur.lastrowid
        print(f"   ✅ Série 2 insérée (ID = {id_serie2})")

        # Saison 1
        curseur.execute(
            """
            INSERT INTO saisons (id_serie, numero_saison, titre, annee)
            VALUES (%s, %s, %s, %s)
            """,
            (id_serie2, 1, "Saison 1 - Origines", "2025"),
        )

        id_saison2_1 = curseur.lastrowid
        print(f"   📦 Saison 1 créée (ID = {id_saison2_1})")

        # Épisode 1
        curseur.execute(
            """
            INSERT INTO episodes
            (id_saison, titre, description, lien_vo, lien_vf, bande_annonce, duree, numero_episode)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                id_saison2_1,
                "Épisode 1 - Le Retour",
                "Premier épisode de la série 2.",
                "http://localhost:5002/media/series/serie2/saison1/eps1_vo.mp4",
                "http://localhost:5002/media/series/serie2/saison1/eps1_vf.mp4",
                "http://localhost:5002/media/bande_annonces/serie2_trailer.mp4",
                "00:30:00",
                1,
            ),
        )
        id_episode21 = curseur.lastrowid

        # Épisode 2
        curseur.execute(
            """
            INSERT INTO episodes
            (id_saison, titre, description, lien_vo, lien_vf, bande_annonce, duree, numero_episode)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                id_saison2_1,
                "Épisode 2 - La Chute",
                "Deuxième épisode de la série 2.",
                "http://localhost:5002/media/series/serie2/saison1/eps2_vo.mp4",
                "http://localhost:5002/media/series/serie2/saison1/eps2_vf.mp4",
                "http://localhost:5002/media/bande_annonces/serie2_trailer.mp4",
                "00:32:00",
                2,
            ),
        )
        id_episode22 = curseur.lastrowid

        print(f"   🎞️ Épisodes ajoutés : {id_episode21}, {id_episode22}")

        # =====================================================
        # 4️⃣ AVIS
        # =====================================================
        print("\n⭐ Insertion d'avis...")

        if id_utilisateurs and id_films:
            avis = [
                (id_utilisateurs[0], id_films[0], 5, "Magnifique film !"),
                (id_utilisateurs[1], id_films[0], 4, "Très bon scénario."),
                (id_utilisateurs[2], id_films[1], 3, "Pas mauvais."),
            ]

            curseur.executemany(
                """
                INSERT INTO avis (id_utilisateur, id_film, note, commentaire)
                VALUES (%s, %s, %s, %s)
                """,
                avis,
            )
            print("   ✅ Avis insérés.")
        else:
            print("   ⚠️ Pas d'avis possible (utilisateurs ou films manquants).")

        # =====================================================
        # 5️⃣ HISTORIQUES
        # =====================================================
        print("\n🕒 Insertion d'historiques de visionnage...")

        if id_utilisateurs and id_films:
            historiques = [
                (id_utilisateurs[0], id_films[0], "00:12:00"),
                (id_utilisateurs[1], id_films[1], "00:45:00"),
                (id_utilisateurs[2], id_films[0], "00:22:00"),
            ]

            curseur.executemany(
                """
                INSERT INTO historiques (id_utilisateur, id_film, position)
                VALUES (%s, %s, %s)
                """,
                historiques,
            )
            print("   ✅ Historiques insérés.")
        else:
            print("   ⚠️ Historique non inséré (manque données).")

        # =====================================================
        # 6️⃣ PAIEMENTS
        # =====================================================
        print("\n💳 Insertion de paiements...")

        if id_utilisateurs:
            paiements = [
                (id_utilisateurs[0], 9.99, "Mobile Money", "Réussi"),
                (id_utilisateurs[1], 99.99, "Carte bancaire", "Réussi"),
                (id_utilisateurs[2], 9.99, "Mobile Money", "En attente"),
            ]

            curseur.executemany(
                """
                INSERT INTO paiements (id_utilisateur, montant, methode, statut)
                VALUES (%s, %s, %s, %s)
                """,
                paiements,
            )
            print("   ✅ Paiements insérés.")
        else:
            print("   ⚠️ Paiements non insérés.")

        # =====================================================
        # 7️⃣ FAVORIS
        # =====================================================
        print("\n❤️ Ajout de favoris...")

        if id_utilisateurs and id_films:
            favoris = [
                (id_utilisateurs[0], id_films[0]),
                (id_utilisateurs[1], id_films[1]),
                (id_utilisateurs[2], id_films[0]),
            ]

            for fav in favoris:
                try:
                    curseur.execute(
                        """
                        INSERT INTO favoris (id_utilisateur, id_film)
                        VALUES (%s, %s)
                        """,
                        fav,
                    )
                    print(f"   ❤️ Favori ajouté : user {fav[0]} → film {fav[1]}")
                except:
                    print(f"   ⚠️ Favori déjà existant : {fav}")

        # =====================================================
        # 8️⃣ PUBLICATIONS
        # =====================================================
        print("\n📰 Insertion de publications...")

        publications = []
        if id_utilisateurs:
            publications = [
                (id_utilisateurs[0], "http://localhost:5002/media/images/post1.jpg",
                 "Bienvenue sur CinéA, la plateforme africaine !", "valide"),
                (id_utilisateurs[1], None,
                 "Quel est votre film préféré sur CinéA ?", "en_attente"),
            ]

            curseur.executemany(
                """
                INSERT INTO publication (id_utilisateur, image, contenu, statut)
                VALUES (%s, %s, %s, %s)
                """,
                publications,
            )

            curseur.execute("SELECT id_publication FROM publication ORDER BY id_publication DESC LIMIT 2")
            id_publications = [l["id_publication"] for l in curseur.fetchall()][::-1]

            print(f"   📰 Publications ajoutées : {id_publications}")
        else:
            print("   ⚠️ Pas d'utilisateurs → pas de publications.")

        # =====================================================
        # 9️⃣ REACTIONS
        # =====================================================
        print("\n👍 Insertion de réactions...")

        if id_publications and id_utilisateurs:
            reactions = [
                (id_publications[0], id_utilisateurs[1], "like"),
                (id_publications[0], id_utilisateurs[2], "adore"),
            ]

            curseur.executemany(
                """
                INSERT INTO publication_reactions (id_publication, id_utilisateur, type)
                VALUES (%s, %s, %s)
                """,
                reactions,
            )
            print("   👍 Réactions ajoutées.")

        # =====================================================
        # 🔟 COMMENTAIRES
        # =====================================================
        print("\n💬 Insertion de commentaires...")

        if id_publications and id_utilisateurs:
            # Commentaire principal
            curseur.execute(
                """
                INSERT INTO publication_commentaires
                (id_publication, id_utilisateur, id_parent_commentaire, contenu)
                VALUES (%s, %s, %s, %s)
                """,
                (id_publications[0], id_utilisateurs[2], None, "J'adore cette plateforme !"),
            )
            id_com1 = curseur.lastrowid

            # Réponse
            curseur.execute(
                """
                INSERT INTO publication_commentaires
                (id_publication, id_utilisateur, id_parent_commentaire, contenu)
                VALUES (%s, %s, %s, %s)
                """,
                (id_publications[0], id_utilisateurs[0], id_com1, "Merci beaucoup pour ton soutien 😊"),
            )

            print("   💬 Commentaires + réponses insérés.")
        else:
            print("   ⚠️ Impossible d'insérer des commentaires.")

        # =====================================================
        # VALIDATION FINALE
        # =====================================================
        connexion.commit()
        print("\n🎉 Toutes les données supplémentaires ont été insérées avec succès.\n")

    except Exception as e:
        connexion.rollback()
        print("❌ Erreur lors de l'insertion :", e)

    finally:
        connexion.close()
        print("🔚 Connexion fermée.")


# =====================================================
# Lancement
# =====================================================
if __name__ == "__main__":
    inserer_donnees_supplementaires()
