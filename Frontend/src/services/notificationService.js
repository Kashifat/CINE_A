// Service de notifications - utilise des callbacks pour mettre à jour l'UI
let notificationCallback = null;

export const setNotificationCallback = (callback) => {
  notificationCallback = callback;
};

export const showNotification = (message, type = 'info', duration = 3000) => {
  const notification = {
    id: Date.now(),
    message,
    type, // 'success', 'error', 'info', 'warning'
    duration
  };

  if (notificationCallback) {
    notificationCallback(notification);
  }

  return notification.id;
};

export const showSuccess = (message, duration = 3000) => {
  return showNotification(message, 'success', duration);
};

export const showError = (message, duration = 4000) => {
  return showNotification(message, 'error', duration);
};

export const showWarning = (message, duration = 3500) => {
  return showNotification(message, 'warning', duration);
};

export const showInfo = (message, duration = 3000) => {
  return showNotification(message, 'info', duration);
};

export default {
  showNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  setNotificationCallback
};
