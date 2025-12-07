"""
Script d'insertion de publications test pour CineA
Insère des publications avec des vraies URLs d'images Unsplash
"""

import pymysql
from config import get_db_connection
from datetime import datetime, timedelta
import random

# URLs d'images réelles depuis Unsplash (cinéma, films, séries)
IMAGES_CINEMA = [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",  # Cinéma rétro
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",  # Bobine de film
    "https://images.unsplash.com/photo-1574267432644-f410f8ec2f5b?w=800",  # Salle de cinéma
    "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800",  # Popcorn
    "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800",  # Caméra vintage
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",  # Clap de cinéma
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",  # Projecteur
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800",  # Néon cinéma
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800",  # Bobines film
    "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800",  # Home cinéma
    "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=800",  # Film noir et blanc
    "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800",  # Ancien cinéma
]

# Contenus variés pour les publications
CONTENUS = [
    "Quel est votre film préféré de tous les temps ? 🎬 Le mien reste un classique intemporel !",
    "Je viens de découvrir une pépite sur CineA ! Les séries documentaires sont incroyables 📺",
    "Soirée cinéma ce soir ! Qui a des recommandations ? Je suis d'humeur pour un bon thriller 🍿",
    "L'ambiance des vieux cinémas me manque... Ces salles avaient tellement de charme ! 🎞️",
    "Marathon de films ce week-end ! Préparez le pop-corn, on ne bouge plus du canapé 😄",
    "Cette scène m'a donné des frissons... Le pouvoir du cinéma est vraiment magique ✨",
    "Qui se souvient de ce film culte ? Les effets spéciaux étaient révolutionnaires pour l'époque !",
    "L'art du cinéma, c'est raconter mille histoires avec une seule image 📸",
    "Les documentaires sur CineA sont une mine d'or ! J'apprends tellement de choses 🎓",
    "Il y a quelque chose de magique à regarder un film au cinéma... L'expérience est unique ! 🎭",
    "Cette série m'a tenu en haleine jusqu'au bout ! Impossible de décrocher 😱",
    "Le cinéma, c'est l'art de transformer des rêves en réalité 🌟",
    "Je me sens nostalgique en regardant ces vieux films... Quelle époque ! 📽️",
    "Les classiques ne vieillissent jamais. Ils restent toujours aussi puissants ! 👏",
    "Vous avez vu la nouvelle série ? Je suis déjà accro au premier épisode ! 🔥",
]

def inserer_publications():
    """Insère des publications test dans la base de données"""
    conn = get_db_connection()
    if not conn:
        print("❌ Erreur de connexion à la base de données")
        return
    
    try:
        cur = conn.cursor(pymysql.cursors.DictCursor)
        
        # Récupérer les utilisateurs existants
        cur.execute("SELECT id_utilisateur, nom FROM utilisateurs")
        utilisateurs = cur.fetchall()
        
        if not utilisateurs:
            print("❌ Aucun utilisateur trouvé dans la base de données")
            return
        
        print(f"📊 {len(utilisateurs)} utilisateurs trouvés")
        print(f"🖼️  {len(IMAGES_CINEMA)} images disponibles")
        print(f"📝 {len(CONTENUS)} contenus disponibles")
        print()
        
        publications_inserees = 0
        
        # Créer des publications pour différents utilisateurs
        for i, contenu in enumerate(CONTENUS):
            # Sélectionner un utilisateur aléatoire
            utilisateur = random.choice(utilisateurs)
            id_utilisateur = utilisateur['id_utilisateur']
            nom_utilisateur = utilisateur['nom']
            
            # Sélectionner une image aléatoire (70% avec image, 30% sans)
            image_url = random.choice(IMAGES_CINEMA) if random.random() < 0.7 else None
            
            # Date aléatoire dans les 30 derniers jours
            jours_passes = random.randint(0, 30)
            heures_passees = random.randint(0, 23)
            date_ajout = datetime.now() - timedelta(days=jours_passes, hours=heures_passees)
            
            # Statut : 80% validé, 15% en attente, 5% refusé
            rand_statut = random.random()
            if rand_statut < 0.80:
                statut = 'valide'
            elif rand_statut < 0.95:
                statut = 'en_attente'
            else:
                statut = 'refuse'
            
            # Insérer la publication
            cur.execute("""
                INSERT INTO publication (id_utilisateur, image, contenu, date_ajout, statut)
                VALUES (%s, %s, %s, %s, %s)
            """, (id_utilisateur, image_url, contenu, date_ajout, statut))
            
            publications_inserees += 1
            
            emoji = "✅" if statut == 'valide' else "⏳" if statut == 'en_attente' else "❌"
            image_info = "🖼️ " if image_url else "📝 "
            print(f"{emoji} {image_info}Publication #{publications_inserees} - {nom_utilisateur} - {statut}")
        
        conn.commit()
        
        print()
        print(f"✅ {publications_inserees} publications insérées avec succès !")
        
        # Afficher les statistiques
        cur.execute("SELECT statut, COUNT(*) as count FROM publication GROUP BY statut")
        stats = cur.fetchall()
        
        print("\n📊 Statistiques des publications :")
        for stat in stats:
            print(f"   {stat['statut']}: {stat['count']}")
        
        # Afficher quelques exemples
        cur.execute("""
            SELECT p.id_publication, u.nom, p.contenu, p.statut, 
                   CASE WHEN p.image IS NOT NULL THEN 'Oui' ELSE 'Non' END as avec_image
            FROM publication p
            JOIN utilisateurs u ON p.id_utilisateur = u.id_utilisateur
            ORDER BY p.date_ajout DESC
            LIMIT 5
        """)
        
        print("\n📋 Dernières publications créées :")
        for pub in cur.fetchall():
            id_pub = pub['id_publication']
            nom = pub['nom']
            contenu_court = pub['contenu']
            statut = pub['statut']
            avec_image = pub['avec_image']
            contenu_apercu = contenu_court[:50] + "..." if len(contenu_court) > 50 else contenu_court
            print(f"   #{id_pub} - {nom} - Image: {avec_image} - {statut}")
            print(f"      \"{contenu_apercu}\"")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'insertion : {e}")
        conn.rollback()
    finally:
        conn.close()

def nettoyer_publications():
    """Supprime toutes les publications (pour reset)"""
    conn = get_db_connection()
    if not conn:
        print("❌ Erreur de connexion à la base de données")
        return
    
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM publication")
        conn.commit()
        print("✅ Toutes les publications ont été supprimées")
    except Exception as e:
        print(f"❌ Erreur : {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("  INSERTION DE PUBLICATIONS TEST - CINEA")
    print("=" * 60)
    print()
    
    # Demander confirmation
    choix = input("Que voulez-vous faire ?\n1. Insérer des publications\n2. Nettoyer toutes les publications\n3. Annuler\n\nChoix (1/2/3) : ")
    
    if choix == "1":
        inserer_publications()
    elif choix == "2":
        confirmation = input("⚠️  Êtes-vous sûr de vouloir supprimer TOUTES les publications ? (oui/non) : ")
        if confirmation.lower() == "oui":
            nettoyer_publications()
        else:
            print("❌ Opération annulée")
    else:
        print("❌ Opération annulée")
    
    print()
    print("=" * 60)
