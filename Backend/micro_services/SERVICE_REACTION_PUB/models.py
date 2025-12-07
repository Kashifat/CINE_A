from config import get_db_connection
from typing import Optional, List, Dict

def ligne_vers_dict(row: Dict) -> Dict:
    """Convertit une ligne de résultat en dict (déjà fait par DictCursor)."""
    return row if row is not None else None

def ajouter_reaction(utilisateur_id: int, publication_id: int, type_reaction: str = 'like') -> Optional[Dict]:
    """Ajoute une réaction à une publication. Retourne None si déjà existante.
    
    Args:
        utilisateur_id: ID de l'utilisateur
        publication_id: ID de la publication
        type_reaction: Type de réaction (like, adore, triste, rigole, surpris, en_colere)
    """
    # Types de réactions valides
    types_valides = ['like', 'adore', 'triste', 'rigole', 'surpris', 'en_colere']
    if type_reaction not in types_valides:
        raise ValueError(f"Type de réaction invalide. Types valides: {', '.join(types_valides)}")
    
    conn = get_db_connection()
    if not conn:
        raise Exception("Erreur de connexion à la base de données")
    
    try:
        cur = conn.cursor()
        # Vérifier si une réaction existe déjà
        cur.execute("""
            SELECT id_reaction, type 
            FROM publication_reactions 
            WHERE id_utilisateur = %s AND id_publication = %s
        """, (utilisateur_id, publication_id))
        existe = cur.fetchone()
        
        if existe:
            # Si même type, retourner None (doublon)
            if existe['type'] == type_reaction:
                return None
            # Si type différent, mettre à jour
            cur.execute("""
                UPDATE publication_reactions 
                SET type = %s 
                WHERE id_utilisateur = %s AND id_publication = %s
            """, (type_reaction, utilisateur_id, publication_id))
            conn.commit()
            
            cur.execute("""
                SELECT id_reaction, id_utilisateur, id_publication, type, date_ajout 
                FROM publication_reactions 
                WHERE id_reaction = %s
            """, (existe['id_reaction'],))
            return cur.fetchone()
        
        # Créer une nouvelle réaction
        cur.execute("""
            INSERT INTO publication_reactions (id_utilisateur, id_publication, type) 
            VALUES (%s, %s, %s)
        """, (utilisateur_id, publication_id, type_reaction))
        conn.commit()
        reaction_id = cur.lastrowid
        
        cur.execute("""
            SELECT id_reaction, id_utilisateur, id_publication, type, date_ajout 
            FROM publication_reactions 
            WHERE id_reaction = %s
        """, (reaction_id,))
        
        return cur.fetchone()
    finally:
        conn.close()

def supprimer_reaction(utilisateur_id: int, publication_id: int) -> bool:
    """Supprime une réaction. Retourne True si supprimée, False si introuvable."""
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 1 FROM publication_reactions 
            WHERE id_utilisateur = %s AND id_publication = %s
        """, (utilisateur_id, publication_id))
        
        if not cur.fetchone():
            return False
        
        cur.execute("""
            DELETE FROM publication_reactions 
            WHERE id_utilisateur = %s AND id_publication = %s
        """, (utilisateur_id, publication_id))
        conn.commit()
        return True
    finally:
        conn.close()

def get_reactions_publication(publication_id: int) -> List[Dict]:
    """Retourne toutes les réactions d'une publication avec les infos utilisateurs."""
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                pr.id_reaction,
                pr.id_utilisateur,
                pr.id_publication,
                pr.type,
                pr.date_ajout,
                u.nom,
                u.courriel as email
            FROM publication_reactions pr
            LEFT JOIN utilisateurs u ON pr.id_utilisateur = u.id_utilisateur
            WHERE pr.id_publication = %s
            ORDER BY pr.date_ajout DESC
        """, (publication_id,))
        
        return cur.fetchall()
    finally:
        conn.close()

def verifier_reaction_utilisateur(utilisateur_id: int, publication_id: int) -> Optional[str]:
    """Vérifie si un utilisateur a déjà réagi à une publication.
    Retourne le type de réaction ou None."""
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT type FROM publication_reactions 
            WHERE id_utilisateur = %s AND id_publication = %s
        """, (utilisateur_id, publication_id))
        row = cur.fetchone()
        
        return row['type'] if row else None
    finally:
        conn.close()

def get_statistiques_reactions(publication_id: int) -> Dict:
    """Retourne les statistiques des réactions par type pour une publication."""
    conn = get_db_connection()
    if not conn:
        return {"id_publication": publication_id, "total": 0}
    
    try:
        cur = conn.cursor()
        # Compter chaque type de réaction
        cur.execute("""
            SELECT type, COUNT(*) as count
            FROM publication_reactions
            WHERE id_publication = %s
            GROUP BY type
        """, (publication_id,))
        rows = cur.fetchall()
        
        stats = {"id_publication": publication_id, "total": 0}
        for row in rows:
            stats[row['type']] = row['count']
            stats['total'] += row['count']
        
        # Ajouter les types manquants avec 0
        for type_reaction in ['like', 'adore', 'triste', 'rigole', 'surpris', 'en_colere']:
            if type_reaction not in stats:
                stats[type_reaction] = 0
        
        return stats
    finally:
        conn.close()
