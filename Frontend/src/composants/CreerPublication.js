import React, { useState } from 'react';
import publicationService from '../services/publicationService';
import uploadService from '../services/uploadService';
import notificationService from '../services/notificationService';
import './CreerPublication.css';

const CreerPublication = ({ onPublicationCreee }) => {
  const [contenu, setContenu] = useState('');
  const [image, setImage] = useState('');
  const [apercu, setApercu] = useState(null);
  const [fichierSelectionne, setFichierSelectionne] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);

  const handleImageChange = async (e) => {
    const fichier = e.target.files?.[0];
    if (!fichier) return;

    setFichierSelectionne(fichier);

    // Créer un aperçu
    const reader = new FileReader();
    reader.onload = (event) => {
      setApercu(event.target.result);
    };
    reader.readAsDataURL(fichier);
  };

  const handleUploadImage = async () => {
    if (!fichierSelectionne) {
      notificationService.showWarning('Sélectionnez une image');
      return;
    }

    setUploadEnCours(true);
    const resultat = await uploadService.uploadImagePublication(fichierSelectionne);
    setUploadEnCours(false);

    if (resultat.succes) {
      setImage(resultat.data.url);
      notificationService.showSuccess('Image uploadée avec succès ! 🖼️');
    } else {
      notificationService.showError(resultat.erreur || 'Erreur lors de l\'upload');
    }
  };

  const handleRemoveImage = () => {
    setImage('');
    setApercu(null);
    setFichierSelectionne(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contenu.trim()) {
      notificationService.showWarning('Le contenu est requis');
      return;
    }

    setChargement(true);

    const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
    const donnees = {
      id_utilisateur: utilisateur.id_utilisateur || utilisateur.id,
      contenu: contenu.trim(),
      image: image || null
    };

    const result = await publicationService.creerPublication(donnees);

    if (result.succes) {
      notificationService.showSuccess('Publication créée avec succès ! 🎉');
      setContenu('');
      setImage('');
      setApercu(null);
      setFichierSelectionne(null);
      
      if (onPublicationCreee) {
        onPublicationCreee();
      }
    } else {
      notificationService.showError(result.erreur || 'Erreur lors de la création');
    }

    setChargement(false);
  };

  return (
    <div className="creer-publication">
      <h2>Créer une publication</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            placeholder="Qu'avez-vous en tête ?"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            className="form-textarea"
            rows="5"
            required
          />
        </div>

        <div className="form-group">
          <label className="label-image">📸 Ajouter une image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-input-file"
          />
          
          {apercu && (
            <div className="apercu-image">
              <img src={apercu} alt="Aperçu" />
              <div className="apercu-actions">
                <button
                  type="button"
                  onClick={handleUploadImage}
                  disabled={uploadEnCours}
                  className="btn-upload"
                >
                  {uploadEnCours ? '⏳ Upload...' : '⬆️ Uploader'}
                </button>
                {image && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn-remove"
                  >
                    ✕ Supprimer
                  </button>
                )}
              </div>
            </div>
          )}
          
          {image && !apercu && (
            <div className="image-confirmee">
              ✅ Image uploadée
              <button
                type="button"
                onClick={handleRemoveImage}
                className="btn-remove-small"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn-publier"
          disabled={chargement}
        >
          {chargement ? 'Publication...' : '📤 Publier'}
        </button>
      </form>
    </div>
  );
};

export default CreerPublication;
