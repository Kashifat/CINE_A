import axios from 'axios';

const API_URL = '/api/publications'; // Service publication - passe par Nginx

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

const publicationService = {
  // Créer une publication
  creerPublication: async (donnees) => {
    try {
      const response = await axios.post(`${API_URL}/publications/`, donnees, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      console.error('Erreur création publication:', error.response?.data || error.message);
      return { succes: false, erreur: error.response?.data?.erreur || 'Erreur lors de la création de la publication' };
    }
  },

  // Obtenir toutes les publications
  obtenirPublications: async () => {
    try {
      const response = await axios.get(`${API_URL}/publications/`, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des publications' };
    }
  },

  // Obtenir publications d'un utilisateur
  obtenirPublicationsUtilisateur: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/publications/?id_utilisateur=${userId}`, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération' };
    }
  },

  // Modifier une publication
  modifierPublication: async (id, donnees) => {
    try {
      const response = await axios.put(`${API_URL}/publications/${id}`, donnees, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la modification' };
    }
  },

  // Supprimer une publication
  supprimerPublication: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/publications/${id}`, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la suppression' };
    }
  },

  // Ajouter une réaction
  ajouterReaction: async (publicationId, type) => {
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
      const response = await axios.post(
        'http://localhost:5008/reactions/',
        {
          id_utilisateur: utilisateur.id_utilisateur,
          id_publication: publicationId,
          type: type
        },
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      // Si erreur 409, c'est que la réaction existe déjà (retourner succès silencieux)
      if (error.response?.status === 409) {
        return { succes: true, data: { message: 'Réaction déjà existante' } };
      }
      return { succes: false, erreur: 'Erreur lors de l\'ajout de la réaction' };
    }
  },

  // Supprimer une réaction
  supprimerReaction: async (publicationId) => {
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
      const response = await axios.delete(
        'http://localhost:5008/reactions/',
        {
          ...getConfig(),
          data: {
            id_utilisateur: utilisateur.id_utilisateur,
            id_publication: publicationId
          }
        }
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la suppression' };
    }
  },

  // Obtenir statistiques des réactions
  obtenirStatistiquesReactions: async (publicationId) => {
    try {
      const response = await axios.get(`http://localhost:5008/reactions/publication/${publicationId}/stats`);
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des stats' };
    }
  },

  // Vérifier la réaction de l'utilisateur connecté
  verifierReactionUtilisateur: async (publicationId) => {
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
      if (!utilisateur) return { succes: false };
      
      const response = await axios.get(
        `http://localhost:5008/reactions/utilisateur/${utilisateur.id_utilisateur}/publication/${publicationId}`,
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, data: null };
    }
  }
};

export default publicationService;
