"""
Script rapide pour créer un admin de test
"""
import sys
sys.path.append('..')
from config import get_db_connection, hasher_mot_de_passe

# Admin de test
ADMIN_TEST = {
    'nom': 'Admin CineA',
    'courriel': 'admin@cinea.com',
    'mot_de_passe': 'admin123',
    'role': 'Super Admin'
}

conn = get_db_connection()
if conn is None:
    print("❌ Erreur de connexion à la base de données")
    exit(1)

try:
    cur = conn.cursor()
    
    # Vérifier si l'admin existe déjà
    cur.execute("SELECT id_admin FROM administrateurs WHERE courriel = %s", (ADMIN_TEST['courriel'],))
    if cur.fetchone():
        print(f"⚠️  Admin {ADMIN_TEST['courriel']} existe déjà!")
    else:
        # Hasher le mot de passe
        mot_de_passe_hash = hasher_mot_de_passe(ADMIN_TEST['mot_de_passe'])
        
        # Insérer l'admin
        cur.execute("""
            INSERT INTO administrateurs (nom, courriel, mot_de_passe, role)
            VALUES (%s, %s, %s, %s)
        """, (ADMIN_TEST['nom'], ADMIN_TEST['courriel'], mot_de_passe_hash, ADMIN_TEST['role']))
        
        conn.commit()
        print("✅ Admin de test créé avec succès!")
    
    # Lister tous les admins
    cur.execute("SELECT id_admin, nom, courriel, role FROM administrateurs")
    admins = cur.fetchall()
    
    print("\n" + "=" * 60)
    print("👥 ADMINISTRATEURS")
    print("=" * 60)
    for admin in admins:
        print(f"ID: {admin['id_admin']}")
        print(f"Nom: {admin['nom']}")
        print(f"Email: {admin['courriel']}")
        print(f"Rôle: {admin['role']}")
        print("-" * 60)
    
    print("\n🔐 IDENTIFIANTS DE TEST:")
    print(f"Email: {ADMIN_TEST['courriel']}")
    print(f"Mot de passe: {ADMIN_TEST['mot_de_passe']}")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Erreur: {e}")
    conn.rollback()
finally:
    conn.close()
