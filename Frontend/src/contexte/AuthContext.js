import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Utilitaires pour token
const tokenUtils = {
  isTokenValid: (token) => {
    if (!token) return false;
    try {
      // Vérifier que le token existe et n'est pas vide
      return token.length > 10; // JWT minimal length
    } catch (e) {
      return false;
    }
  },
  
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convertir en ms
      const now = Date.now();
      const isExpired = now >= exp;
      
      // Debug: afficher le temps restant
      if (isExpired) {
        console.warn('⏰ Token expiré');
      } else {
        const minutesLeft = Math.floor((exp - now) / 1000 / 60);
        console.log(`✅ Token valide pour encore ${minutesLeft} minutes`);
      }
      
      return isExpired;
    } catch (e) {
      console.error('❌ Erreur vérification expiration token:', e);
      return false; // Ne pas déconnecter sur erreur de parsing
    }
  }
};

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [tokenValide, setTokenValide] = useState(false);

  // Vérifier si un utilisateur est déjà connecté au chargement
  useEffect(() => {
    const utilisateurStocke = localStorage.getItem('utilisateur');
    const tokenStocke = localStorage.getItem('token');
    
    if (utilisateurStocke && tokenStocke) {
      // Vérifier la validité du token
      if (tokenUtils.isTokenValid(tokenStocke) && !tokenUtils.isTokenExpired(tokenStocke)) {
        setUtilisateur(JSON.parse(utilisateurStocke));
        setTokenValide(true);
      } else {
        // Token invalide ou expiré → nettoyer
        console.warn('⚠️ Token invalide ou expiré, déconnexion');
        localStorage.removeItem('utilisateur');
        localStorage.removeItem('token');
        setTokenValide(false);
      }
    }
    setChargement(false);
  }, []);

  const connexion = (donneesUtilisateur, token) => {
    // Valider le token avant de stocker
    if (!tokenUtils.isTokenValid(token)) {
      console.error('❌ Token invalide reçu du serveur');
      return false;
    }
    
    localStorage.setItem('utilisateur', JSON.stringify(donneesUtilisateur));
    localStorage.setItem('token', token);
    setUtilisateur(donneesUtilisateur);
    setTokenValide(true);
    return true;
  };

  const deconnexion = () => {
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
    setUtilisateur(null);
    setTokenValide(false);
  };

  const estConnecte = () => {
    return utilisateur !== null && tokenValide;
  };

  const estAdmin = () => {
    return utilisateur?.role === 'admin' && tokenValide;
  };

  const mettreAJourUtilisateur = (donneesUtilisateur) => {
    const utilisateurMisAJour = { ...utilisateur, ...donneesUtilisateur };
    localStorage.setItem('utilisateur', JSON.stringify(utilisateurMisAJour));
    setUtilisateur(utilisateurMisAJour);
  };

  const obtenirToken = () => {
    const token = localStorage.getItem('token');
    
    // Vérifier l'expiration du token
    if (token && tokenUtils.isTokenExpired(token)) {
      console.warn('⚠️ Token expiré, déconnexion');
      deconnexion();
      return null;
    }
    
    return token;
  };

  const value = {
    utilisateur,
    setUtilisateur,
    mettreAJourUtilisateur,
    utilisateurConnecte: utilisateur, // Alias pour compatibilité (utilisé dans Chatbot.js)
    connexion,
    deconnexion,
    estConnecte,
    estAdmin,
    obtenirToken,
    tokenValide,
    chargement
  };

  return (
    <AuthContext.Provider value={value}>
      {!chargement && children}
    </AuthContext.Provider>
  );
};
