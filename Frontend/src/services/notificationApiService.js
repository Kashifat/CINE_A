/**
 * Service pour gérer les notifications via API
 * Communique avec SERVICE_NOTIFICATION (port 5010)
 */

const NOTIFICATION_API_URL = "http://localhost:5010/notifications";

const notificationApiService = {
  /**
   * Récupérer toutes les notifications d'un utilisateur
   * @param {number} userId - ID de l'utilisateur
   * @param {boolean} onlyUnread - Si true, retourne uniquement les non-lues
   * @returns {Promise<Array>}
   */
  async getNotifications(userId, onlyUnread = false) {
    try {
      const url = onlyUnread 
        ? `${NOTIFICATION_API_URL}/${userId}?uniquement_non_lues=true`
        : `${NOTIFICATION_API_URL}/${userId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      return [];
    }
  },

  /**
   * Obtenir le nombre de notifications non lues
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    try {
      const response = await fetch(`${NOTIFICATION_API_URL}/${userId}/non-lues`);
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      const data = await response.json();
      return data.nombre || 0;
    } catch (error) {
      console.error("Erreur lors de la récupération du nombre non lu:", error);
      return 0;
    }
  },

  /**
   * Marquer une notification comme lue
   * @param {number} notificationId - ID de la notification
   * @param {number} userId - ID de l'utilisateur (vérification propriété)
   * @returns {Promise<boolean>}
   */
  async markAsRead(notificationId, userId) {
    try {
      const response = await fetch(
        `${NOTIFICATION_API_URL}/${notificationId}/lue`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_utilisateur: userId })
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
      return false;
    }
  },

  /**
   * Marquer TOUTES les notifications comme lues
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise<number>} - Nombre de notifications marquées
   */
  async markAllAsRead(userId) {
    try {
      const response = await fetch(
        `${NOTIFICATION_API_URL}/${userId}/lues`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        }
      );
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      const data = await response.json();
      return data.nombre || 0;
    } catch (error) {
      console.error("Erreur lors du marquage de toutes en lecture:", error);
      return 0;
    }
  }
};

export default notificationApiService;
