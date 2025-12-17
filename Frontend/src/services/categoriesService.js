// Service pour gérer les catégories depuis l'API
const API_URL = 'http://localhost:5002'; // Service films (même port que filmsService)

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
  }
};

export default categoriesService;
