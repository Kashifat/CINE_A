import React, { useState, useEffect } from "react";
import { useAuth } from "../contexte/AuthContext";
import notificationApiService from "../services/notificationApiService";
import "./NotificationPanel.css";

/**
 * NotificationPanel - Panneau affichant les notifications de l'utilisateur
 * 
 * Fonctionnalités:
 * - Liste toutes les notifications (triées par date, plus récentes d'abord)
 * - Badge avec nombre de non-lues
 * - Cliquer sur une notification la marque comme lue
 * - Bouton "Marquer tout comme lu"
 * - Type d'icône selon le type de notification
 */
function NotificationPanel() {
  const { utilisateur } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ================================================================
  // Charger les notifications au montage (sans polling automatique)
  // ================================================================
  useEffect(() => {
    if (!utilisateur) return;
    loadNotifications();
    // ✅ Pas de polling automatique - rafraîchissement manuel via bouton
  }, [utilisateur]);
  useEffect(() => {
  const onClickOutside = (e) => {
    if (!e.target.closest(".notification-panel-container")) {
      setIsOpen(false);
    }
  };
  document.addEventListener("mousedown", onClickOutside);
  return () => document.removeEventListener("mousedown", onClickOutside);
}, []);

  const loadNotifications = async () => {
    if (!utilisateur?.id_utilisateur) return;

    try {
      setLoading(true);
      const notifs = await notificationApiService.getNotifications(
        utilisateur.id_utilisateur,
        false // Toutes les notifications
      );
      setNotifications(notifs);

      // Mettre à jour le compte des non-lues
      const unread = await notificationApiService.getUnreadCount(
        utilisateur.id_utilisateur
      );
      setUnreadCount(unread);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // Marquer une notification comme lue
  // ================================================================
  const handleNotificationClick = async (notification) => {
    if (!notification.est_lu) {
      // Marquer comme lue
      await notificationApiService.markAsRead(
        notification.id_notification,
        utilisateur.id_utilisateur
      );

      // Mettre à jour l'état local
      setNotifications(
        notifications.map((n) =>
          n.id_notification === notification.id_notification
            ? { ...n, est_lu: 1 }
            : n
        )
      );

      // Mettre à jour le compte
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
  };

  // ================================================================
  // Marquer TOUTES comme lues
  // ================================================================
  const handleMarkAllAsRead = async () => {
    await notificationApiService.markAllAsRead(utilisateur.id_utilisateur);

    // Mettre à jour l'état local
    setNotifications(notifications.map((n) => ({ ...n, est_lu: 1 })));
    setUnreadCount(0);
  };

  // ================================================================
  // Obtenir l'icône selon le type de notification
  // ================================================================
  const getNotificationIcon = (type) => {
    switch (type) {
      case "like_publication":
        return "❤️";
      case "commentaire_publication":
        return "💬";
      case "reponse_commentaire":
        return "↩️";
      default:
        return "📢";
    }
  };

  // ================================================================
  // Obtenir le texte lisible du type
  // ================================================================
  const getTypeLabel = (type) => {
    switch (type) {
      case "like_publication":
        return "Like";
      case "commentaire_publication":
        return "Commentaire";
      case "reponse_commentaire":
        return "Réponse";
      default:
        return "Notification";
    }
  };

  // ================================================================
  // Formater la date en français
  // ================================================================
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins}m`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (!utilisateur) {
    return null;
  }

  return (
    <div className="notification-panel-container">
      {/* ================================================================ */}
      {/* Bouton cloche avec badge */}
      {/* ================================================================ */}
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* ================================================================ */}
      {/* Panneau déroulant des notifications */}
      {/* ================================================================ */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-header-actions">
              <button
                className="refresh-notif-btn"
                onClick={loadNotifications}
                title="Rafraîchir"
              >
                🔄
              </button>
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-btn"
                  onClick={handleMarkAllAsRead}
                >
                  Marquer tout comme lu
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="notification-divider"></div>

          {/* Liste des notifications */}
          <div className="notification-list">
            {loading ? (
              <div className="notification-empty">
                <p>Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id_notification}
                  className={`notification-item ${notif.est_lu ? "" : "unread"}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  {/* Avatar de la source */}
                  <div className="notification-avatar">
                    {notif.photo_source ? (
                      <img
                        src={notif.photo_source.startsWith('http') 
                          ? notif.photo_source 
                          : `http://localhost:5002/media/${notif.photo_source}`
                        }
                        alt={notif.nom_source || "Utilisateur"}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="notification-avatar-fallback"
                      style={{
                        display: !notif.photo_source ? "flex" : "none"
                      }}
                    >
                      👤
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="notification-content">
                    <div className="notification-message">
                      <span className="notification-icon">
                        {getNotificationIcon(notif.type_notification)}
                      </span>
                      <span className="notification-text">
                        {notif.message}
                      </span>
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatDate(notif.date_creation)}
                      </span>
                      <span className="notification-type">
                        {getTypeLabel(notif.type_notification)}
                      </span>
                    </div>
                  </div>

                  {/* Indicateur non-lu */}
                  {!notif.est_lu && (
                    <div className="notification-unread-dot"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;
