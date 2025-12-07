import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import filmsService from '../services/filmsService';
import historiqueService from '../services/historiqueService';
import avisService from '../services/avisService';
import LecteurVideo from '../composants/LecteurVideo';
import './Lecture.css';

const Lecture = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { estConnecte, utilisateur } = useAuth();
  const [film, setFilm] = useState(null);
  const [historiqueId, setHistoriqueId] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [avis, setAvis] = useState([]);
  const [monAvis, setMonAvis] = useState(null);
  const [nouvelleNote, setNouvelleNote] = useState(0);
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [afficherFormAvis, setAfficherFormAvis] = useState(false);
  const [versionActive, setVersionActive] = useState('vo'); // 'vo' ou 'vf'

  useEffect(() => {
    if (!estConnecte()) {
      navigate('/connexion');
      return;
    }
    chargerFilm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const chargerFilm = async () => {
    setChargement(true);
    const result = await filmsService.obtenirFilmParId(id);
    
    if (result.succes) {
      console.log("📽️ Film chargé:", result.data);
      console.log("   lien_vo:", result.data.lien_vo);
      console.log("   lien_vf:", result.data.lien_vf);
      setFilm(result.data);
      
      // Créer un historique pour ce visionnage
      // Gérer les deux cas : utilisateur normal (id_utilisateur) et admin (id_admin)
      const idUtilisateur = utilisateur?.id_utilisateur || utilisateur?.id_admin;
      console.log("👤 ID Utilisateur:", idUtilisateur, "Utilisateur:", utilisateur);
      
      const resultHistorique = await historiqueService.ajouterHistorique(id, null, idUtilisateur);
      if (resultHistorique.succes) {
        setHistoriqueId(resultHistorique.data.id_historique);
      }
      
      // Charger les avis du film
      chargerAvis();
      chargerMonAvis();
    }
    
    setChargement(false);
  };

  const chargerAvis = async () => {
    const result = await avisService.obtenirAvisFilm(id);
    if (result.succes) {
      setAvis(result.data);
    }
  };

  const chargerMonAvis = async () => {
    if (utilisateur) {
      const result = await avisService.obtenirAvisUtilisateur(utilisateur.id_utilisateur);
      if (result.succes) {
        const avisFilm = result.data.find(a => a.id_film === parseInt(id));
        if (avisFilm) {
          setMonAvis(avisFilm);
          setNouvelleNote(avisFilm.note);
          setNouveauCommentaire(avisFilm.commentaire || '');
        }
      }
    }
  };

  const soumettreAvis = async (e) => {
    e.preventDefault();
    
    if (monAvis) {
      // Modifier l'avis existant
      const result = await avisService.modifierAvis(
        monAvis.id_avis,
        { note: nouvelleNote, commentaire: nouveauCommentaire }
      );
      if (result.succes) {
        chargerAvis();
        chargerMonAvis();
        setAfficherFormAvis(false);
      }
    } else {
      // Créer un nouvel avis
      const result = await avisService.ajouterAvisFilm(
        id,
        nouvelleNote,
        nouveauCommentaire
      );
      if (result.succes) {
        chargerAvis();
        chargerMonAvis();
        setAfficherFormAvis(false);
      }
    }
  };

  const supprimerMonAvis = async () => {
    if (monAvis && window.confirm('Supprimer votre avis ?')) {
      const result = await avisService.supprimerAvis(monAvis.id_avis);
      if (result.succes) {
        setMonAvis(null);
        setNouvelleNote(0);
        setNouveauCommentaire('');
        chargerAvis();
      }
    }
  };

  const handleProgressUpdate = async (position) => {
    if (historiqueId) {
      await historiqueService.mettreAJourPosition(historiqueId, position);
    }
  };

  if (chargement) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="page-container">
        <div className="error-message">
          <h2>Film introuvable</h2>
          <button onClick={() => navigate('/films')} className="btn-primary">
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lecture-page">
      <div className="lecteur-container">
        {/* Sélecteur de version VO/VF */}
        {film.lien_vo && film.lien_vf && (
          <div className="version-selector" style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <button
              className={`btn-version ${versionActive === 'vo' ? 'active' : ''}`}
              onClick={() => setVersionActive('vo')}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '0.5rem',
                backgroundColor: versionActive === 'vo' ? '#00d4ff' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🌍 Version Originale
            </button>
            <button
              className={`btn-version ${versionActive === 'vf' ? 'active' : ''}`}
              onClick={() => setVersionActive('vf')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: versionActive === 'vf' ? '#00d4ff' : '#333',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              🇫🇷 Version Française
            </button>
          </div>
        )}
        
        <LecteurVideo 
          videoUrl={
            versionActive === 'vo' 
              ? (film.lien_vo || film.lien_vf || 'https://www.w3schools.com/html/mov_bbb.mp4')
              : (film.lien_vf || film.lien_vo || 'https://www.w3schools.com/html/mov_bbb.mp4')
          } 
          onProgressUpdate={handleProgressUpdate}
        />
      </div>

      <div className="page-container">
        <div className="film-info">
          <h1 className="film-titre">{film.titre}</h1>
          
          <div className="film-meta">
            <span className="film-note">⭐ {film.note || 'N/A'}</span>
            <span className="film-duree">⏱️ {film.duree}</span>
            <span className="film-genre">🎭 {film.genre}</span>
            <span className="film-annee">📅 {film.annee_sortie}</span>
          </div>

          <p className="film-description">{film.description}</p>

          {film.acteurs && (
            <div className="film-section">
              <h3>Acteurs</h3>
              <p>{film.acteurs}</p>
            </div>
          )}

          {film.realisateur && (
            <div className="film-section">
              <h3>Réalisateur</h3>
              <p>{film.realisateur}</p>
            </div>
          )}

          {/* Section Avis */}
          <div className="film-section avis-section">
            <div className="avis-header">
              <h3>Avis ({avis.length})</h3>
              <button 
                onClick={() => setAfficherFormAvis(!afficherFormAvis)} 
                className="btn-primary"
              >
                {monAvis ? 'Modifier mon avis' : 'Laisser un avis'}
              </button>
            </div>

            {afficherFormAvis && (
              <form onSubmit={soumettreAvis} className="form-avis">
                <div className="form-group">
                  <label>Note :</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(note => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => setNouvelleNote(note)}
                        className={nouvelleNote >= note ? 'star active' : 'star'}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Commentaire :</label>
                  <textarea
                    value={nouveauCommentaire}
                    onChange={(e) => setNouveauCommentaire(e.target.value)}
                    placeholder="Partagez votre avis..."
                    rows="4"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={nouvelleNote === 0}>
                    {monAvis ? 'Modifier' : 'Publier'}
                  </button>
                  {monAvis && (
                    <button 
                      type="button" 
                      onClick={supprimerMonAvis} 
                      className="btn-danger"
                    >
                      Supprimer
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => setAfficherFormAvis(false)} 
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            <div className="liste-avis">
              {avis.map((avisSingle) => (
                <div key={avisSingle.id_avis} className="avis-item">
                  <div className="avis-header-item">
                    <div className="avis-user-info">
                      {avisSingle.photo_profil && (
                        <img 
                          src={avisSingle.photo_profil} 
                          alt={avisSingle.nom_utilisateur || avisSingle.nom}
                          className="avis-user-photo"
                        />
                      )}
                      <strong>{avisSingle.nom_utilisateur || avisSingle.nom || 'Utilisateur'}</strong>
                    </div>
                    <span className="avis-note">
                      {'⭐'.repeat(avisSingle.note)}
                    </span>
                  </div>
                  {avisSingle.commentaire && (
                    <p className="avis-commentaire">{avisSingle.commentaire}</p>
                  )}
                  <span className="avis-date">
                    {new Date(avisSingle.date_creation || avisSingle.date_commentaire).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lecture;
