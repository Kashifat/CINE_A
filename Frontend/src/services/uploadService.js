import axios from 'axios';

const API_URL_UTILISATEUR = '/api/utilisateurs'; // passe par Nginx
const API_URL_PUBLICATION = '/api/publications'; // passe par Nginx

// Configuration axios avec token
const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
};

const uploadService = {
  // Upload photo de profil
  uploadPhotoProfil: async (userId, file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const config = {
        ...getConfig(),
        headers: {
          ...getConfig().headers,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axios.post(
        `${API_URL_UTILISATEUR}/utilisateurs/${userId}/photo`,
        formData,
        config
      );
      
      return { succes: true, data: response.data };
    } catch (error) {
      return { 
        succes: false, 
        erreur: error.response?.data?.erreur || 'Erreur lors de l\'upload de la photo' 
      };
    }
  },

  // Supprimer photo de profil
  supprimerPhotoProfil: async (userId) => {
    try {
      const response = await axios.delete(
        `${API_URL_UTILISATEUR}/utilisateurs/${userId}/photo`,
        getConfig()
      );
      return { succes: true, data: response.data };
    } catch (error) {
      return { 
        succes: false, 
        erreur: error.response?.data?.erreur || 'Erreur lors de la suppression' 
      };
    }
  },

  // Upload image pour publication
  uploadImagePublication: async (imageFile) => {
    try {
      // Valider l'image
      const validation = uploadService.validerImage(imageFile);
      if (!validation.valide) {
        return { succes: false, erreur: validation.erreur };
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      
      const config = {
        ...getConfig(),
        headers: {
          ...getConfig().headers,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axios.post(
        `${API_URL_PUBLICATION}/upload-image/`,
        formData,
        config
      );
      
      return { succes: true, data: response.data };
    } catch (error) {
      return { 
        succes: false, 
        erreur: error.response?.data?.erreur || 'Erreur lors de l\'upload de l\'image' 
      };
    }
  },

  // Créer publication avec image
  creerPublicationAvecImage: async (userId, contenu, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('id_utilisateur', userId);
      formData.append('contenu', contenu);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const config = {
        ...getConfig(),
        headers: {
          ...getConfig().headers,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      const response = await axios.post(
        `${API_URL_PUBLICATION}/publications/`,
        formData,
        config
      );
      
      return { succes: true, data: response.data };
    } catch (error) {
      return { 
        succes: false, 
        erreur: error.response?.data?.erreur || 'Erreur lors de la création de la publication' 
      };
    }
  },

  // Valider fichier image
  validerImage: (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!file) {
      return { valide: false, erreur: 'Aucun fichier sélectionné' };
    }
    
    if (file.size > maxSize) {
      return { valide: false, erreur: 'Le fichier doit faire moins de 5MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valide: false, erreur: 'Format non supporté. Utilisez JPG, PNG, GIF ou WEBP' };
    }
    
    return { valide: true };
  },

  // Créer aperçu d'image
  creerApercu: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

export default uploadService;
