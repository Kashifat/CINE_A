import axios from 'axios';

const API_URL = 'http://localhost:5002'; // Service films

const filmsService = {
  // Obtenir tous les films
  obtenirTousLesFilms: async () => {
    try {
      const response = await axios.get(`${API_URL}/contenus/films`);
      const films = response.data?.films || response.data;
      return { succes: true, data: films };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des films' };
    }
  },

  // Obtenir toutes les séries
  obtenirToutesSeries: async () => {
    try {
      const response = await axios.get(`${API_URL}/contenus/series`);
      const series = response.data?.series || response.data;
      return { succes: true, data: series };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des séries' };
    }
  },

  // Obtenir un film par ID
  obtenirFilmParId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/contenus/films/${id}`);
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Film introuvable' };
    }
  },

  // Obtenir une série par ID
  obtenirSerieParId: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/contenus/series/${id}`);
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Série introuvable' };
    }
  },

  // Obtenir saisons d'une série
  obtenirSaisons: async (serieId) => {
    try {
      const response = await axios.get(`${API_URL}/contenus/series/${serieId}/saisons`);
      const saisons = response.data?.saisons || response.data;
      return { succes: true, data: saisons };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des saisons' };
    }
  },

  // Obtenir épisodes d'une saison
  obtenirEpisodes: async (saisonId) => {
    try {
      const response = await axios.get(`${API_URL}/contenus/saisons/${saisonId}/episodes`);
      const episodes = response.data?.episodes || response.data;
      return { succes: true, data: episodes };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des épisodes' };
    }
  },

  // Rechercher des contenus (films, séries, épisodes)
  rechercherContenus: async (query) => {
    try {
      const response = await axios.get(`${API_URL}/contenus/recherche`, {
        params: { q: query }
      });
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la recherche' };
    }
  },

  // Obtenir films tendances (fallback: tri par note/diffusion)
  obtenirTendances: async () => {
    try {
      const response = await axios.get(`${API_URL}/contenus/films`);
      const films = response.data?.films || response.data;
      return { succes: true, data: films };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des tendances' };
    }
  }
};

export default filmsService;
