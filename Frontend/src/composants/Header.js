import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ 
  titre = "Bienvenue sur CineA", 
  sousTitre = "Votre plateforme de streaming premium",
  description = "Découvrez des milliers de films, séries et contenus exclusifs en streaming illimité.",
  imageFond = null,
  videoUrl = null,
  boutonTexte = "Découvrir",
  boutonLien = "/films",
  onBoutonClick = null,
  afficherBouton = true,
  hauteur = "medium" // "small", "medium", "large"
}) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  // Auto-play + gère le son de la vidéo
  useEffect(() => {
    if (videoUrl) {
      console.log('🎬 Header reçu videoUrl:', videoUrl);
    }
    if (titre !== "Bienvenue sur CineA") {
      console.log('📝 Header reçu titre:', titre);
    }
    if (videoRef.current) {
      // Ne pas forcer muted - laisser l'utilisateur entendre le son
      videoRef.current.play().catch(err => {
        console.warn('Lecture vidéo header impossible:', err);
      });
    }
  }, [videoUrl, titre]);

  const handleClick = (e) => {
    if (onBoutonClick) {
      e.preventDefault();
      onBoutonClick();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  return (
    <header className={`page-header header-${hauteur}`}>
      {/* Vidéo de fond */}
      {videoUrl && (
        <video 
          ref={videoRef}
          className="header-video"
          src={videoUrl}
          loop
          autoPlay
          playsInline
        />
      )}
      
      {/* Fallback image si pas de vidéo */}
      {imageFond && !videoUrl && (
        <div 
          className="header-background"
          style={{ backgroundImage: `url(${imageFond})` }}
        />
      )}
      <div className="header-overlay" />
      <div className="header-content">
        <div className="header-text">
          {sousTitre && <span className="header-badge">{sousTitre}</span>}
          <h1 className="header-titre">{titre}</h1>
          {description && <p className="header-description">{description}</p>}
          {afficherBouton && (
            onBoutonClick ? (
              <button onClick={handleClick} className="header-btn">
                {boutonTexte}
              </button>
            ) : (
              <Link to={boutonLien} className="header-btn">
                {boutonTexte}
              </Link>
            )
          )}
        </div>
      </div>
      
      {/* Contrôles vidéo */}
      {videoUrl && (
        <div className="header-video-controls">
          <button 
            onClick={toggleMute} 
            className="video-control-btn"
            title={isMuted ? "Activer le son" : "Désactiver le son"}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="video-volume-slider"
            title="Volume"
          />
        </div>
      )}
    </header>
  );
};

export default Header;
