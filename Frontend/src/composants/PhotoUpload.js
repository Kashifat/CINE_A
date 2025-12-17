import React, { useState, useRef } from 'react';
import uploadService from '../services/uploadService';
import './PhotoUpload.css';

function PhotoUpload({ userId, currentPhoto, onPhotoUpdate }) {
  const [apercu, setApercu] = useState(null);
  const [fichierSelectionne, setFichierSelectionne] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const inputFileRef = useRef(null);

  const gererSelectionFichier = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    const validation = uploadService.validerImage(file);
    if (!validation.valide) {
      setErreur(validation.erreur);
      return;
    }

    setErreur('');
    setFichierSelectionne(file);

    // Créer aperçu
    try {
      const apercuUrl = await uploadService.creerApercu(file);
      setApercu(apercuUrl);
    } catch (error) {
      setErreur('Erreur lors de la prévisualisation');
    }
  };

  const gererUpload = async () => {
    if (!fichierSelectionne) return;

    setChargement(true);
    setErreur('');

    const resultat = await uploadService.uploadPhotoProfil(userId, fichierSelectionne);

    setChargement(false);

    if (resultat.succes) {
      // Réinitialiser
      setFichierSelectionne(null);
      setApercu(null);
      
      // Notifier le parent
      if (onPhotoUpdate) {
        onPhotoUpdate(resultat.data.photo_profil);
      }
    } else {
      setErreur(resultat.erreur);
    }
  };

  const gererSuppression = async () => {
    if (!window.confirm('Supprimer votre photo de profil ?')) return;

    setChargement(true);
    setErreur('');

    const resultat = await uploadService.supprimerPhotoProfil(userId);

    setChargement(false);

    if (resultat.succes) {
      setApercu(null);
      setFichierSelectionne(null);
      
      if (onPhotoUpdate) {
        onPhotoUpdate(null);
      }
    } else {
      setErreur(resultat.erreur);
    }
  };

  const annulerSelection = () => {
    setFichierSelectionne(null);
    setApercu(null);
    setErreur('');
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  const photoAffichee = apercu || currentPhoto || '/images/avatar-defaut.png';

  return (
    <div className="photo-upload">
      <div className="photo-container">
        <img src={photoAffichee} alt="Photo de profil" className="photo-profil" />
        
        {chargement && (
          <div className="overlay-chargement">
            <div className="spinner"></div>
          </div>
        )}
        
        {!chargement && (
          <div className="overlay-actions">
            <button 
              className="btn-action btn-changer"
              onClick={() => inputFileRef.current?.click()}
              title="Changer la photo"
            >
              ✏️
            </button>
            {currentPhoto && !apercu && (
              <button 
                className="btn-action btn-supprimer"
                onClick={gererSuppression}
                title="Supprimer la photo"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      <input
        ref={inputFileRef}
        type="file"
        accept="image/*"
        onChange={gererSelectionFichier}
        style={{ display: 'none' }}
      />

      {fichierSelectionne && (
        <div className="actions-preview">
          <button 
            className="btn btn-valider"
            onClick={gererUpload}
            disabled={chargement}
          >
            ✓ Valider
          </button>
          <button 
            className="btn btn-annuler"
            onClick={annulerSelection}
            disabled={chargement}
          >
            ✕ Annuler
          </button>
        </div>
      )}

      {erreur && <div className="erreur-message">{erreur}</div>}
    </div>
  );
}

export default PhotoUpload;
