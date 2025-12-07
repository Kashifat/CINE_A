from config import get_db_connection

# ============================================================================
# SERVICE PAIEMENT - Gestion des transactions financières
# ============================================================================
# Ce service permet de:
# 1. Créer des transactions de paiement (abonnements, achats)
# 2. Suivre le statut des paiements (En attente → Validé/Échoué)
# 3. Consulter l'historique des transactions d'un utilisateur
# ============================================================================
# Note: Ce service ne traite PAS directement l'argent (c'est le rôle
# des passerelles comme Stripe, PayPal, Orange Money). Il enregistre
# et suit les transactions pour activer/désactiver les accès au contenu.
# ============================================================================

def create_paiement(data):
    """
    Crée une nouvelle transaction de paiement.
    
    Appelé quand:
    - L'utilisateur clique sur "S'abonner" (Premium, VIP...)
    - L'utilisateur achète un film à la carte
    - Renouvellement automatique d'abonnement
    
    Args:
        data (dict): {
            "utilisateur_id": int,  # Qui paye ?
            "montant": float,       # Combien ? (ex: 9.99€, 5000 FCFA)
            "methode": str          # Comment ? (Carte bancaire, Mobile Money...)
        }
    
    Returns:
        dict: {"message": "Paiement en attente ✅", "id": <paiement_id>}
        tuple: (dict, status_code) en cas d'erreur
    
    Exemple de flux:
        1. User clique "Abonnement Premium 19.99€"
        2. create_paiement() → paiement_id = 42, statut = "En attente"
        3. Frontend redirige vers Stripe avec ce paiement_id
        4. Après validation Stripe → update_statut(42, "Validé")
        5. Accès premium activé ✅
    """
    # Validation des champs obligatoires
    if not data.get("id_utilisateur") or not data.get("montant") or not data.get("methode"):
        return {"erreur": "id_utilisateur, montant et methode requis"}, 400
    
    # Valider que le montant est un nombre positif
    try:
        montant = float(data["montant"])
        if montant <= 0:
            return {"erreur": "Le montant doit être positif"}, 400
    except ValueError:
        return {"erreur": "Montant invalide"}, 400
    
    conn = get_db_connection()
    if not conn:
        return {"erreur": "Erreur de connexion à la base de données"}, 500
    
    try:
        cur = conn.cursor()
        # Créer le paiement avec statut initial "En attente"
        # Le statut sera mis à jour après la réponse de la passerelle de paiement
        cur.execute("""
            INSERT INTO paiements (id_utilisateur, montant, methode, statut)
            VALUES (%s, %s, %s, 'En attente')
        """, (data["id_utilisateur"], montant, data["methode"]))
        conn.commit()
        # Retourner l'ID du paiement créé (important pour le suivi)
        return {"message": "Paiement en attente ✅", "id_paiement": cur.lastrowid}
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def update_statut(paiement_id, statut):
    """
    Met à jour le statut d'un paiement (généralement appelé par webhook).
    
    Appelé quand:
    - La passerelle de paiement (Stripe, PayPal...) envoie un callback
    - Paiement validé → activer l'abonnement
    - Paiement échoué → notifier l'utilisateur
    - Remboursement → désactiver l'abonnement
    
    Args:
        paiement_id (int): ID du paiement à mettre à jour
        statut (str): Nouveau statut parmi:
            - "En attente" : Transaction en cours de traitement
            - "Validé"     : Paiement réussi ✅ → Accès accordé
            - "Échoué"     : Problème (carte refusée, fonds insuffisants...)
            - "Remboursé"  : Paiement annulé, argent restitué
    
    Returns:
        dict: {"message": "Statut mis à jour: Validé ✅"}
        tuple: (dict, status_code) en cas d'erreur
    
    Exemple de flux webhook:
        1. Stripe valide le paiement → envoie POST /webhook
        2. Backend reçoit: {paiement_id: 42, statut: "Validé"}
        3. update_statut(42, "Validé")
        4. Si "Validé" → activer abonnement dans table utilisateurs
        5. Envoyer email de confirmation
    """
    # Liste des statuts autorisés (évite les valeurs incorrectes)
    statuts_valides = ['En attente', 'Validé', 'Échoué', 'Remboursé']
    if statut not in statuts_valides:
        return {"erreur": f"Statut invalide. Valides: {', '.join(statuts_valides)}"}, 400
    
    conn = get_db_connection()
    if not conn:
        return {"erreur": "Erreur de connexion à la base de données"}, 500
    
    try:
        cur = conn.cursor()
        # Vérifier si le paiement existe avant de le modifier
        cur.execute("SELECT 1 FROM paiements WHERE id_paiement = %s", (paiement_id,))
        if not cur.fetchone():
            return {"erreur": "Paiement introuvable"}, 404
        
        # Mettre à jour le statut du paiement
        cur.execute("UPDATE paiements SET statut = %s WHERE id_paiement = %s", (statut, paiement_id))
        conn.commit()
        return {"message": f"Statut mis à jour: {statut} ✅"}
    except Exception as e:
        return {"erreur": f"Erreur: {str(e)}"}, 500
    finally:
        conn.close()

def get_paiements(utilisateur_id):
    """
    Récupère l'historique complet des transactions d'un utilisateur.
    
    Appelé quand:
    - L'utilisateur ouvre "Mon compte" → "Historique des paiements"
    - Admin consulte les transactions d'un utilisateur
    - Génération de factures/reçus
    
    Args:
        utilisateur_id (int): ID de l'utilisateur
    
    Returns:
        list: [{
            "id": 42,
            "utilisateur_id": 1,
            "montant": 19.99,
            "methode": "Carte bancaire",
            "statut": "Validé",
            "date_paiement": "2025-11-15 14:30:00"
        }, ...]
        Triés par date décroissante (plus récent en premier)
    
    Exemple d'utilisation Frontend:
        const historique = await fetch('/paiements/utilisateur/1')
        // Afficher tableau avec: Date | Montant | Méthode | Statut
        // 15/11/2025 | 19.99€ | Visa | ✅ Validé
    """
    conn = get_db_connection()
    if not conn:
        return []
    
    try:
        cur = conn.cursor()
        # Récupérer tous les paiements de l'utilisateur, triés par date décroissante
        cur.execute("""
            SELECT * FROM paiements 
            WHERE id_utilisateur = %s 
            ORDER BY date_paiement DESC
        """, (utilisateur_id,))
        result = cur.fetchall()
        return result
    finally:
        conn.close()
