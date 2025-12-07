import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import publicationService from '../services/publicationService';
import CreerPublication from '../composants/CreerPublication';
import Publication from '../composants/Publication';
import './Communaute.css';

const Communaute = () => {
  const { estConnecte } = useAuth();
  const navigate = useNavigate();
  const [publications, setPublications] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!estConnecte()) {
      navigate('/connexion');
      return;
    }
    chargerPublications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chargerPublications = async () => {
    setChargement(true);
    const result = await publicationService.obtenirPublications();
    if (result.succes) {
      setPublications(result.data);
    }
    setChargement(false);
  };

  const handlePublicationCreee = () => {
    chargerPublications();
  };

  const handleSupprimer = async (id) => {
    if (window.confirm('Supprimer cette publication ?')) {
      const result = await publicationService.supprimerPublication(id);
      if (result.succes) {
        chargerPublications();
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

  return (
    <div className="page-container communaute-page">
      <h1 className="section-title">👥 Communauté</h1>
      <p className="page-description">
        Partagez vos pensées et réagissez aux publications
      </p>

      <div className="communaute-layout">
        {/* Colonne principale */}
        <div className="feed-principal">
          <CreerPublication onPublicationCreee={handlePublicationCreee} />

          {publications.length > 0 ? (
            <div className="publications-list">
              {publications.map((pub) => (
                <Publication
                  key={pub.id_publication}
                  publication={pub}
                  onDelete={handleSupprimer}
                  onUpdate={chargerPublications}
                />
              ))}
            </div>
          ) : (
            <div className="no-publications">
              <p>Aucune publication pour le moment</p>
              <p className="hint">Soyez le premier à publier quelque chose !</p>
            </div>
          )}
        </div>

        {/* Barre latérale */}
        <aside className="sidebar-communaute">
          <div className="sidebar-card">
            <h3>💡 Conseils</h3>
            <ul className="tips-list">
              <li>Soyez respectueux envers les autres</li>
              <li>Partagez vos avis sur les films</li>
              <li>Utilisez les réactions pour interagir</li>
              <li>Vos publications sont modérées</li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h3>📊 Statistiques</h3>
            <div className="stat-item">
              <span className="stat-label">Publications</span>
              <span className="stat-value">{publications.length}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Communaute;
