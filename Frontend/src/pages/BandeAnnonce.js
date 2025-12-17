import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import filmsService from '../services/filmsService';
import './BandeAnnonce.css';

const BandeAnnonce = () => {
  const { type, id } = useParams(); // type: 'film' ou 'serie', id: l'ID du contenu
  const navigate = useNavigate();
  const { estConnecte } = useAuth();
  const [contenu, setContenu] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!estConnecte()) {
      navigate('/connexion');
      return;
    }
    chargerContenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  const chargerContenu = async () => {
    setChargement(true);
    setErreur('');

    try {
      let result;
      if (type === 'film') {
        result = await filmsService.obtenirFilmParId(id);
      } else if (type === 'serie') {
        result = await filmsService.obtenirSerieParId(id);
      }

      if (result.succes && result.data) {
        setContenu(result.data);
        if (!result.data.bande_annonce) {
          setErreur('Aucune bande annonce disponible pour ce contenu');
        }
      } else {
        setErreur('Contenu introuvable');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setErreur('Erreur lors du chargement du contenu');
    }

    setChargement(false);
  };

  const handleRetour = () => {
    navigate(-1);
  };

  const handleVoirFilm = () => {
    if (type === 'film') {
      navigate(`/lecture/${id}`);
    } else if (type === 'serie') {
      navigate(`/serie/${id}`);
    }
  };

  if (chargement) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (erreur || !contenu) {
    return (
      <div className="page-container bande-annonce-page">
        <button onClick={handleRetour} className="btn-retour">← Retour</button>
        <div className="error-message">
          <h2> {erreur || 'Contenu introuvable'}</h2>
          <button onClick={handleRetour} className="btn-primary">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bande-annonce-page">
      <button onClick={handleRetour} className="btn-retour">← Retour</button>
      
      <div className="bande-annonce-container">
        <div className="bande-annonce-header">
          <h1 className="bande-annonce-titre">
             Bande Annonce - {contenu.titre}
          </h1>
          <p className="bande-annonce-description">{contenu.description}</p>
        </div>

        {contenu.bande_annonce ? (
          <div className="video-wrapper">
            <video
              width="100%"
              height="100%"
              controls
              autoPlay
              className="bande-annonce-video"
            >
              <source src={contenu.bande_annonce} type="video/mp4" />
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          </div>
        ) : (
          <div className="no-bande-annonce">
            <p> Aucune bande annonce disponible pour ce contenu</p>
          </div>
        )}

        <div className="bande-annonce-actions">
          <button onClick={handleVoirFilm} className="btn-voir-film">
            ▶ Voir le {type === 'film' ? 'film' : 'série'} complet
          </button>
          <button onClick={handleRetour} className="btn-secondary">
            ← Retour à la liste
          </button>
        </div>

        {/* Informations supplémentaires */}
        <div className="bande-annonce-info">
          <div className="info-card">
            <span className="info-label">Genre:</span>
            <span className="info-value">{contenu.categorie || contenu.genre || 'N/A'}</span>
          </div>
          <div className="info-card">
            <span className="info-label">Note:</span>
            <span className="info-value">⭐ {contenu.note || 'N/A'}</span>
          </div>
          {type === 'film' && contenu.duree && (
            <div className="info-card">
              <span className="info-label">Durée:</span>
              <span className="info-value">⏱ {contenu.duree} min</span>
            </div>
          )}
          {contenu.annee_sortie && (
            <div className="info-card">
              <span className="info-label">Année:</span>
              <span className="info-value"> {contenu.annee_sortie}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BandeAnnonce;
