import axios from 'axios';

const API_URL = 'http://localhost:5001'; // Service utilisateur
const API_URL_ADMIN = 'http://localhost:5004'; // Service admin

// Configuration axios avec token
const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

const authService = {
  // Inscription
  inscription: async (donnees) => {
    try {
      const response = await axios.post(`${API_URL}/utilisateurs/inscription`, donnees);
      return { succes: true, data: response.data };
    } catch (error) {
      return { 
        succes: false, 
        erreur: error.response?.data?.erreur || 'Erreur lors de l\'inscription' 
      };
    }
  },

  // Connexion (essaie utilisateur d'abord, puis admin)
  connexion: async (courriel, motdepasse) => {
    // Essayer connexion utilisateur d'abord
    try {
      const response = await axios.post(`${API_URL}/utilisateurs/connexion`, {
        courriel,
        motdepasse
      });
      return { succes: true, data: response.data };
    } catch (erreurUtilisateur) {
      // Si échec utilisateur, essayer connexion admin
      try {
        const responseAdmin = await axios.post(`${API_URL_ADMIN}/admin/login`, {
          courriel,
          mot_de_passe: motdepasse
        });
        
        // Formater la réponse admin pour correspondre au format utilisateur
        const adminData = responseAdmin.data;
        return { 
          succes: true, 
          data: {
            utilisateur: {
              ...adminData.admin,
              role: 'admin' // Ajouter explicitement le role admin
            },
            token: adminData.token || 'admin-token' // Token fictif si pas fourni
          }
        };
      } catch (erreurAdmin) {
        // Les deux ont échoué
        return { 
          succes: false, 
          erreur: 'Identifiants incorrects' 
        };
      }
    }
  },

  // Obtenir profil utilisateur
  obtenirProfil: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/utilisateurs/${userId}`, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { 
        succes: false, 
        erreur: error.response?.data?.erreur || 'Erreur lors de la récupération du profil' 
      };
    }
  },

  // Obtenir profil complet avec statistiques
  obtenirProfilComplet: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/utilisateurs/${userId}/profil`, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { 
        succes: false, 
        erreur: error.response?.data?.erreur || 'Erreur lors de la récupération du profil complet' 
      };
    }
  },

  // Mettre à jour profil
  mettreAJourProfil: async (userId, donnees) => {
    try {
      const response = await axios.put(`${API_URL}/utilisateurs/${userId}`, donnees, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { 
        succes: false, 
        erreur: error.response?.data?.erreur || 'Erreur lors de la mise à jour' 
      };
    }
  },

  // Modifier profil complet (nom, email, mot de passe)
  modifierProfil: async (userId, donnees) => {
    try {
      const response = await axios.put(`${API_URL}/utilisateurs/${userId}/profil`, donnees, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { 
        succes: false, 
        erreur: error.response?.data?.erreur || 'Erreur lors de la modification' 
      };
    }
  }
};

export default authService;
