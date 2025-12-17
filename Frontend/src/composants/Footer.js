import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const anneeActuelle = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Section Logo & Description */}
        <div className="footer-section footer-brand">
          <h2 className="footer-logo">CineA</h2>
          <p className="footer-description">
            Votre plateforme de streaming premium pour films, séries et bien plus encore.
          </p>
        </div>

        {/* Section Navigation */}
        <div className="footer-section">
          <h3 className="footer-title">Navigation</h3>
          <ul className="footer-links">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/films">Films & Séries</Link></li>
            <li><Link to="/tv">Chaînes TV</Link></li>
            <li><Link to="/jeux">Jeux</Link></li>
            <li><Link to="/communaute">Communauté</Link></li>
          </ul>
        </div>

        {/* Section Mon Compte */}
        <div className="footer-section">
          <h3 className="footer-title">Mon Compte</h3>
          <ul className="footer-links">
            <li><Link to="/profil">Profil</Link></li>
            <li><Link to="/ma-liste">Ma Liste</Link></li>
            <li><Link to="/chatbot">Assistant</Link></li>
          </ul>
        </div>

        {/* Section Légal */}
        <div className="footer-section">
          <h3 className="footer-title">Informations</h3>
          <ul className="footer-links">
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/cgu">CGU</Link></li>
            <li><Link to="/confidentialite">Confidentialité</Link></li>
            <li><Link to="/aide">Aide</Link></li>
          </ul>
        </div>
      </div>

      {/* Barre du bas */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          © {anneeActuelle} CineA. Tous droits réservés.
        </p>
        <div className="footer-socials">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
            <span>f</span>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
            <span>𝕏</span>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
            <span>📷</span>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
            <span>▶</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
