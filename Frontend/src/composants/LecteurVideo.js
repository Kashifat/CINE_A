import React, { useState, useRef, useEffect } from 'react';
import './LecteurVideo.css';

// ✅ CONVERTIR "HH:MM:SS" → SECONDES
const timeStringToSeconds = (timeString) => {
  if (!timeString || timeString === '00:00:00') return 0;
  const parts = timeString.split(':');
  const hours = parseInt(parts[0]) || 0;
  const minutes = parseInt(parts[1]) || 0;
  const seconds = parseInt(parts[2]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

// ✅ CONVERTIR SECONDES → "HH:MM:SS"
const secondsToTimeString = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const LecteurVideo = ({ videoUrl, onProgressUpdate, positionInitiale = 0 }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ✅ SAUVEGARDER LA POSITION TOUTES LES 30 SECONDES
  useEffect(() => {
    const interval = setInterval(() => {
      if (onProgressUpdate && videoRef.current) {
        const time = secondsToTimeString(videoRef.current.currentTime);
        console.log(` Position sauvegardée: ${time}`);
        onProgressUpdate(time);
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [onProgressUpdate]);

  // ✅ SAUVEGARDER LA POSITION QUAND L'USER QUITTE LA PAGE
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (onProgressUpdate && videoRef.current) {
        const time = secondsToTimeString(videoRef.current.currentTime);
        console.log(` Position finale sauvegardée: ${time}`);
        onProgressUpdate(time);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [onProgressUpdate]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      
      // ✅ REPRENDRE À LA POSITION SAUVEGARDÉE
      if (positionInitiale > 0) {
        videoRef.current.currentTime = positionInitiale;
        console.log(`▶️ Reprise à: ${secondsToTimeString(positionInitiale)}`);
      }
    }
  };

  const handleProgressClick = (e) => {
    const progressBar = e.currentTarget;
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = progressBar.offsetWidth;
    const newTime = (clickPosition / progressBarWidth) * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  return (
    <div className="lecteur-video">
      <video
       controlsList="nodownload"
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="video-element"
      />
      
      <div className="video-controls">
        <div 
          className="progress-bar" 
          onClick={handleProgressClick}
        >
          <div 
            className="progress-filled" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        <div className="controls-bottom">
          <div className="controls-left">
            <button onClick={togglePlay} className="btn-control">
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={() => skip(-10)} className="btn-control">
              ⏪ 10s
            </button>
            <button onClick={() => skip(10)} className="btn-control">
              10s ⏩
            </button>
            <div className="time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="controls-right">
            <div className="volume-control">
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>
            <button onClick={toggleFullscreen} className="btn-control">
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecteurVideo;
