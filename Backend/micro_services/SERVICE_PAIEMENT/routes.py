from flask import Blueprint, jsonify, request
from models import create_paiement, update_statut, get_paiements

# ============================================================================
# ROUTES API - SERVICE PAIEMENT
# ============================================================================
# Endpoints pour gérer les transactions financières des utilisateurs
# ============================================================================

paiements_bp = Blueprint("paiements", __name__)

@paiements_bp.route("/", methods=["POST"])
def nouveau_paiement():
    """
    POST / - Créer une nouvelle transaction de paiement
    
    Body JSON:
        {
            "id_utilisateur": 1,
            "montant": 19.99,
            "methode": "Carte bancaire"  # ou "Mobile Money", "PayPal"...
        }
    
    Responses:
        201: {"message": "Paiement en attente ✅", "id_paiement": 42}
        400: {"erreur": "id_utilisateur, montant et methode requis"}
        400: {"erreur": "Le montant doit être positif"}
    
    Usage: Appelé au début du processus de paiement (abonnement, achat)
    Le paiement_id retourné doit être transmis à la passerelle de paiement.
    """
    data = request.get_json()
    result = create_paiement(data)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result), 201

@paiements_bp.route("/<int:paiement_id>", methods=["PUT"])
def maj_statut(paiement_id):
    """
    PUT /<paiement_id> - Mettre à jour le statut d'un paiement
    
    Params:
        paiement_id (int): ID du paiement à modifier
    
    Body JSON:
        {
            "statut": "Validé"  # ou "Échoué", "Remboursé"
        }
    
    Responses:
        200: {"message": "Statut mis à jour: Validé ✅"}
        400: {"erreur": "Statut invalide. Valides: En attente, Validé, Échoué, Remboursé"}
        404: {"erreur": "Paiement introuvable"}
    
    Usage: Généralement appelé par un webhook de la passerelle de paiement
    Exemple webhook Stripe:
        POST /webhook → vérifie signature → PUT /42 {"statut": "Validé"}
    
    ⚠️ IMPORTANT: En production, cette route doit vérifier la signature
    du webhook pour éviter les mises à jour frauduleuses.
    """
    data = request.get_json()
    result = update_statut(paiement_id, data["statut"])
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result)

@paiements_bp.route("/utilisateur/<int:uid>", methods=["GET"])
def paiements_utilisateur(uid):
    """
    GET /utilisateur/<utilisateur_id> - Récupérer l'historique des paiements
    
    Params:
        uid (int): ID de l'utilisateur
    
    Response:
        200: [
            {
                "id_paiement": 42,
                "id_utilisateur": 1,
                "montant": 19.99,
                "methode": "Carte bancaire",
                "statut": "Validé",
                "date_paiement": "2025-11-15 14:30:00"
            },
            {
                "id_paiement": 38,
                "montant": 9.99,
                "methode": "PayPal",
                "statut": "Échoué",
                "date_paiement": "2025-10-15 10:20:00"
            }
        ]
    
    Usage: Afficher l'historique des transactions dans le profil utilisateur
    Exemple Frontend:
        const historique = await fetch('/paiements/utilisateur/1')
        historique.forEach(p => {
            console.log(`${p.date_paiement}: ${p.montant}€ - ${p.statut}`)
        })
    """
    return jsonify(get_paiements(uid))
