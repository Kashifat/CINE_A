import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import filmsService from '../services/filmsService';
import historiqueService from '../services/historiqueService';
import tvService from '../services/tvService';
import publicationService from '../services/publicationService';
import Header from '../composants/Header';
import CarteVideo from '../composants/CarteVideo';
import './Accueil.css';

const Accueil = () => {
  const { estConnecte, utilisateur } = useAuth();
  const navigate = useNavigate();
  const [filmVedette, setFilmVedette] = useState(null);
  const [filmsPopulaires, setFilmsPopulaires] = useState([]);
  const [filmsTendances, setFilmsTendances] = useState([]);
  const [seriesTendances, setSeriesTendances] = useState([]);
  const [chaines, setChaines] = useState([]);
  const [publications, setPublications] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [contenuCarousel, setContenuCarousel] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Charger le film en vedette au montage et toutes les 30 minutes
  useEffect(() => {
    chargerFilmVedette();
    const interval = setInterval(() => {
      chargerFilmVedette();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, []);

  // Charger les autres données
  useEffect(() => {
    chargerDonnees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utilisateur]);

  const chargerFilmVedette = async () => {
    try {
      const result = await filmsService.obtenirFilmVedette();
      console.log('📽️ Film vedette chargé:', result);
      if (result.succes) {
        console.log('✅ Film vedette:', result.data.titre);
        setFilmVedette(result.data);
      } else {
        console.warn('⚠️ Erreur film vedette:', result.erreur);
        setFilmVedette(null);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du film vedette:', error);
      setFilmVedette(null);
    }
  };

  const chargerDonnees = async () => {
    setChargement(true);

    try {
      // Charger les films tendances
      const resultFilms = await filmsService.obtenirTendances();
      if (resultFilms.succes) {
        setFilmsTendances(resultFilms.data.slice(0, 8));
        setFilmsPopulaires(resultFilms.data.slice(8, 16));
      }

      // Charger les séries tendances
      const resultSeries = await filmsService.obtenirToutesSeries();
      if (resultSeries.succes) {
        setSeriesTendances(resultSeries.data.slice(0, 8));
      }

      // Charger les chaînes TV
      const resultChaines = await tvService.obtenirChaines();
      if (resultChaines.succes) {
        setChaines(resultChaines.data.slice(0, 8));
      }

      // Charger les films et séries pour le carrousel
      let contenu = [];
      if (resultFilms.succes) {
        contenu = [...contenu, ...resultFilms.data.slice(0, 8).map(f => ({...f, type: 'film'}))];
      }
      if (resultSeries.succes) {
        contenu = [...contenu, ...resultSeries.data.slice(0, 8).map(s => ({...s, type: 'serie'}))];
      }
      setContenuCarousel(contenu.slice(0, 16));

      // Charger les dernières publications
      try {
        const resultPublications = await publicationService.obtenirTout();
        if (resultPublications.succes) {
          setPublications(resultPublications.data.slice(0, 3));
        }
      } catch (error) {
        console.warn('⚠️ Service publications indisponible');
        setPublications([]);
      }

      // Charger l'historique si connecté
      if (estConnecte() && utilisateur) {
        try {
          const resultHistorique = await historiqueService.obtenirHistorique(utilisateur.id_utilisateur);
          if (resultHistorique.succes) {
            setHistorique(resultHistorique.data.slice(0, 6));
          }
        } catch (error) {
          console.warn('⚠️ Service historique indisponible');
          setHistorique([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setChargement(false);
    }
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) => (prev === 0 ? contenuCarousel.length - 1 : prev - 1));
  };

  const nextCarousel = () => {
    setCarouselIndex((prev) => (prev === contenuCarousel.length - 1 ? 0 : prev + 1));
  };

  const handleContenuClick = (contenu) => {
    const id = contenu.type === 'serie' ? contenu.id_serie : contenu.id_film;
    navigate(`/lecture/${id}`);
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
      {/* Hero Header avec film en vedette */}
      <Header 
        titre={filmVedette?.titre || "Bienvenue sur CineA"}
        sousTitre={filmVedette ? "Film en vedette" : "Votre plateforme de streaming premium"}
        description={filmVedette?.resume || "Découvrez des milliers de films et séries, regardez la TV en direct, et partagez votre passion avec la communauté !"}
        imageFond={filmVedette?.affiche || null}
        videoUrl={filmVedette?.lien_vo || filmVedette?.lien_vf || null}
        boutonTexte={filmVedette ? "Regarder maintenant" : (estConnecte() ? "Parcourir le catalogue" : "Commencer gratuitement")}
        boutonLien={!filmVedette && (estConnecte() ? "/films" : "/inscription")}
        onBoutonClick={filmVedette ? () => navigate(`/lecture/${filmVedette.id_film}`) : null}
        afficherBouton={true}
        hauteur="large"
      />

     
      {/* Continuer à regarder */}
      {estConnecte() && historique.length > 0 && (
        <section className="section-contenus">
          <div className="section-header">
            <h2 className="section-title">Continuer à regarder</h2>
            <a href="/ma-liste" className="see-all-link">Voir tout →</a>
          </div>
          <div className="grid-container grid-6">
            {historique.map((item) => (
              <CarteVideo key={item.id_historique} film={item} />
            ))}
          </div>
        </section>
      )}

      {/* Films populaires */}
      <section className="section-contenus">
        <div className="section-header">
          <h2 className="section-title">Films populaires</h2>
          <a href="/films" className="see-all-link">Voir tout →</a>
        </div>
        <div className="grid-container grid-6">
          {filmsTendances.map((film) => (
            <CarteVideo key={film.id_film} film={film} />
          ))}
        </div>
      </section>

      {/* Séries tendances */}
      <section className="section-contenus">
        <div className="section-header">
          <h2 className="section-title">Séries à découvrir</h2>
          <a href="/films" className="see-all-link">Voir tout →</a>
        </div>
        <div className="grid-container grid-6">
          {seriesTendances.length > 0 ? (
            seriesTendances.map((serie) => (
              <CarteVideo key={serie.id_serie} film={serie} />
            ))
          ) : (
            <p className="no-content">Aucune série disponible pour le moment</p>
          )}
        </div>
      </section>

      {/* Chaînes TV en direct */}
      <section className="section-contenus">
        <div className="section-header">
          <h2 className="section-title">Chaînes TV en direct</h2>
          <a href="/tv" className="see-all-link">Voir tout →</a>
        </div>
        <div className="grid-container grid-6">
          {chaines.map((chaine) => (
            <div 
              key={chaine.id_chaine} 
              className="chaine-card"
              onClick={() => navigate('/tv')}
            >
              {/* Afficher l'image si disponible, sinon le texte emoji */}
              {chaine.image || chaine.logo ? (
                typeof chaine.image === 'string' && (chaine.image.startsWith('http') || chaine.image.startsWith('/')) ? (
                  <img 
                    src={chaine.image || chaine.logo} 
                    alt={chaine.nom}
                    className="chaine-logo-img"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div className="chaine-logo-emoji">{chaine.logo}</div>
                )
              ) : (
                <div className="chaine-logo-emoji">📺</div>
              )}
              <h3 className="chaine-nom">{chaine.nom}</h3>
              <p className="chaine-desc">{chaine.description}</p>
              <span className="chaine-badge">{chaine.categorie}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Rejoindre la communauté - Publications récentes */}
      <section className="section-contenus community-feed-section">
        <div className="section-header">
          <h2 className="section-title">Rejoignez la communauté</h2>
          <a href="/communaute" className="see-all-link">Voir tout →</a>
        </div>
        <p className="community-subtitle">Partagez vos découvertes et connectez-vous avec d'autres passionnés de cinéma</p>
        
        {publications.length > 0 ? (
          <div className="community-publications">
            {publications.map((pub) => (
              <div key={pub.id_publication} className="publication-card">
                <div className="pub-header">
                  <div className="pub-author-info">
                    <h4 className="pub-author">{pub.utilisateur?.nom || 'Utilisateur'}</h4>
                    <span className="pub-time">{pub.date_creation || 'Récent'}</span>
                  </div>
                </div>
                <p className="pub-content">{pub.contenu || pub.description}</p>
                {pub.media && <div className="pub-media">{pub.media}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className="no-content">Aucune publication pour le moment. Soyez le premier à partager!</p>
        )}
      </section>

      {/* Features - Une expérience complète */}
      <section className="features-section">
        <h2 className="section-title">Une expérience de streaming complète</h2>
        <p className="features-subtitle">Découvrez toutes les fonctionnalités qui font de CineA votre destination préférée</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Streaming illimité</h3>
            <p>Accédez à des milliers de films et séries en haute qualité</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Communauté active</h3>
            <p>Partagez vos avis et découvertes avec d'autres cinéphiles</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>Personnalisé</h3>
            <p>Reprenez là où vous vous êtes arrêté, sauvegardez vos favoris</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"></div>
            <h3>CinéaBot</h3>
            <p>Votre assistant virtuel pour découvrir de nouveaux contenus</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accueil;
