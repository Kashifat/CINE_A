import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import authService from '../services/authService';
import './Connexion.css';

const Inscription = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    courriel: '',
    motdepasse: '',
    confirmMotdepasse: ''
  });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [afficherMotDePasse, setAfficherMotDePasse] = useState(false);
  const [afficherConfirmation, setAfficherConfirmation] = useState(false);
  
  const { connexion } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    // Validation
    if (formData.motdepasse !== formData.confirmMotdepasse) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.motdepasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setChargement(true);

    const donnees = {
      nom: formData.nom,
      prenom: formData.prenom,
      courriel: formData.courriel,
      motdepasse: formData.motdepasse
    };

    const result = await authService.inscription(donnees);

    if (result.succes) {
      // Connexion automatique après inscription
      const resultConnexion = await authService.connexion(
        formData.courriel,
        formData.motdepasse
      );

      if (resultConnexion.succes) {
        const { utilisateur, token } = resultConnexion.data;
        connexion(utilisateur, token);
        navigate('/');
      }
    } else {
      setErreur(result.erreur);
    }

    setChargement(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-titre">Inscription</h1>
          <p className="auth-subtitle">Créez votre compte CineA gratuitement</p>

          {erreur && (
            <div className="message-error">{erreur}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                placeholder="Jean"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                placeholder="Dupont"
                value={formData.nom}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="courriel"
                placeholder="votre@email.com"
                value={formData.courriel}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <div className="password-input-wrapper">
                <input
                  type={afficherMotDePasse ? "text" : "password"}
                  name="motdepasse"
                  placeholder="••••••••"
                  value={formData.motdepasse}
                  onChange={handleChange}
                  required
                  minLength="6"
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

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <div className="password-input-wrapper">
                <input
                  type={afficherConfirmation ? "text" : "password"}
                  name="confirmMotdepasse"
                  placeholder="••••••••"
                  value={formData.confirmMotdepasse}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setAfficherConfirmation(!afficherConfirmation)}
                  aria-label={afficherConfirmation ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {afficherConfirmation ? (
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
              {chargement ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Vous avez déjà un compte ?</p>
            <Link to="/connexion" className="auth-link">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inscription;
