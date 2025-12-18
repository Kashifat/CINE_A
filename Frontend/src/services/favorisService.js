import axios from 'axios';

const API_URL = ''; // Chemins relatifs passent par Nginx

const favorisService = {
  ajouter: async ({ id_utilisateur, id_film = null, id_episode = null }) => {
    try {
      const response = await axios.post(`${API_URL}/contenus/favoris`, {
        id_utilisateur,
        id_film,
        id_episode,
      });
      return { succes: true, data: response.data };
    } catch (error) {
      console.error('[favorisService] Erreur ajouter:', error.response?.data || error.message);
      return { succes: false, erreur: error.response?.data || 'Erreur ajout favori' };
    }
  },

  retirer: async ({ id_utilisateur, id_film = null, id_episode = null }) => {
    try {
      const response = await axios.delete(`${API_URL}/favoris`, {
        data: { id_utilisateur, id_film, id_episode },
      });
      return { succes: true, data: response.data };
    } catch (error) {
      console.error('[favorisService] Erreur retirer:', error.response?.data || error.message);
      return { succes: false, erreur: error.response?.data || 'Erreur retrait favori' };
    }
  },

  lister: async (id_utilisateur) => {
    try {
      const response = await axios.get(`${API_URL}/favoris/${id_utilisateur}`);
      return { succes: true, data: response.data };
    } catch (error) {
      console.error('[favorisService] Erreur lister:', error.response?.data || error.message);
      return { succes: false, erreur: 'Erreur lors du chargement des favoris' };
    }
  },
};

export default favorisService;
