import axios from 'axios';

const API_URL = '/api/tv'; // Service TV - passe par Nginx

const tvService = {
  // Obtenir toutes les chaînes TV avec images
  obtenirChaines: async () => {
    try {
      const response = await axios.get(`${API_URL}/tv/channels`);
      const chaines = Array.isArray(response.data) ? response.data : response.data?.chaines || [];
      
      // Formater les chaînes pour utiliser le champ logo
      return { 
        succes: true, 
        data: chaines.map(ch => ({
          id_chaine: ch.id || ch.name,
          nom: ch.name,
          description: ch.category || 'TV',
          logo: ch.logo || ch.image || '📺',
          image: ch.logo || ch.image,
          categorie: ch.category || 'Divertissement',
          url: ch.url,
          pays: ch.country
        }))
      };
    } catch (error) {
      console.warn('Service TV indisponible:', error.message);
      // Retourner des chaînes par défaut avec images
      return { succes: true, data: getChaines_Default() };
    }
  },

  // Obtenir une chaîne spécifique
  obtenirChaine: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/tv/channels/${id}`);
      return { succes: true, data: response.data };
    } catch (error) {
      return { succes: false, erreur: 'Chaîne introuvable' };
    }
  }
};

// Chaînes TV par défaut avec images (fallback)
const getChaines_Default = () => [
  {
    id_chaine: 1,
    nom: 'CineA Films',
    description: 'Films 24h/24',
    logo: 'https://via.placeholder.com/200x120?text=CineA+Films',
    image: 'https://via.placeholder.com/200x120?text=CineA+Films',
    categorie: 'Films'
  },
  {
    id_chaine: 2,
    nom: 'CineA Series',
    description: 'Séries et dramas',
    logo: 'https://via.placeholder.com/200x120?text=CineA+Series',
    image: 'https://via.placeholder.com/200x120?text=CineA+Series',
    categorie: 'Séries'
  },
  {
    id_chaine: 3,
    nom: 'CineA Action',
    description: 'Films d\'action',
    logo: 'https://via.placeholder.com/200x120?text=CineA+Action',
    image: 'https://via.placeholder.com/200x120?text=CineA+Action',
    categorie: 'Action'
  },
  {
    id_chaine: 4,
    nom: 'CineA Comédie',
    description: 'Films comiques',
    logo: 'https://via.placeholder.com/200x120?text=CineA+Comedie',
    image: 'https://via.placeholder.com/200x120?text=CineA+Comedie',
    categorie: 'Comédie'
  },
  {
    id_chaine: 5,
    nom: 'CineA Documentaires',
    description: 'Documentaires',
    logo: 'https://via.placeholder.com/200x120?text=CineA+Docs',
    image: 'https://via.placeholder.com/200x120?text=CineA+Docs',
    categorie: 'Documentaire'
  },
  {
    id_chaine: 6,
    nom: 'CineA Enfants',
    description: 'Contenu famille',
    logo: 'https://via.placeholder.com/200x120?text=CineA+Kids',
    image: 'https://via.placeholder.com/200x120?text=CineA+Kids',
    categorie: 'Enfants'
  }
];

export default tvService;
