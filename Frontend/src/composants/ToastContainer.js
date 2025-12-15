import React, { useState } from 'react';
import Toast from './Toast';
import './Toast.css';

const ToastContainer = ({ notifications, onRemove }) => {
  const [removingIds, setRemovingIds] = useState(new Set());

  const handleRemove = (id) => {
    setRemovingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      onRemove(id);
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300); // Durée de l'animation de sortie
  };

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={removingIds.has(notification.id) ? 'toast removing' : 'toast'}
        >
          <Toast
            notification={notification}
            onClose={handleRemove}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
