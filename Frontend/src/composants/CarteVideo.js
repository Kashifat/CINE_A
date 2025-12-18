import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './CarteVideo.css';
import { useAuth } from '../contexte/AuthContext';
import { useFavoris } from '../contexte/FavorisContext';

const CarteVideo = ({ film, estFavoriInitial = false }) => {
  const navigate = useNavigate();
  const { utilisateur } = useAuth();
  const { estFavori, ajouter, retirer } = useFavoris();
  const [enCours, setEnCours] = useState(false);

  // Détecter si c'est un film ou une série basé sur la propriété 'type' ou les IDs
  const isFilm = film.type === 'Film' || (film.id_film && !film.id_serie);
  const isSerie = film.type === 'Serie' || (film.id_serie && !film.id_film);

  // Vérifier si c'est un favori en utilisant le contexte (films uniquement)
  const isFavorited = useMemo(() => {
    if (isFilm && film.id_film) {
      return estFavori(film.id_film, null);
    }
    return false;
  }, [estFavori, film, isFilm]);

  const handleClick = () => {
    if (isFilm && film.id_film) {
      navigate(`/lecture/${film.id_film}`);
    } else if (isSerie && film.id_serie) {
      navigate(`/serie/${film.id_serie}`);
    }
  };

  const handleBandeAnnonce = (e) => {
    e.stopPropagation(); // Empêcher la propagation au parent
    if (isFilm && film.id_film) {
      navigate(`/bande-annonce/film/${film.id_film}`);
    } else if (isSerie && film.id_serie) {
      navigate(`/bande-annonce/serie/${film.id_serie}`);
    }
  };

  const handleToggleFavori = async (e) => {
    e.stopPropagation();
    if (!utilisateur) return;
    
    try {
      setEnCours(true);
      const id_utilisateur = utilisateur.id_utilisateur || utilisateur.id;
      
      if (isFilm && film.id_film) {
        if (isFavorited) {
          await retirer(id_utilisateur, film.id_film, null);
        } else {
          await ajouter(id_utilisateur, film.id_film, null);
        }
      }
    } finally {
      setEnCours(false);
    }
  };

  return (
    <div className="carte-video">
      <div className="carte-image">
        {film.affiche ? (
          <img src={film.affiche} alt={film.titre} />
        ) : (
          <div className="carte-placeholder">
            <span>{isSerie ? '' : ''}</span>
          </div>
        )}
        <div className="carte-overlay">
          <button className="btn-play" onClick={handleClick}>▶ {isSerie ? 'Regarder' : 'Lecture'}</button>
          {film.bande_annonce && (
            <button 
              className="btn-bande-annonce" 
              onClick={handleBandeAnnonce}
            >
               Bande Annonce
            </button>
          )}
          {utilisateur && isFilm && (
            <button className="btn-favori" onClick={handleToggleFavori} disabled={enCours}>
              {enCours ? '…' : isFavorited ? '♥ Retirer' : '♡ Favori'}
            </button>
          )}
          <div className="carte-info">
            <p className="note">⭐ {film.note || 'N/A'}</p>
            <p className="duree">{film.duree || 'N/A'} {isSerie ? 'saisons' : 'min'}</p>
          </div>
        </div>
      </div>
      <div className="carte-details">
        <h3 className="carte-titre">{film.titre}</h3>
        <p className="carte-genre">
          {film.categorie || film.genre}
          {isSerie && ' • Série'}
        </p>
        <p className="carte-description">
          {film.description?.substring(0, 100)}
          {film.description?.length > 100 && '...'}
        </p>
      </div>
    </div>
  );
};

export default CarteVideo;
