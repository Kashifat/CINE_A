/**
 * Intercepteur Axios global pour gestion d'authentification
 * Ajoute le token à chaque requête et gère les erreurs 401
 */

import axios from 'axios';

// Instance Axios avec intercepteurs
const axiosInstance = axios.create();

// Variable pour stocker le contexte auth (sera injectée par App.js)
let authContext = null;

export const setAuthContext = (context) => {
  authContext = context;
};

// Intercepteur de requête - ajouter le token
axiosInstance.interceptors.request.use(
  (config) => {
    if (authContext) {
      const token = authContext.obtenirToken?.();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - gérer les erreurs 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('🔐 Accès non autorisé (401) - Token invalide ou expiré');
      
      // Déconnecter l'utilisateur
      if (authContext?.deconnexion) {
        authContext.deconnexion();
        
        // Rediriger vers connexion (si possible)
        if (typeof window !== 'undefined') {
          window.location.href = '/connexion';
        }
      }
    }
    
    if (error.response?.status === 403) {
      console.warn('🚫 Accès interdit (403) - Permissions insuffisantes');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
