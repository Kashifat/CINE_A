import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import publicationService from '../services/publicationService';
import notificationService from '../services/notificationService';
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
    // ✅ Pas de polling automatique - rafraîchissement uniquement après actions
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
        notificationService.showSuccess('Publication supprimée avec succès 🗑️');
        chargerPublications();
      } else {
        notificationService.showError(result.erreur || 'Erreur lors de la suppression');
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
      <div className="communaute-header-actions">
        <button onClick={() => navigate('/')} className="btn-retour">← Retour</button>
        <h1 className="section-title">👥 Fil d'actualité</h1>
        <button 
          onClick={chargerPublications} 
          className="btn-refresh-feed"
          title="Rafraîchir le fil"
        >
          🔄
        </button>
      </div>

      <div className="communaute-layout">
        {/* Feed principal centré */}
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
      </div>
    </div>
  );
};

export default Communaute;
