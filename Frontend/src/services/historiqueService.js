import axios from 'axios';

const API_URL = 'http://localhost:5005'; // Service historique

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

const historiqueService = {
  // Ajouter un historique
  ajouterHistorique: async (filmId, episodeId = null, utilisateurId = null) => {
    try {
      // Récupérer l'ID utilisateur depuis le paramètre ou localStorage
      let idUtilisateur = utilisateurId;
      
      if (!idUtilisateur) {
        const utilisateurStr = localStorage.getItem('utilisateur');
        if (!utilisateurStr) {
          return { succes: false, erreur: 'Utilisateur non connecté' };
        }
        const utilisateur = JSON.parse(utilisateurStr);
        // Pour les admins, utiliser id_utilisateur du contexte (voir Lecture.js)
        // Pour les utilisateurs normaux, utiliser id_utilisateur
        idUtilisateur = utilisateur.id_utilisateur;
      }
      
      if (!idUtilisateur) {
        console.error("❌ Aucun ID utilisateur disponible!");
        return { succes: false, erreur: 'Utilisateur non valide' };
      }
      
      const data = {
        id_utilisateur: idUtilisateur,
        position: '00:00:00'
      };
      
      // Ajouter soit id_film soit id_episode
      if (episodeId) {
        data.id_episode = episodeId;
      } else {
        data.id_film = filmId;
      }
      
      console.log("📝 Envoi historique:", data);
      
      const response = await axios.post(
        `${API_URL}/historique/`,
        data,
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      console.error("❌ Erreur historique:", error.response?.data || error.message);
      return { succes: false, erreur: 'Erreur lors de l\'ajout à l\'historique' };
    }
  },

  // Obtenir l'historique d'un utilisateur
  obtenirHistorique: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/historique/${userId}`, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération de l\'historique' };
    }
  },

  // Mettre à jour la position
  mettreAJourPosition: async (historiqueId, position) => {
    try {
      const response = await axios.put(
        `${API_URL}/historique/${historiqueId}/position`,
        { position },
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la mise à jour' };
    }
  }
};

export default historiqueService;
