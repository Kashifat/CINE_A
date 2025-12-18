import axios from 'axios';

const API_URL = '/api/commentaires'; // Service commentaire - passe par Nginx

const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

const commentaireService = {
  // Ajouter un commentaire
  ajouterCommentaire: async (publicationId, contenu, parentId = null) => {
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
      const data = {
        id_publication: publicationId,
        id_utilisateur: utilisateur.id_utilisateur,
        contenu
      };
      
      if (parentId) {
        data.id_parent_commentaire = parentId;
      }
      
      const response = await axios.post(`${API_URL}/commentaires/`, data, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de l\'ajout du commentaire' };
    }
  },

  // Obtenir commentaires d'une publication
  obtenirCommentaires: async (publicationId) => {
    try {
      const response = await axios.get(`${API_URL}/commentaires/publication/${publicationId}`);
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération des commentaires' };
    }
  },

  // Compter les commentaires
  compterCommentaires: async (publicationId) => {
    try {
      const response = await axios.get(`${API_URL}/commentaires/publication/${publicationId}/count`);
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors du comptage' };
    }
  },

  // Obtenir un commentaire
  obtenirCommentaire: async (commentaireId) => {
    try {
      const response = await axios.get(`${API_URL}/commentaires/${commentaireId}`);
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Commentaire introuvable' };
    }
  },

  // Modifier un commentaire
  modifierCommentaire: async (commentaireId, contenu) => {
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
      const response = await axios.put(
        `${API_URL}/commentaires/${commentaireId}`,
        {
          id_utilisateur: utilisateur.id_utilisateur,
          contenu
        },
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la modification' };
    }
  },

  // Supprimer un commentaire
  supprimerCommentaire: async (commentaireId) => {
    try {
      const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
      const response = await axios.delete(
        `${API_URL}/commentaires/${commentaireId}`,
        {
          data: { id_utilisateur: utilisateur.id_utilisateur },
          ...getConfig()
        }
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la suppression' };
    }
  },

  // Obtenir commentaires d'un utilisateur
  obtenirCommentairesUtilisateur: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/commentaires/utilisateur/${userId}`, getConfig());
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Erreur lors de la récupération' };
    }
  }
};

export default commentaireService;
