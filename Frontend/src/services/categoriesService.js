// Service pour gérer les catégories depuis l'API
const API_URL = '/contenus'; // Service films - passe par Nginx

const categoriesService = {
  /**
   * Récupère toutes les catégories depuis la BD
   */
  obtenirCategories: async () => {
    try {
      const response = await fetch(`${API_URL}/contenus/categories`);
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();

      if (data.succes && data.data) {
        return {
          succes: true,
          data: data.data
        };
      }

      return {
        succes: false,
        erreur: data.erreur || 'Erreur lors du chargement des catégories'
      };
    } catch (error) {
      console.error('❌ Erreur categoriesService.obtenirCategories:', error);
      return {
        succes: false,
        erreur: error.message
      };
    }
  },

  /**
   * Ajoute une nouvelle catégorie (admin only)
   */
  ajouterCategorie: async (nom) => {
    try {
      const response = await fetch(`${API_URL}/contenus/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nom })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          succes: false,
          erreur: data.erreur || 'Erreur lors de l\'ajout de la catégorie'
        };
      }

      return {
        succes: true,
        data: data,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Erreur categoriesService.ajouterCategorie:', error);
      return {
        succes: false,
        erreur: error.message
      };
    }
  },

  /**
   * Supprime une catégorie (admin only)
   */
  supprimerCategorie: async (id_categorie) => {
    try {
      const response = await fetch(`${API_URL}/contenus/categories/${id_categorie}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          succes: false,
          erreur: data.erreur || 'Erreur lors de la suppression'
        };
      }

      return {
        succes: true,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Erreur categoriesService.supprimerCategorie:', error);
      return {
        succes: false,
        erreur: error.message
      };
    }
  }
};

export default categoriesService;
