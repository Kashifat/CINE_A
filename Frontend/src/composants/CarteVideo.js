import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CarteVideo.css';

const CarteVideo = ({ film }) => {
  const navigate = useNavigate();

  // Détecter si c'est un film ou une série
  const isFilm = film.id_film || !film.id_serie;
  const isSerie = film.id_serie && !film.id_film;

  const handleClick = () => {
    if (isFilm) {
      navigate(`/lecture/${film.id_film}`);
    } else if (isSerie) {
      navigate(`/serie/${film.id_serie}`);
    }
  };

  return (
    <div className="carte-video" onClick={handleClick}>
      <div className="carte-image">
        {film.affiche ? (
          <img src={film.affiche} alt={film.titre} />
        ) : (
          <div className="carte-placeholder">
            <span>{isSerie ? '📺' : '🎬'}</span>
          </div>
        )}
        <div className="carte-overlay">
          <button className="btn-play">▶ {isSerie ? 'Regarder' : 'Lecture'}</button>
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
