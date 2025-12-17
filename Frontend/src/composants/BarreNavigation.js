import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import NotificationPanel from './NotificationPanel';
import './BarreNavigation.css';

const BarreNavigation = () => {
  const { utilisateur, deconnexion, estConnecte } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOuvert, setMenuOuvert] = useState(false);

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/connexion');
  };

  const isAdmin = estConnecte() && utilisateur?.id_admin;

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setMenuOuvert(false);
  }, [location.pathname]);

  // Fermer le menu mobile avec ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOuvert(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const liensUser = (
    <>
      <li><Link to="/" className={location.pathname === "/" ? "active" : ""}>Accueil</Link></li>
      <li><Link to="/films" className={location.pathname.startsWith("/films") ? "active" : ""}>Films & Séries</Link></li>
      <li><Link to="/tv" className={location.pathname.startsWith("/tv") ? "active" : ""}>Chaînes TV</Link></li>
      <li><Link to="/ma-liste" className={location.pathname.startsWith("/ma-liste") ? "active" : ""}>Ma Liste</Link></li>
      <li><Link to="/jeux" className={location.pathname.startsWith("/jeux") ? "active" : ""}>Jeux</Link></li>
      <li><Link to="/communaute" className={location.pathname.startsWith("/communaute") ? "active" : ""}>Communauté</Link></li>
      <li><Link to="/chatbot" className={location.pathname.startsWith("/chatbot") ? "active" : ""}>Chatbot</Link></li>
    </>
  );

  const liensAdmin = (
    <>
      <li><Link to="/admin" className={location.pathname.startsWith("/admin") ? "active" : ""}>Tableau de Bord</Link></li>
    </>
  );

  return (
    <nav className="barre-navigation">
      <div className="nav-container">
        <Link to={isAdmin ? "/admin" : "/"} className="logo" aria-label="Aller à l'accueil">
          {/* Logo image 
          <img src="/logo.png" alt="CineA Logo" className="logo-image" />
        */}
        <h1>CineA</h1>
        </Link>

        {/* Liens desktop */}
        <ul className="nav-links" aria-label="Navigation principale">
          {!isAdmin ? liensUser : liensAdmin}
        </ul>

        <div className="nav-actions">
          {estConnecte() ? (
            <>
              {!isAdmin && (
                <>
                  <NotificationPanel />

                  <Link to="/profil" className="btn-dashboard" aria-label="Aller au profil">
                    {utilisateur?.photo_profil && (
                      <img
                        src={utilisateur.photo_profil.startsWith('http')
                          ? utilisateur.photo_profil
                          : `http://localhost:5002/media/${utilisateur.photo_profil}`
                        }
                        alt={utilisateur?.nom}
                        className="nav-avatar"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <span className="btn-dashboard-text">{utilisateur?.nom || 'Profil'}</span>
                  </Link>
                </>
              )}

              {isAdmin && (
                <span className="admin-badge" title="Compte administrateur">
                  Admin : {utilisateur?.nom || 'Admin'}
                </span>
              )}

              <button onClick={handleDeconnexion} className="btn-deconnexion">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="btn-connexion">Connexion</Link>
              <Link to="/inscription" className="btn-inscription">S'inscrire</Link>
            </>
          )}

          {/* Bouton menu mobile */}
          <button
            type="button"
            className={`btn-menu ${menuOuvert ? "open" : ""}`}
            aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOuvert}
            onClick={() => setMenuOuvert(v => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Menu mobile (drawer) */}
      <div className={`mobile-drawer ${menuOuvert ? "show" : ""}`} role="dialog" aria-label="Menu mobile">
        <ul className="mobile-links">
          {!isAdmin ? liensUser : liensAdmin}
        </ul>

        <div className="mobile-actions">
          {estConnecte() ? (
            <>
              {!isAdmin && (
                <Link to="/profil" className="mobile-profil">
                  <span className="mobile-profil-title">{utilisateur?.nom || 'Profil'}</span>
                  <span className="mobile-profil-sub">Voir mon compte</span>
                </Link>
              )}

              <button onClick={handleDeconnexion} className="mobile-btn mobile-btn-outline">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="mobile-btn mobile-btn-outline">Connexion</Link>
              <Link to="/inscription" className="mobile-btn mobile-btn-primary">S'inscrire</Link>
            </>
          )}
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`mobile-overlay ${menuOuvert ? "show" : ""}`}
        onClick={() => setMenuOuvert(false)}
        aria-hidden="true"
      />
    </nav>
  );
};

export default BarreNavigation;
