from config import get_db_connection
from typing import Optional, List, Dict
from datetime import datetime, timedelta

# ============================================================================
# SERVICE NOTIFICATION - Gestion des notifications sociales
# ============================================================================
# Ce service permet de:
# 1. Créer des notifications pour likes, commentaires, réponses
# 2. Lister les notifications d'un utilisateur (lues/non-lues)
# 3. Marquer les notifications comme lues
# 4. Supprimer automatiquement après 3 mois
# ============================================================================


def creer_notification(id_utilisateur_cible: int, id_utilisateur_source: int, 
                      type_notification: str, id_publication: Optional[int] = None,
                      id_commentaire: Optional[int] = None, message: Optional[str] = None) -> Optional[Dict]:
    """
    Crée une notification pour une action sociale.
    
    Args:
        id_utilisateur_cible: Utilisateur qui reçoit la notification
        id_utilisateur_source: Utilisateur qui a fait l'action
        type_notification: Type ('like_publication', 'commentaire_publication', 'reponse_commentaire')
        id_publication: ID de la publication (optionnel)
        id_commentaire: ID du commentaire (optionnel)
        message: Message personnalisé (auto-généré si None)
    
    Returns:
        Dict avec la notification créée ou None en cas d'erreur
    
    Exemples:
        • Like publication:     creer_notification(bob_id, alice_id, 'like_publication', id_publication=123)
        • Commentaire:          creer_notification(bob_id, alice_id, 'commentaire_publication', id_publication=123)
        • Réponse commentaire:  creer_notification(bob_id, alice_id, 'reponse_commentaire', id_commentaire=456)
    """
    
    # Validation des types
    types_valides = ['like_publication', 'commentaire_publication', 'reponse_commentaire']
    if type_notification not in types_valides:
        raise ValueError(f"Type invalide. Types valides: {', '.join(types_valides)}")
    
    conn = get_db_connection()
    if not conn:
        raise Exception("Erreur de connexion à la base de données")
    
    try:
        cur = conn.cursor()
        
        # Vérifier que les utilisateurs existent
        cur.execute("SELECT 1 FROM utilisateurs WHERE id_utilisateur = %s", (id_utilisateur_cible,))
        if not cur.fetchone():
            raise ValueError("Utilisateur cible introuvable")
        
        cur.execute("SELECT 1 FROM utilisateurs WHERE id_utilisateur = %s", (id_utilisateur_source,))
        if not cur.fetchone():
            raise ValueError("Utilisateur source introuvable")
        
        # Récupérer le nom de l'utilisateur source pour générer le message
        if message is None:
            cur.execute("SELECT nom FROM utilisateurs WHERE id_utilisateur = %s", (id_utilisateur_source,))
            result = cur.fetchone()
            nom_source = result['nom'] if result else 'Quelqu\'un'
            
            # Générer le message automatiquement
            messages_templates = {
                'like_publication': f"{nom_source} a aimé votre publication ❤️",
                'commentaire_publication': f"{nom_source} a commenté votre publication 💬",
                'reponse_commentaire': f"{nom_source} a répondu à votre commentaire 💭"
            }
            message = messages_templates.get(type_notification, f"Nouvelle action de {nom_source}")
        
        # Insérer la notification
        cur.execute("""
            INSERT INTO notifications 
            (id_utilisateur_cible, id_utilisateur_source, type_notification, 
             id_publication, id_commentaire, message, est_lu, date_creation)
            VALUES (%s, %s, %s, %s, %s, %s, 0, NOW())
        """, (id_utilisateur_cible, id_utilisateur_source, type_notification,
              id_publication, id_commentaire, message))
        
        conn.commit()
        notif_id = cur.lastrowid
        
        # Récupérer et retourner la notification créée
        cur.execute("""
            SELECT 
                n.id_notification, n.id_utilisateur_cible, n.id_utilisateur_source,
                n.type_notification, n.id_publication, n.id_commentaire, n.message,
                n.est_lu, n.date_creation,
                u.nom as nom_source,
                u.photo_profil as photo_source
            FROM notifications n
            JOIN utilisateurs u ON n.id_utilisateur_source = u.id_utilisateur
            WHERE n.id_notification = %s
        """, (notif_id,))
        
        return cur.fetchone()
    finally:
        conn.close()


def lister_notifications_utilisateur(id_utilisateur: int, uniquement_non_lues: bool = False) -> List[Dict]:
    """
    Liste les notifications d'un utilisateur.
    
    Args:
        id_utilisateur: ID de l'utilisateur cible
        uniquement_non_lues: Si True, retourne seulement les notifications non lues
    
    Returns:
        Liste des notifications triées par date DESC (les plus récentes en premier)
    
    Exemples:
        • Toutes les notifications: lister_notifications_utilisateur(user_id)
        • Non-lues seulement:       lister_notifications_utilisateur(user_id, uniquement_non_lues=True)
    """
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        
        # Construire la requête conditionnellement
        where_clause = "WHERE n.id_utilisateur_cible = %s"
        params = [id_utilisateur]
        
        if uniquement_non_lues:
            where_clause += " AND n.est_lu = 0"
        
        cur.execute(f"""
            SELECT 
                n.id_notification,
                n.id_utilisateur_cible,
                n.id_utilisateur_source,
                n.type_notification,
                n.id_publication,
                n.id_commentaire,
                n.message,
                n.est_lu,
                n.date_creation,
                u.nom as nom_source,
                u.photo_profil as photo_source
            FROM notifications n
            LEFT JOIN utilisateurs u ON n.id_utilisateur_source = u.id_utilisateur
            {where_clause}
            ORDER BY n.date_creation DESC
            LIMIT 100
        """, params)
        
        return cur.fetchall()
    finally:
        conn.close()


def marquer_notification_lue(id_notification: int, id_utilisateur: int) -> bool:
    """
    Marque une notification comme lue.
    
    Args:
        id_notification: ID de la notification
        id_utilisateur: ID de l'utilisateur (vérification de propriété)
    
    Returns:
        True si marquée comme lue, False sinon
    
    Sécurité:
        - Vérifie que l'utilisateur est le propriétaire de la notification
        - Évite que quelqu'un marque les notifications d'un autre comme lues
    """
    conn = get_db_connection()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        
        # Vérifier que c'est l'utilisateur propriétaire de la notification
        cur.execute("""
            SELECT id_notification FROM notifications 
            WHERE id_notification = %s AND id_utilisateur_cible = %s
        """, (id_notification, id_utilisateur))
        
        if not cur.fetchone():
            return False  # Pas trouvé ou pas propriétaire
        
        # Marquer comme lue
        cur.execute("""
            UPDATE notifications 
            SET est_lu = 1 
            WHERE id_notification = %s
        """, (id_notification,))
        
        conn.commit()
        return True
    finally:
        conn.close()


def marquer_toutes_lues(id_utilisateur: int) -> int:
    """
    Marque TOUTES les notifications d'un utilisateur comme lues.
    
    Args:
        id_utilisateur: ID de l'utilisateur
    
    Returns:
        Nombre de notifications marquées comme lues
    """
    conn = get_db_connection()
    if not conn:
        return 0
    
    try:
        cur = conn.cursor()
        
        cur.execute("""
            UPDATE notifications 
            SET est_lu = 1 
            WHERE id_utilisateur_cible = %s AND est_lu = 0
        """, (id_utilisateur,))
        
        conn.commit()
        return cur.rowcount
    finally:
        conn.close()


def supprimer_notifications_anciennes() -> int:
    """
    Supprime les notifications de plus de 3 mois.
    À appeler régulièrement (cron job recommandé).
    
    Returns:
        Nombre de notifications supprimées
    """
    conn = get_db_connection()
    if not conn:
        return 0
    
    try:
        cur = conn.cursor()
        
        # Calculer la date limite (3 mois avant aujourd'hui)
        date_limite = datetime.now() - timedelta(days=90)
        
        cur.execute("""
            DELETE FROM notifications 
            WHERE date_creation < %s
        """, (date_limite,))
        
        conn.commit()
        return cur.rowcount
    finally:
        conn.close()


def obtenir_nombre_non_lues(id_utilisateur: int) -> int:
    """
    Retourne le nombre de notifications non lues pour un utilisateur.
    Utile pour afficher un badge de notification.
    
    Args:
        id_utilisateur: ID de l'utilisateur
    
    Returns:
        Nombre de notifications non lues (0 si aucune)
    
    Exemple:
        // Afficher un badge "5" si 5 notifications non lues
        nombre = obtenir_nombre_non_lues(user_id)
    """
    conn = get_db_connection()
    if not conn:
        return 0
    
    try:
        cur = conn.cursor()
        
        cur.execute("""
            SELECT COUNT(*) as nombre FROM notifications 
            WHERE id_utilisateur_cible = %s AND est_lu = 0
        """, (id_utilisateur,))
        
        result = cur.fetchone()
        return result['nombre'] if result else 0
    finally:
        conn.close()
