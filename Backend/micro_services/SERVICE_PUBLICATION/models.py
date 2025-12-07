from config import get_db_connection
from typing import Optional, List, Dict


def ligne_vers_dict(row: Dict) -> Dict:
    """Convertit une ligne de résultat en dict (déjà fait par DictCursor)."""
    return row if row is not None else None


def obtenir_publication(pub_id: int) -> Optional[Dict]:
    """Retourne la publication sous forme de dict ou None si introuvable."""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT id_publication, id_utilisateur, contenu, image, date_ajout, statut 
            FROM publication 
            WHERE id_publication = %s
        """, (pub_id,))
        return cur.fetchone()
    finally:
        conn.close()


def creer_publication(utilisateur_id: int, contenu: str, image: Optional[str] = None) -> Dict:
    """Crée une publication et retourne la ligne insérée."""
    if not isinstance(utilisateur_id, int):
        raise ValueError("utilisateur_id doit être un entier")

    conn = get_db_connection()
    if not conn:
        raise Exception("Erreur de connexion à la base de données")
    
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO publication (id_utilisateur, image, contenu, statut) 
            VALUES (%s, %s, %s, 'en_attente')
        """, (utilisateur_id, image, contenu))
        conn.commit()
        pub_id = cur.lastrowid
        
        cur.execute("""
            SELECT id_publication, id_utilisateur, contenu, image, date_ajout, statut 
            FROM publication 
            WHERE id_publication = %s
        """, (pub_id,))
        return cur.fetchone()
    finally:
        conn.close()


def lister_publications(utilisateur_id: Optional[int] = None) -> List[Dict]:
    """Liste les publications, optionnellement filtrées par utilisateur."""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        if utilisateur_id is None:
            cur.execute("""
                SELECT 
                    p.id_publication, 
                    p.id_utilisateur, 
                    p.contenu, 
                    p.image, 
                    p.date_ajout, 
                    p.statut,
                    COALESCE(u.nom, a.nom, 'Utilisateur') as utilisateur_nom,
                    u.courriel as utilisateur_email
                FROM publication p
                LEFT JOIN utilisateurs u ON p.id_utilisateur = u.id_utilisateur
                LEFT JOIN administrateurs a ON p.id_utilisateur = a.id_admin
                WHERE p.statut = 'valide'
                ORDER BY p.date_ajout DESC
            """)
        else:
            cur.execute("""
                SELECT 
                    p.id_publication, 
                    p.id_utilisateur, 
                    p.contenu, 
                    p.image, 
                    p.date_ajout, 
                    p.statut,
                    COALESCE(u.nom, a.nom, 'Utilisateur') as utilisateur_nom,
                    u.courriel as utilisateur_email
                FROM publication p
                LEFT JOIN utilisateurs u ON p.id_utilisateur = u.id_utilisateur
                LEFT JOIN administrateurs a ON p.id_utilisateur = a.id_admin
                WHERE p.id_utilisateur = %s 
                ORDER BY p.date_ajout DESC
            """, (utilisateur_id,))
        
        return cur.fetchall()
    finally:
        conn.close()


def modifier_publication(pub_id: int, contenu: str) -> Optional[Dict]:
    """Modifie le contenu d'une publication et retourne la publication mise à jour."""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cur = conn.cursor()
        # Vérifier que la publication existe
        cur.execute("SELECT 1 FROM publication WHERE id_publication = %s", (pub_id,))
        if not cur.fetchone():
            return None
        
        # Mettre à jour le contenu
        cur.execute("""
            UPDATE publication 
            SET contenu = %s 
            WHERE id_publication = %s
        """, (contenu, pub_id))
        conn.commit()
        
        # Récupérer la publication mise à jour
        cur.execute("""
            SELECT id_publication, id_utilisateur, contenu, image, date_ajout, statut 
            FROM publication 
            WHERE id_publication = %s
        """, (pub_id,))
        return cur.fetchone()
    finally:
        conn.close()


def supprimer_publication(pub_id: int) -> bool:
    """Supprime une publication. Retourne True si supprimée, False si introuvable."""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM publication WHERE id_publication = %s", (pub_id,))
        if not cur.fetchone():
            return False

        cur.execute("DELETE FROM publication WHERE id_publication = %s", (pub_id,))
        conn.commit()
        return True
    finally:
        conn.close()


def statistiques_publication(pub_id: int) -> Dict:
    """Retourne les statistiques des réactions pour une publication."""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT 1 FROM publication WHERE id_publication = %s", (pub_id,))
        if not cur.fetchone():
            return None

        # Compter le total et par type
        cur.execute("""
            SELECT COUNT(*) AS c 
            FROM publication_reactions 
            WHERE id_publication = %s
        """, (pub_id,))
        total_reactions = cur.fetchone()['c']
        
        # Statistiques par type de réaction
        cur.execute("""
            SELECT type, COUNT(*) as count
            FROM publication_reactions
            WHERE id_publication = %s
            GROUP BY type
        """, (pub_id,))
        stats_types = cur.fetchall()
        
        stats = {
            "id_publication": pub_id,
            "total_reactions": total_reactions,
            "reactions_par_type": {}
        }
        
        # Remplir les stats par type
        for row in stats_types:
            stats["reactions_par_type"][row["type"]] = row["count"]

        return stats
    finally:
        conn.close()

