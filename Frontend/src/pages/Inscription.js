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
              <input
                type="password"
                name="motdepasse"
                placeholder="••••••••"
                value={formData.motdepasse}
                onChange={handleChange}
                required
                minLength="6"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmMotdepasse"
                placeholder="••••••••"
                value={formData.confirmMotdepasse}
                onChange={handleChange}
                required
                className="form-input"
              />
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
