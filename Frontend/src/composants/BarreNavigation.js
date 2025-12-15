import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import NotificationPanel from './NotificationPanel';
import './BarreNavigation.css';

const BarreNavigation = () => {
  const { utilisateur, deconnexion, estConnecte, estAdmin } = useAuth();
  const navigate = useNavigate();

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/connexion');
  };

  const isAdmin = estConnecte() && utilisateur?.id_admin;

  return (
    <nav className="barre-navigation">
      <div className="nav-container">
        <Link to={isAdmin ? "/admin" : "/"} className="logo">
          <h1>CineA</h1>
        </Link>

        <ul className="nav-links">
          {/* Menu Usager */}
          {!isAdmin && (
            <>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/films">Films & Séries</Link></li>
              <li><Link to="/tv">Chaînes TV</Link></li>
              <li><Link to="/ma-liste">Ma Liste</Link></li>
              <li><Link to="/jeux">Jeux</Link></li>
              <li><Link to="/communaute">Communauté</Link></li>
              <li><Link to="/chatbot">Chatbot</Link></li>
            </>
          )}

          {/* Menu Admin */}
          {isAdmin && (
            <>
              <li><Link to="/admin">Tableau de Bord</Link></li>
            </>
          )}
        </ul>

        <div className="nav-actions">
          {estConnecte() ? (
            <>
              {!isAdmin && (
                <>
                  <NotificationPanel />
                  <Link to="/profil" className="btn-dashboard">
                    {utilisateur?.photo_profil && (
                      <img 
                        src={utilisateur.photo_profil.startsWith('http') 
                          ? utilisateur.photo_profil 
                          : `http://localhost:5002/media/${utilisateur.photo_profil}`
                        }
                        alt={utilisateur?.nom}
                        className="nav-avatar"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    {utilisateur?.nom || 'Profil'}
                  </Link>
                </>
              )}
              {isAdmin && (
                <span className="admin-badge">
                  Admin: {utilisateur?.nom || 'Admin'}
                </span>
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
