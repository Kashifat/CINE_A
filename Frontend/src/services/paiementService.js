import axios from 'axios';

const API_URL = '/api/paiement'; // Service paiement - passe par Nginx

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

const paiementService = {
  // Créer un paiement
  creerPaiement: async (montant, methode) => {
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
      const response = await axios.post(
        `${API_URL}/paiements/`,
        {
          id_utilisateur: utilisateur.id_utilisateur,
          montant,
          methode
        },
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la création du paiement' };
    }
  },

  // Obtenir les paiements d'un utilisateur
  obtenirPaiements: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/paiements/utilisateur/${userId}`, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      // Mode silencieux si le service n'est pas disponible
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.warn('⚠️ Service paiement non disponible');
        return { succes: true, data: [] }; // Retourner tableau vide au lieu d'erreur
      }
      return { succes: false, erreur: 'Erreur lors de la récupération des paiements' };
    }
  },

  // Mettre à jour le statut d'un paiement
  mettreAJourStatut: async (paiementId, statut) => {
    try {
      const response = await axios.put(
        `${API_URL}/paiements/${paiementId}`,
        { statut },
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la mise à jour du statut' };
    }
  }
};

export default paiementService;
