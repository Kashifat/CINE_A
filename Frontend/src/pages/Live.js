import React, { useState } from 'react';
import './Live.css';

const Live = () => {
  const [chaineActive, setChaineActive] = useState(null);

  const chaines = [
    {
      id: 1,
      nom: 'RTI 1',
      logo: '📺',
      url: 'https://www.youtube.com/embed/live_stream_url',
      description: 'La première chaîne de Côte d\'Ivoire'
    },
    {
      id: 2,
      nom: 'RTI 2',
      logo: '📡',
      url: 'https://www.youtube.com/embed/live_stream_url',
      description: 'Chaîne généraliste ivoirienne'
    },
    {
      id: 3,
      nom: 'A+',
      logo: '🎬',
      url: 'https://www.youtube.com/embed/live_stream_url',
      description: 'Cinéma et séries africaines'
    },
    {
      id: 4,
      nom: 'Canal+',
      logo: '🎥',
      url: 'https://www.youtube.com/embed/live_stream_url',
      description: 'Sport et divertissement'
    }
  ];

  const handleChaineClick = (chaine) => {
    setChaineActive(chaine);
  };

  return (
    <div className="page-container live-page">
      <h1 className="section-title">📺 TV en Direct</h1>
      <p className="page-description">
        Regardez vos chaînes préférées en direct
      </p>

      {/* Player */}
      <div className="live-player-container">
        {chaineActive ? (
          <div className="live-player">
            <div className="player-header">
              <h2>
                <span className="chaine-logo">{chaineActive.logo}</span>
                {chaineActive.nom}
              </h2>
              <span className="live-badge">🔴 EN DIRECT</span>
            </div>
            <div className="player-video">
              {/* En production, remplacer par un vrai stream */}
              <iframe
                width="100%"
                height="500"
                src={chaineActive.url}
                title={chaineActive.nom}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="player-info">
              <p>{chaineActive.description}</p>
            </div>
          </div>
        ) : (
          <div className="no-chaine-selected">
            <span className="icon-tv">📺</span>
            <p>Sélectionnez une chaîne pour commencer</p>
          </div>
        )}
      </div>

      {/* Liste des chaînes */}
      <div className="chaines-section">
        <h2 className="section-title">Chaînes disponibles</h2>
        <div className="chaines-grid">
          {chaines.map((chaine) => (
            <div
              key={chaine.id}
              className={`chaine-card ${chaineActive?.id === chaine.id ? 'active' : ''}`}
              onClick={() => handleChaineClick(chaine)}
            >
              <div className="chaine-logo-large">{chaine.logo}</div>
              <h3>{chaine.nom}</h3>
              <p>{chaine.description}</p>
              {chaineActive?.id === chaine.id && (
                <span className="badge-watching">▶ En cours</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Guide des programmes (placeholder) */}
      <div className="programme-guide">
        <h2 className="section-title">Programme du jour</h2>
        <div className="guide-placeholder">
          <p>📅 Guide des programmes à venir</p>
        </div>
      </div>
    </div>
  );
};

export default Live;
