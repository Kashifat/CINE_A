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
              <input
                type="password"
                placeholder="••••••••"
                value={motdepasse}
                onChange={(e) => setMotdepasse(e.target.value)}
                required
                className="form-input"
              />
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
