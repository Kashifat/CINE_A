import axios from 'axios';

const API_URL = '/api/avis'; // Service avis - passe par Nginx

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

const avisService = {
  // Ajouter un avis sur un film
  ajouterAvisFilm: async (filmId, note, commentaire) => {
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
      const response = await axios.post(
        `${API_URL}/avis/`,
        {
          id_utilisateur: utilisateur.id_utilisateur,
          id_film: filmId,
          note,
          commentaire
        },
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de l\'ajout de l\'avis' };
    }
  },

  // Ajouter un avis sur un épisode
  ajouterAvisEpisode: async (episodeId, note, commentaire) => {
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
      const response = await axios.post(
        `${API_URL}/avis/`,
        {
          id_utilisateur: utilisateur.id_utilisateur,
          id_episode: episodeId,
          note,
          commentaire
        },
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de l\'ajout de l\'avis' };
    }
  },

  // Obtenir avis d'un film
  obtenirAvisFilm: async (filmId) => {
    try {
      const response = await axios.get(`${API_URL}/avis/film/${filmId}`);
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des avis' };
    }
  },

  // Obtenir avis d'un épisode
  obtenirAvisEpisode: async (episodeId) => {
    try {
      const response = await axios.get(`${API_URL}/avis/episode/${episodeId}`);
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des avis' };
    }
  },

  // Obtenir avis d'un utilisateur
  obtenirAvisUtilisateur: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/avis/utilisateur/${userId}`, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des avis' };
    }
  },

  // Modifier un avis
  modifierAvis: async (avisId, note, commentaire) => {
    try {
      const response = await axios.put(
        `${API_URL}/avis/${avisId}`,
        { note, commentaire },
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la modification' };
    }
  },

  // Supprimer un avis
  supprimerAvis: async (avisId) => {
    try {
      const response = await axios.delete(`${API_URL}/avis/${avisId}`, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la suppression' };
    }
  }
};

export default avisService;
