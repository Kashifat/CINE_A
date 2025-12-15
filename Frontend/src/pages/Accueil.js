import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import filmsService from '../services/filmsService';
import historiqueService from '../services/historiqueService';
import CarteVideo from '../composants/CarteVideo';
import './Accueil.css';

const Accueil = () => {
  const { estConnecte, utilisateur } = useAuth();
  const navigate = useNavigate();
  const [filmsTendances, setFilmsTendances] = useState([]);
  const [seriesTendances, setSeriesTendances] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    chargerDonnees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilisateur]);

  const chargerDonnees = async () => {
    setChargement(true);

    try {
      // Charger les films tendances
      const resultFilms = await filmsService.obtenirTendances();
      if (resultFilms.succes) {
        setFilmsTendances(resultFilms.data.slice(0, 6));
      }

      // Charger les séries tendances
      const resultSeries = await filmsService.obtenirToutesSeries();
      if (resultSeries.succes) {
        setSeriesTendances(resultSeries.data.slice(0, 6));
      }

      // Charger l'historique si connecté (avec gestion d'erreur)
      if (estConnecte() && utilisateur) {
        try {
          const resultHistorique = await historiqueService.obtenirHistorique(utilisateur.id_utilisateur);
          if (resultHistorique.succes) {
            setHistorique(resultHistorique.data.slice(0, 6));
          }
        } catch (error) {
          console.warn('⚠️ Service historique indisponible, continuant sans historique');
          setHistorique([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setChargement(false);
    }
  };

  if (chargement) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container accueil">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-titre">Bienvenue sur CineA</h1>
          <p className="hero-description">
            Découvrez des milliers de films et séries, regardez la TV en direct,
            et partagez votre passion avec la communauté !
          </p>
          <div className="hero-actions">
            {estConnecte() ? (
              <>
                <button onClick={() => navigate('/films')} className="btn-primary">
                  🎬 Parcourir le catalogue
                </button>
                <button onClick={() => navigate('/live')} className="btn-secondary">
                  📺 TV en Direct
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/inscription')} className="btn-primary">
                  Commencer gratuitement
                </button>
                <button onClick={() => navigate('/connexion')} className="btn-secondary">
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Continuer à regarder */}
      {estConnecte() && historique.length > 0 && (
        <section className="section-contenus">
          <h2 className="section-title">📺 Continuer à regarder</h2>
          <div className="grid-container">
            {historique.map((item) => (
              <CarteVideo key={item.id_historique} film={item} />
            ))}
          </div>
        </section>
      )}

      {/* Films tendances */}
      <section className="section-contenus">
        <h2 className="section-title">🔥 Tendances du moment (Films)</h2>
        <div className="grid-container">
          {filmsTendances.map((film) => (
            <CarteVideo key={film.id_film} film={film} />
          ))}
        </div>
      </section>

      {/* Séries tendances */}
      <section className="section-contenus">
        <h2 className="section-title">📺 Séries à découvrir</h2>
        <div className="grid-container">
          {seriesTendances.length > 0 ? (
            seriesTendances.map((serie) => (
              <CarteVideo key={serie.id_serie} film={serie} />
            ))
          ) : (
            <p className="no-content">Aucune série disponible pour le moment</p>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Pourquoi CineA ?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎬</div>
            <h3>Films & Séries</h3>
            <p>Des milliers de contenus à la demande</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📺</div>
            <h3>TV en Direct</h3>
            <p>Regardez vos chaînes préférées en live</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Communauté</h3>
            <p>Partagez et réagissez avec d'autres fans</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏯️</div>
            <h3>Reprise automatique</h3>
            <p>Continuez là où vous vous êtes arrêté</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accueil;
