import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  // Vérifier si un utilisateur est déjà connecté au chargement
  useEffect(() => {
    const utilisateurStocke = localStorage.getItem('utilisateur');
    const tokenStocke = localStorage.getItem('token');
    
    if (utilisateurStocke && tokenStocke) {
      setUtilisateur(JSON.parse(utilisateurStocke));
    }
    setChargement(false);
  }, []);

  const connexion = (donneesUtilisateur, token) => {
    localStorage.setItem('utilisateur', JSON.stringify(donneesUtilisateur));
    localStorage.setItem('token', token);
    setUtilisateur(donneesUtilisateur);
  };

  const deconnexion = () => {
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
    setUtilisateur(null);
  };

  const estConnecte = () => {
    return utilisateur !== null;
  };

  const estAdmin = () => {
    return utilisateur?.role === 'admin';
  };

  const value = {
    utilisateur,
    connexion,
    deconnexion,
    estConnecte,
    estAdmin,
    chargement
  };

  return (
    <AuthContext.Provider value={value}>
      {!chargement && children}
    </AuthContext.Provider>
  );
};
