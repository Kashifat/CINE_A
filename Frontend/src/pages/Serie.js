import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import filmsService from '../services/filmsService';
import LecteurVideo from '../composants/LecteurVideo';
import './Serie.css';

const Serie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serie, setSerie] = useState(null);
  const [saisons, setSaisons] = useState([]);
  const [saisonActive, setSaisonActive] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [episodeEnLecture, setEpisodeEnLecture] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [versionActive, setVersionActive] = useState('vo'); // 'vo' ou 'vf'

  useEffect(() => {
    chargerSerie();
  }, [id]);

  useEffect(() => {
    if (saisonActive) {
      chargerEpisodes(saisonActive);
    }
  }, [saisonActive]);

  const chargerSerie = async () => {
    setChargement(true);
    
    // Charger la série
    const resultSerie = await filmsService.obtenirSerieParId(id);
    if (resultSerie.succes) {
      setSerie(resultSerie.data);
      
      // Charger les saisons
      const resultSaisons = await filmsService.obtenirSaisons(id);
      if (resultSaisons.succes && resultSaisons.data.length > 0) {
        setSaisons(resultSaisons.data);
        // Charger la première saison par défaut
        setSaisonActive(resultSaisons.data[0].id_saison);
      }
    } else {
      console.error('Série non trouvée');
      navigate('/films');
    }
    
    setChargement(false);
  };

  const chargerEpisodes = async (saisonId) => {
    const result = await filmsService.obtenirEpisodes(saisonId);
    if (result.succes) {
      setEpisodes(result.data);
      if (result.data.length > 0) {
        setEpisodeEnLecture(result.data[0]);
      }
    }
  };

  if (chargement) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!serie) {
    return (
      <div className="page-container serie-page">
        <div className="erreur-container">
          <h2>Série non trouvée</h2>
          <button onClick={() => navigate('/films')} className="btn-primary">
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container serie-page">
      {/* En-tête de la série */}
      <div className="serie-header">
        <div className="serie-affiche">
          {serie.affiche ? (
            <img src={serie.affiche} alt={serie.titre} />
          ) : (
            <div className="affiche-placeholder">📺</div>
          )}
        </div>
        
        <div className="serie-meta">
          <button className="btn-back" onClick={() => navigate('/films')}>
            ← Retour
          </button>
          <h1 className="serie-titre">{serie.titre}</h1>
          
          <div className="serie-info-grid">
            <div className="info-item">
              <span className="info-label">Catégorie</span>
              <span className="info-value">{serie.categorie || 'Non défini'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Pays</span>
              <span className="info-value">{serie.pays || 'Non défini'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Saisons</span>
              <span className="info-value">{saisons.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Épisodes</span>
              <span className="info-value">{episodes.length}</span>
            </div>
          </div>

          {serie.description && (
            <div className="serie-description">
              <h3>Synopsis</h3>
              <p>{serie.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lecteur vidéo */}
      {episodeEnLecture && (
        <div className="lecteur-section">
          <div className="lecteur-container">
            <h2 className="lecteur-titre">
              Saison {saisons.find(s => s.id_saison === saisonActive)?.numero_saison} 
              • Épisode {episodeEnLecture.numero_episode} - {episodeEnLecture.titre}
            </h2>
            
            {/* Sélecteur de version */}
            <div className="version-selector">
              <button
                className={`btn-version ${versionActive === 'vo' ? 'active' : ''}`}
                onClick={() => setVersionActive('vo')}
              >
                🌍 Version Originale
              </button>
              <button
                className={`btn-version ${versionActive === 'vf' ? 'active' : ''}`}
                onClick={() => setVersionActive('vf')}
              >
                🇫🇷 Version Française
              </button>
            </div>

            {/* Player vidéo */}
            <LecteurVideo 
              videoUrl={versionActive === 'vo' ? episodeEnLecture.lien_vo : episodeEnLecture.lien_vf}
            />

            {/* Info épisode */}
            {episodeEnLecture.description && (
              <div className="episode-description">
                <h3>Description</h3>
                <p>{episodeEnLecture.description}</p>
              </div>
            )}
            
            {episodeEnLecture.duree && (
              <p className="episode-duree">⏱️ Durée: {episodeEnLecture.duree} minutes</p>
            )}
          </div>
        </div>
      )}

      {/* Saisons et épisodes */}
      <div className="contenu-section">
        <h2 className="section-title">📺 Saisons & Épisodes</h2>

        {/* Sélecteur de saison */}
        <div className="saisons-selector">
          <div className="saisons-list">
            {saisons.map((saison) => (
              <button
                key={saison.id_saison}
                className={`btn-saison ${saisonActive === saison.id_saison ? 'active' : ''}`}
                onClick={() => setSaisonActive(saison.id_saison)}
              >
                Saison {saison.numero_saison}
                {saison.annee && ` (${saison.annee})`}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des épisodes */}
        {episodes.length > 0 ? (
          <div className="episodes-list">
            {episodes.map((episode) => (
              <div
                key={episode.id_episode}
                className={`episode-item ${episodeEnLecture?.id_episode === episode.id_episode ? 'active' : ''}`}
                onClick={() => setEpisodeEnLecture(episode)}
              >
                <div className="episode-numero">
                  {episode.numero_episode}
                </div>
                <div className="episode-contenu">
                  <h4 className="episode-titre">
                    Épisode {episode.numero_episode} - {episode.titre}
                  </h4>
                  {episode.description && (
                    <p className="episode-synopsis">
                      {episode.description.substring(0, 150)}
                      {episode.description.length > 150 && '...'}
                    </p>
                  )}
                  <div className="episode-meta">
                    {episode.duree && <span>⏱️ {episode.duree} min</span>}
                    {episode.lien_vo && <span className="badge-vo">VO</span>}
                    {episode.lien_vf && <span className="badge-vf">VF</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-episodes">
            <p>Aucun épisode disponible pour cette saison</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Serie;
