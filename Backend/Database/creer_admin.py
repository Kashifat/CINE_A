"""
Script pour créer un administrateur
"""
import sys
sys.path.append('..')
from config import get_db_connection, hasher_mot_de_passe

def creer_admin():
    """Créer un administrateur"""
    print("=" * 60)
    print("🔐 CRÉATION D'UN ADMINISTRATEUR")
    print("=" * 60)
    
    # Demander les infos
    nom = input("\nNom de l'admin: ").strip()
    courriel = input("Email de l'admin: ").strip()
    mot_de_passe = input("Mot de passe: ").strip()
    role = input("Rôle (Modérateur/Super Admin) [Modérateur]: ").strip() or "Modérateur"
    
    if not nom or not courriel or not mot_de_passe:
        print("❌ Tous les champs sont requis!")
        return
    
    # Connexion BD
    conn = get_db_connection()
    if conn is None:
        print("❌ Erreur de connexion à la base de données")
        return
    
    try:
        cur = conn.cursor()
        
        # Vérifier si l'admin existe déjà
        cur.execute("SELECT id_admin FROM administrateurs WHERE courriel = %s", (courriel,))
        if cur.fetchone():
            print(f"❌ Un admin avec l'email {courriel} existe déjà!")
            conn.close()
            return
        
        # Hasher le mot de passe
        mot_de_passe_hash = hasher_mot_de_passe(mot_de_passe)
        
        # Insérer l'admin
        cur.execute("""
            INSERT INTO administrateurs (nom, courriel, mot_de_passe, role)
            VALUES (%s, %s, %s, %s)
        """, (nom, courriel, mot_de_passe_hash, role))
        
        conn.commit()
        admin_id = cur.lastrowid
        
        print("\n" + "=" * 60)
        print("✅ Administrateur créé avec succès!")
        print("=" * 60)
        print(f"ID: {admin_id}")
        print(f"Nom: {nom}")
        print(f"Email: {courriel}")
        print(f"Rôle: {role}")
        print(f"Mot de passe: {mot_de_passe}")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        conn.rollback()
    finally:
        conn.close()

def lister_admins():
    """Lister tous les administrateurs"""
    conn = get_db_connection()
    if conn is None:
        print("❌ Erreur de connexion à la base de données")
        return
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT id_admin, nom, courriel, role FROM administrateurs")
        admins = cur.fetchall()
        
        print("\n" + "=" * 60)
        print("👥 ADMINISTRATEURS EXISTANTS")
        print("=" * 60)
        
        if admins:
            for admin in admins:
                print(f"ID: {admin['id_admin']}")
                print(f"Nom: {admin['nom']}")
                print(f"Email: {admin['courriel']}")
                print(f"Rôle: {admin['role']}")
                print("-" * 60)
        else:
            print("Aucun administrateur trouvé!")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    print("\n1. Créer un nouvel admin")
    print("2. Lister les admins existants")
    
    choix = input("\nChoix (1-2): ").strip()
    
    if choix == '1':
        creer_admin()
    elif choix == '2':
        lister_admins()
    else:
        print("Choix invalide")
