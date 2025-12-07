import React, { useState } from 'react';
import publicationService from '../services/publicationService';
import uploadService from '../services/uploadService';
import './CreerPublication.css';

const CreerPublication = ({ onPublicationCreee }) => {
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [image, setImage] = useState('');
  const [apercu, setApercu] = useState(null);
  const [fichierSelectionne, setFichierSelectionne] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [message, setMessage] = useState({ texte: '', type: '' });

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
      setMessage({ texte: 'Sélectionnez une image', type: 'error' });
      return;
    }

    setUploadEnCours(true);
    const resultat = await uploadService.uploadImagePublication(fichierSelectionne);
    setUploadEnCours(false);

    if (resultat.succes) {
      setImage(resultat.data.url);
      setMessage({ texte: 'Image uploadée ✅', type: 'success' });
    } else {
      setMessage({ texte: resultat.erreur, type: 'error' });
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
      setMessage({ texte: 'Le contenu est requis', type: 'error' });
      return;
    }

    setChargement(true);
    setMessage({ texte: '', type: '' });

    const utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
    const donnees = {
      id_utilisateur: utilisateur.id_utilisateur || utilisateur.id,
      titre: titre.trim() || null,
      contenu: contenu.trim(),
      image: image || null
    };

    const result = await publicationService.creerPublication(donnees);

    if (result.succes) {
      setMessage({ 
        texte: 'Publication créée ! En attente de modération.', 
        type: 'success' 
      });
      setTitre('');
      setContenu('');
      setImage('');
      setApercu(null);
      setFichierSelectionne(null);
      
      if (onPublicationCreee) {
        onPublicationCreee();
      }
    } else {
      setMessage({ texte: result.erreur, type: 'error' });
    }

    setChargement(false);
  };

  return (
    <div className="creer-publication">
      <h2>Créer une publication</h2>
      
      {message.texte && (
        <div className={`message message-${message.type}`}>
          {message.texte}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Titre (optionnel)"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="form-input"
          />
        </div>

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
