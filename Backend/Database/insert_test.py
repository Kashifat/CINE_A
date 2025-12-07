"""
======================================================
 Script d'insertion de test pour CINÉA (MariaDB)
 - Administrateurs
 - Utilisateurs
 - Abonnements mensuels / annuels
 - Vérification d'email AVANT insertion
======================================================
"""

from config import get_db_connection


# =====================================================
# Fonction pour vérifier si un email existe
# =====================================================
def email_existe(cursor, table, email):
    cursor.execute(f"SELECT * FROM {table} WHERE courriel = %s", (email,))
    return cursor.fetchone() is not None


# =====================================================
# Fonction principale
# =====================================================
def insert_test_data():
    conn = get_db_connection()
    if conn is None:
        print("❌ Erreur de connexion à la base.")
        return

    cur = conn.cursor()

    print("\n🔄 Insertion des données de test...\n")

    # =====================================================
    # 1️⃣ INSERTION DES ADMINISTRATEURS
    # =====================================================
    print("📋 Insertion des administrateurs...\n")

    admins = [
        ("Admin Principal", "admin@cinea.com", "admin123", "SuperAdmin"),
        ("Sophie Martin", "sophie.martin@cinea.com", "sophie123", "Modérateur"),
        ("Pierre Dubois", "pierre.dubois@cinea.com", "pierre123", "Modérateur"),
        ("Marie Laurent", "marie.laurent@cinea.com", "marie123", "Modérateur"),
        ("Lucas Bernard", "lucas.bernard@cinea.com", "lucas123", "SuperAdmin")
    ]

    for admin in admins:
        nom, email, mdp, role = admin

        if email_existe(cur, "administrateurs", email):
            print(f"   ⚠️ ADMIN EXISTE DÉJÀ : {email}")
        else:
            cur.execute("""
                INSERT INTO administrateurs (nom, courriel, mot_de_passe, role)
                VALUES (%s, %s, %s, %s)
            """, (nom, email, mdp, role))
            print(f"   ✅ Administrateur ajouté : {nom}")

    conn.commit()

    # =====================================================
    # 2️⃣ INSERTION DES UTILISATEURS
    # =====================================================
    print("\n👥 Insertion des utilisateurs...\n")

    utilisateurs = [
        ("Jean Dupont", "jean.dupont@email.com", "jean123", "mensuel"),
        ("Emma Moreau", "emma.moreau@email.com", "emma123", "annuel"),
        ("Thomas Petit", "thomas.petit@email.com", "thomas123", "mensuel"),
        ("Léa Robert", "lea.robert@email.com", "lea123", "annuel"),
        ("Hugo Simon", "hugo.simon@email.com", "hugo123", "mensuel")
    ]

    for user in utilisateurs:
        nom, email, mdp, type_abonnement = user

        if email_existe(cur, "utilisateurs", email):
            print(f"   ⚠️ UTILISATEUR EXISTE DÉJÀ : {email}")
            continue

        # 1. Insert utilisateur
        cur.execute("""
            INSERT INTO utilisateurs (nom, courriel, mot_de_passe)
            VALUES (%s, %s, %s)
        """, (nom, email, mdp))

        id_user = cur.lastrowid
        print(f"   ✅ Utilisateur ajouté : {nom} (ID = {id_user})")

        # 2. Insert abonnement
        if type_abonnement == "mensuel":
            cur.execute("""
                INSERT INTO abonnements (id_utilisateur, type, date_debut, date_fin, actif)
                VALUES (%s, 'mensuel', NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 1)
            """, (id_user,))
        else:
            cur.execute("""
                INSERT INTO abonnements (id_utilisateur, type, date_debut, date_fin, actif)
                VALUES (%s, 'annuel', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 1)
            """, (id_user,))

        print(f"      ➕ Abonnement créé : {type_abonnement}\n")

    conn.commit()

    # =====================================================
    # 3️⃣ STATISTIQUES
    # =====================================================
    print("📊 STATISTIQUES FINALES :\n")

    # TOTAL ADMIN
    cur.execute("SELECT COUNT(*) AS total FROM administrateurs")
    print("   • Administrateurs :", cur.fetchone()["total"])

    # TOTAL UTILISATEURS
    cur.execute("SELECT COUNT(*) AS total FROM utilisateurs")
    print("   • Utilisateurs    :", cur.fetchone()["total"])

    # TOTAL ABONNEMENTS
    cur.execute("SELECT type, COUNT(*) AS total FROM abonnements GROUP BY type")
    print("\n   Répartition des abonnements :")
    for row in cur.fetchall():
        print(f"     - {row['type']} : {row['total']} utilisateur(s)")

    conn.close()
    print("\n✅ Insertion terminée avec succès.\n")


# =====================================================
# Lancement du script
# =====================================================
if __name__ == "__main__":
    insert_test_data()
