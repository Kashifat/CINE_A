import React, { useState, useEffect } from 'react';
import './TV.css';

const TV = () => {
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les pays et catégories au démarrage
  useEffect(() => {
    loadCountries();
    loadCategories();
  }, []);

  // Charger les chaînes quand la catégorie ou le pays change
  useEffect(() => {
    loadChannels();
  }, [selectedCategory, selectedCountry]);

  const loadCountries = async () => {
    try {
      const res = await fetch('http://localhost:5011/tv/countries');
      const data = await res.json();
      setCountries(['All', ...data]);
    } catch (error) {
      console.error('Erreur chargement pays:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('http://localhost:5011/tv/categories');
      const data = await res.json();
      setCategories(['All', ...data]);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadChannels = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5011/tv/channels';
      
      // Filtrer par pays si sélectionné
      if (selectedCountry !== 'All' && typeof selectedCountry === 'object') {
        url = `http://localhost:5011/tv/channels/country/${selectedCountry.code}`;
      }
      
      let res = await fetch(url);
      let data = await res.json();
      
      // Filtrer par catégorie en front
      if (selectedCategory !== 'All') {
        data = data.filter(ch => ch.category && ch.category.toLowerCase() === selectedCategory.toLowerCase());
      }
      
      setChannels(data);
    } catch (error) {
      console.error('Erreur chargement chaînes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);
    
    if (!keyword.trim()) {
      loadChannels();
      return;
    }

    try {
      const res = await fetch(`http://localhost:5011/tv/search/${keyword}`);
      const data = await res.json();
      setChannels(data);
    } catch (error) {
      console.error('Erreur recherche:', error);
    }
  };

  const filteredChannels = channels.filter(ch => 
    ch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tv-page">
      <div className="tv-header">
        <h1> Chaînes TV</h1>
        <p>{filteredChannels.length} chaînes disponibles</p>
      </div>

      <div className="tv-controls">
        {/* Recherche */}
        <input
          type="text"
          placeholder="🔍 Chercher une chaîne..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />

        {/* Filtres Pays */}
        <div className="filters-section">
          <h3>Pays</h3>
          <div className="countries">
            {countries.map((country, idx) => {
              const isSelected = selectedCountry === 'All' ? country === 'All' : (typeof country === 'object' ? country.code === selectedCountry.code : false);
              return (
                <button
                  key={idx}
                  className={`country-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCountry(country);
                    setSearchTerm('');
                  }}
                >
                  {typeof country === 'string' ? '📺 Tous' : country.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catégories */}
        <div className="filters-section">
          <h3>Catégories</h3>
          <div className="categories">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchTerm('');
                }}
              >
                {cat === 'All' ? '📺 Tous' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lecteur vidéo */}
      {selectedChannel && (
        <div className="video-player">
          <div className="player-header">
            <h2>▶️ {selectedChannel.name}</h2>
            <button className="close-btn" onClick={() => setSelectedChannel(null)}>✕</button>
          </div>
          <video
            controls
            autoPlay
            className="video"
            key={selectedChannel.url}
          >
            <source src={selectedChannel.url} type="application/x-mpegURL" />
            Votre navigateur ne supporte pas la vidéo.
          </video>
        </div>
      )}

      {/* Liste des chaînes */}
      <div className="channels-grid">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : filteredChannels.length > 0 ? (
          filteredChannels.map(channel => (
            <div
              key={channel.id}
              className="channel-card"
              onClick={() => setSelectedChannel(channel)}
            >
              <div className="channel-logo-container">
                {channel.logo ? (
                  <img 
                    src={channel.logo} 
                    alt={channel.name} 
                    className="channel-logo"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.parentElement.querySelector('.channel-logo-fallback');
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="channel-logo-fallback" style={{ display: channel.logo ? 'none' : 'flex' }}>
                  TV
                </div>
              </div>
              <div className="channel-info">
                <h3>{channel.name}</h3>
                <p className="channel-category">{channel.category}</p>
              </div>
              <button className="play-btn">Regarder</button>
            </div>
          ))
        ) : (
          <div className="no-results">Aucune chaîne trouvée</div>
        )}
      </div>
    </div>
  );
};

export default TV;
