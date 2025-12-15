import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className={`toast toast-${notification.type}`}>
      <span className="toast-icon">{getIcon(notification.type)}</span>
      <span className="toast-message">{notification.message}</span>
      <button
        className="toast-close"
        onClick={() => onClose(notification.id)}
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
