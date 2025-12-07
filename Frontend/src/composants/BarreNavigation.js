import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import './BarreNavigation.css';

const BarreNavigation = () => {
  const { utilisateur, deconnexion, estConnecte, estAdmin } = useAuth();
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/connexion');
  };

  return (
    <nav className="barre-navigation">
      <div className="nav-container">
        <Link to="/" className="logo">
          <h1>CineA</h1>
        </Link>

        <ul className="nav-links">
          <li><Link to="/">Accueil</Link></li>
          <li><Link to="/films">Films & Séries</Link></li>
          <li><Link to="/live">TV en Direct</Link></li>
          <li><Link to="/communaute">Communauté</Link></li>
        </ul>

        <div className="nav-actions">
          {estConnecte() ? (
            <>
              <Link to="/profil" className="btn-dashboard">
                {utilisateur?.nom || 'Profil'}
              </Link>
              {estAdmin() && (
                <Link to="/admin" className="btn-admin">
                  Admin
                </Link>
              )}
              <button onClick={handleDeconnexion} className="btn-deconnexion">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="btn-connexion">
                Connexion
              </Link>
              <Link to="/inscription" className="btn-inscription">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default BarreNavigation;
