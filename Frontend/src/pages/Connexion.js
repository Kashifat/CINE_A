import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import authService from '../services/authService';
import './Connexion.css';

const Connexion = () => {
  const [courriel, setCourriel] = useState('');
  const [motdepasse, setMotdepasse] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  
  const { connexion } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    const result = await authService.connexion(courriel, motdepasse);

    if (result.succes) {
      const { utilisateur, token } = result.data;
      connexion(utilisateur, token);
      navigate('/');
    } else {
      setErreur(result.erreur);
    }

    setChargement(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-titre">Connexion</h1>
          <p className="auth-subtitle">Connectez-vous pour accéder à CineA</p>

          {erreur && (
            <div className="message-error">{erreur}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="votre@email.com"
                value={courriel}
                onChange={(e) => setCourriel(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <div className="password-input-wrapper">
                <input
                  type={afficherMotDePasse ? "text" : "password"}
                  placeholder="••••••••"
                  value={motdepasse}
                  onChange={(e) => setMotdepasse(e.target.value)}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setAfficherMotDePasse(!afficherMotDePasse)}
                  aria-label={afficherMotDePasse ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {afficherMotDePasse ? (
                    // Eye Off (professional SVG)
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.3 18.3 0 0 1 5.06-5.94"/>
                      <path d="M1 1l22 22"/>
                      <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88"/>
                      <path d="M14.12 14.12 9.88 9.88"/>
                    </svg>
                  ) : (
                    // Eye (professional SVG)
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-full"
              disabled={chargement}
            >
              {chargement ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Pas encore de compte ?</p>
            <Link to="/inscription" className="auth-link">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion;
