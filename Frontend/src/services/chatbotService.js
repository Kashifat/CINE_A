/**
 * Service pour communiquer avec le chatbot CinéA
 */

const CHATBOT_API_URL = 'http://127.0.0.1:5012';

/**
 * Envoie un message au chatbot
 * @param {string} message - Message de l'utilisateur
 * @param {number|null} userId - ID de l'utilisateur connecté
 * @param {object} meta - Métadonnées additionnelles
 * @returns {Promise<object>} Réponse du chatbot
 */
export const envoyerMessage = async (message, userId = null, meta = {}) => {
  try {
    const response = await fetch(`${CHATBOT_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_id: userId,
        meta,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erreur lors de la communication avec le chatbot');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur chatbot:', error);
    throw error;
  }
};

/**
 * Obtient des suggestions de questions selon la page
 * @param {string} page - Page actuelle (films, series, communaute, etc.)
 * @returns {Promise<Array<string>>} Liste de suggestions
 */
export const obtenirSuggestions = async (page = 'home') => {
  try {
    const response = await fetch(`${CHATBOT_API_URL}/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des suggestions');
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Erreur suggestions:', error);
    return [];
  }
};

/**
 * Vérifie le statut du service chatbot
 * @returns {Promise<object>} Statut du service
 */
export const verifierStatut = async () => {
  try {
    const response = await fetch(`${CHATBOT_API_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Erreur statut chatbot:', error);
    return { status: 'offline' };
  }
};
