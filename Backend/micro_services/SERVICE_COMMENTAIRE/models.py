from config import get_db_connection
from typing import Optional, List, Dict

# ============================================================================
# SERVICE COMMENTAIRE - Gestion des commentaires sur publications
# ============================================================================
# Ce service permet de:
# 1. Ajouter des commentaires sur des publications
# 2. Répondre à des commentaires (commentaires imbriqués)
# 3. Récupérer tous les commentaires d'une publication
# 4. Modifier et supprimer des commentaires
# ============================================================================


def ajouter_commentaire(id_publication: int, id_utilisateur: int, contenu: str, 
                        id_parent_commentaire: Optional[int] = None) -> Optional[Dict]:
    """
    Ajoute un commentaire à une publication ou répond à un commentaire existant.
    
    Args:
        id_publication: ID de la publication
        id_utilisateur: ID de l'utilisateur qui commente
        contenu: Texte du commentaire
        id_parent_commentaire: ID du commentaire parent (None pour commentaire principal)
    
    Returns:
        Dict avec le commentaire créé ou None en cas d'erreur
    """
    if not contenu or not contenu.strip():
        raise ValueError("Le contenu du commentaire ne peut pas être vide")
    
    conn = get_db_connection()
    if not conn:
        raise Exception("Erreur de connexion à la base de données")
    
    try:
        cur = conn.cursor()
        
        # Vérifier que la publication existe
        cur.execute("SELECT 1 FROM publication WHERE id_publication = %s", (id_publication,))
        if not cur.fetchone():
            raise ValueError("Publication introuvable")
        
        # Si c'est une réponse, vérifier que le commentaire parent existe
        if id_parent_commentaire:
            cur.execute("""
                SELECT 1 FROM publication_commentaires 
                WHERE id_commentaire = %s AND id_publication = %s
            """, (id_parent_commentaire, id_publication))
            if not cur.fetchone():
                raise ValueError("Commentaire parent introuvable")
        
        # Insérer le commentaire
        cur.execute("""
            INSERT INTO publication_commentaires 
            (id_publication, id_utilisateur, contenu, id_parent_commentaire)
            VALUES (%s, %s, %s, %s)
        """, (id_publication, id_utilisateur, contenu.strip(), id_parent_commentaire))
        conn.commit()
        
        commentaire_id = cur.lastrowid
        
        # Récupérer le commentaire créé avec les infos utilisateur
        cur.execute("""
            SELECT 
                c.id_commentaire,
                c.id_publication,
                c.id_utilisateur,
                c.id_parent_commentaire,
                c.contenu,
                c.date_ajout,
                u.nom as nom_utilisateur,
                u.photo_profil
            FROM publication_commentaires c
            LEFT JOIN utilisateurs u ON c.id_utilisateur = u.id_utilisateur
            WHERE c.id_commentaire = %s
        """, (commentaire_id,))
        
        return cur.fetchone()
    finally:
        conn.close()


def get_commentaires_publication(id_publication: int) -> List[Dict]:
    """
    Récupère tous les commentaires d'une publication avec leurs réponses.
    
    Args:
        id_publication: ID de la publication
    
    Returns:
        Liste de commentaires avec infos utilisateur
    """
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        
        # Récupérer tous les commentaires avec infos utilisateur
        cur.execute("""
            SELECT 
                c.id_commentaire,
                c.id_publication,
                c.id_utilisateur,
                c.id_parent_commentaire,
                c.contenu,
                c.date_ajout,
                u.nom as nom_utilisateur,
                u.photo_profil
            FROM publication_commentaires c
            LEFT JOIN utilisateurs u ON c.id_utilisateur = u.id_utilisateur
            WHERE c.id_publication = %s
            ORDER BY c.date_ajout ASC
        """, (id_publication,))
        
        commentaires = cur.fetchall()
        
        # Organiser les commentaires en arborescence
        # Commentaires principaux + leurs réponses
        commentaires_dict = {c['id_commentaire']: {**c, 'reponses': []} for c in commentaires}
        
        commentaires_principaux = []
        for commentaire in commentaires:
            if commentaire['id_parent_commentaire'] is None:
                commentaires_principaux.append(commentaires_dict[commentaire['id_commentaire']])
            else:
                parent_id = commentaire['id_parent_commentaire']
                if parent_id in commentaires_dict:
                    commentaires_dict[parent_id]['reponses'].append(
                        commentaires_dict[commentaire['id_commentaire']]
                    )
        
        return commentaires_principaux
    finally:
        conn.close()


def get_commentaire_par_id(id_commentaire: int) -> Optional[Dict]:
    """
    Récupère un commentaire spécifique par son ID.
    
    Args:
        id_commentaire: ID du commentaire
    
    Returns:
        Dict avec le commentaire ou None si introuvable
    """
    conn = get_db_connection()
    if not conn:
        return None
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                c.id_commentaire,
                c.id_publication,
                c.id_utilisateur,
                c.id_parent_commentaire,
                c.contenu,
                c.date_ajout,
                u.nom as nom_utilisateur,
                u.photo_profil
            FROM publication_commentaires c
            LEFT JOIN utilisateurs u ON c.id_utilisateur = u.id_utilisateur
            WHERE c.id_commentaire = %s
        """, (id_commentaire,))
        
        return cur.fetchone()
    finally:
        conn.close()


def modifier_commentaire(id_commentaire: int, id_utilisateur: int, nouveau_contenu: str) -> bool:
    """
    Modifie le contenu d'un commentaire.
    Seul l'auteur peut modifier son commentaire.
    
    Args:
        id_commentaire: ID du commentaire
        id_utilisateur: ID de l'utilisateur (pour vérification)
        nouveau_contenu: Nouveau texte du commentaire
    
    Returns:
        True si modifié, False sinon
    """
    if not nouveau_contenu or not nouveau_contenu.strip():
        raise ValueError("Le contenu du commentaire ne peut pas être vide")
    
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        
        # Vérifier que le commentaire appartient à l'utilisateur
        cur.execute("""
            SELECT 1 FROM publication_commentaires 
            WHERE id_commentaire = %s AND id_utilisateur = %s
        """, (id_commentaire, id_utilisateur))
        
        if not cur.fetchone():
            return False
        
        # Mettre à jour le contenu
        cur.execute("""
            UPDATE publication_commentaires 
            SET contenu = %s 
            WHERE id_commentaire = %s
        """, (nouveau_contenu.strip(), id_commentaire))
        conn.commit()
        
        return cur.rowcount > 0
    finally:
        conn.close()


def supprimer_commentaire(id_commentaire: int, id_utilisateur: int) -> bool:
    """
    Supprime un commentaire et toutes ses réponses (CASCADE).
    Seul l'auteur peut supprimer son commentaire.
    
    Args:
        id_commentaire: ID du commentaire
        id_utilisateur: ID de l'utilisateur (pour vérification)
    
    Returns:
        True si supprimé, False sinon
    """
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        
        # Vérifier que le commentaire appartient à l'utilisateur
        cur.execute("""
            SELECT 1 FROM publication_commentaires 
            WHERE id_commentaire = %s AND id_utilisateur = %s
        """, (id_commentaire, id_utilisateur))
        
        if not cur.fetchone():
            return False
        
        # Supprimer le commentaire (les réponses seront supprimées par CASCADE)
        cur.execute("""
            DELETE FROM publication_commentaires 
            WHERE id_commentaire = %s
        """, (id_commentaire,))
        conn.commit()
        
        return cur.rowcount > 0
    finally:
        conn.close()


def get_commentaires_utilisateur(id_utilisateur: int) -> List[Dict]:
    """
    Récupère tous les commentaires d'un utilisateur.
    
    Args:
        id_utilisateur: ID de l'utilisateur
    
    Returns:
        Liste des commentaires de l'utilisateur
    """
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT 
                c.id_commentaire,
                c.id_publication,
                c.id_utilisateur,
                c.id_parent_commentaire,
                c.contenu,
                c.date_ajout,
                p.contenu as contenu_publication
            FROM publication_commentaires c
            LEFT JOIN publication p ON c.id_publication = p.id_publication
            WHERE c.id_utilisateur = %s
            ORDER BY c.date_ajout DESC
        """, (id_utilisateur,))
        
        return cur.fetchall()
    finally:
        conn.close()


def compter_commentaires_publication(id_publication: int) -> int:
    """
    Compte le nombre total de commentaires sur une publication.
    
    Args:
        id_publication: ID de la publication
    
    Returns:
        Nombre de commentaires
    """
    conn = get_db_connection()
    if not conn:
        return 0
    
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(*) as total 
            FROM publication_commentaires 
            WHERE id_publication = %s
        """, (id_publication,))
        
        result = cur.fetchone()
        return result['total'] if result else 0
    finally:
        conn.close()
