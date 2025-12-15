import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import { useFavoris } from '../contexte/FavorisContext';
import favorisService from '../services/favorisService';
import CarteVideo from '../composants/CarteVideo';
import './MaListe.css';

const MaListe = () => {
  const { utilisateur, estConnecte } = useAuth();
  const { favoris: favorisContext, chargement: chargementContext } = useFavoris();
  const navigate = useNavigate();
  const [favoris, setFavoris] = useState({ films: [], episodes: [] });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!estConnecte()) {
      navigate('/connexion');
      return;
    }
    chargerFavoris();
  }, []);

  // Recharger quand le contexte change
  useEffect(() => {
    if (utilisateur?.id_utilisateur) {
      chargerFavoris();
    }
  }, [favorisContext]);

  const chargerFavoris = async () => {
    try {
      setChargement(true);
      const res = await favorisService.lister(utilisateur.id_utilisateur);
      if (res.succes) {
        setFavoris(res.data || { films: [], episodes: [] });
      } else {
        setFavoris({ films: [], episodes: [] });
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
      setFavoris({ films: [], episodes: [] });
    } finally {
      setChargement(false);
    }
  };

  const totalFavoris = (favoris.films?.length || 0) + (favoris.episodes?.length || 0);

  if (chargement || chargementContext) {
    return (
      <div className="page-container ma-liste-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement de votre liste...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container ma-liste-page">
      <button onClick={() => navigate('/')} className="btn-retour">← Retour</button>
      
      <div className="ma-liste-header">
        <h1 className="page-title">Ma Liste</h1>
        <p className="ma-liste-subtitle">
          {totalFavoris > 0 
            ? `${totalFavoris} contenu${totalFavoris > 1 ? 's' : ''} dans votre liste` 
            : 'Votre liste est vide'}
        </p>
      </div>

      {totalFavoris === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">♡</div>
          <h2>Votre liste est vide</h2>
          <p>Ajoutez des films et séries à vos favoris pour les retrouver ici facilement</p>
          <button onClick={() => navigate('/films')} className="btn-primary">
            Découvrir des films
          </button>
        </div>
      ) : (
        <div className="ma-liste-content">
          {/* Films favoris */}
          {favoris.films && favoris.films.length > 0 && (
            <section className="favoris-section">
              <h2 className="section-title">
                Films
                <span className="count">{favoris.films.length}</span>
              </h2>
              <div className="grid-films">
                {favoris.films.map((film) => (
                  <CarteVideo 
                    key={`fav-film-${film.id_film}`} 
                    film={{ ...film, type: 'Film' }} 
                    estFavoriInitial={true}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Épisodes favoris */}
          {favoris.episodes && favoris.episodes.length > 0 && (
            <section className="favoris-section">
              <h2 className="section-title">
                Épisodes
                <span className="count">{favoris.episodes.length}</span>
              </h2>
              <div className="episodes-list">
                {favoris.episodes.map((episode) => (
                  <div key={`fav-ep-${episode.id_episode}`} className="episode-card">
                    {episode.affiche && (
                      <div className="episode-thumbnail">
                        <img src={episode.affiche} alt={episode.serie} />
                      </div>
                    )}
                    <div className="episode-info">
                      <h3 className="episode-serie">{episode.serie}</h3>
                      <p className="episode-numero">
                        Saison {episode.numero_saison} • Épisode {episode.numero_episode}
                      </p>
                      <p className="episode-titre">{episode.titre}</p>
                      {episode.description && (
                        <p className="episode-description">{episode.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default MaListe;
