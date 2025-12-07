import React, { useState, useEffect } from 'react';
import publicationService from '../services/publicationService';
import commentaireService from '../services/commentaireService';
import './Publication.css';

const Publication = ({ publication, onDelete, onUpdate }) => {
  const [reactions, setReactions] = useState({
    like: 0,
    adore: 0,
    triste: 0,
    rigole: 0,
    surpris: 0,
    en_colere: 0
  });
  const [reactionActive, setReactionActive] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [afficherCommentaires, setAfficherCommentaires] = useState(false);
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [commentaireEnReponse, setCommentaireEnReponse] = useState(null);
  const [modeEdition, setModeEdition] = useState(false);
  const [contenuEdite, setContenuEdite] = useState(publication.contenu || '');
  
  const utilisateurConnecte = JSON.parse(localStorage.getItem('utilisateur'));
  const estProprietaire = utilisateurConnecte && 
    (utilisateurConnecte.id_utilisateur === publication.id_utilisateur || 
     utilisateurConnecte.id_admin === publication.id_utilisateur);

  useEffect(() => {
    chargerReactions();
    if (afficherCommentaires) {
      chargerCommentaires();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publication.id_publication, afficherCommentaires]);

  const chargerReactions = async () => {
    const result = await publicationService.obtenirStatistiquesReactions(publication.id_publication);
    if (result.succes) {
      setReactions(result.data);
    }
  };

  const chargerCommentaires = async () => {
    const result = await commentaireService.obtenirCommentaires(publication.id_publication);
    if (result.succes) {
      setCommentaires(result.data);
    }
  };

  const ajouterCommentaire = async (e) => {
    e.preventDefault();
    if (!nouveauCommentaire.trim()) return;

    const result = await commentaireService.ajouterCommentaire(
      publication.id_publication,
      nouveauCommentaire,
      commentaireEnReponse?.id_commentaire
    );

    if (result.succes) {
      setNouveauCommentaire('');
      setCommentaireEnReponse(null);
      chargerCommentaires();
    }
  };

  const supprimerCommentaire = async (idCommentaire) => {
    if (window.confirm('Supprimer ce commentaire ?')) {
      const result = await commentaireService.supprimerCommentaire(idCommentaire);
      if (result.succes) {
        chargerCommentaires();
      }
    }
  };

  const afficherCommentairesRecursifs = (commentaires, niveau = 0) => {
    return commentaires.map(comm => (
      <div key={comm.id_commentaire} className={`commentaire niveau-${niveau}`}>
        <div className="commentaire-header">
          <strong>{comm.nom_utilisateur || 'Utilisateur'}</strong>
          <span className="commentaire-date">
            {new Date(comm.date_creation).toLocaleDateString()}
          </span>
        </div>
        <p className="commentaire-contenu">{comm.contenu}</p>
        <div className="commentaire-actions">
          <button 
            onClick={() => setCommentaireEnReponse(comm)} 
            className="btn-repondre"
          >
            Répondre
          </button>
          <button 
            onClick={() => supprimerCommentaire(comm.id_commentaire)} 
            className="btn-supprimer-comm"
          >
            Supprimer
          </button>
        </div>
        {comm.reponses && comm.reponses.length > 0 && (
          <div className="reponses">
            {afficherCommentairesRecursifs(comm.reponses, niveau + 1)}
          </div>
        )}
      </div>
    ));
  };

  const handleReaction = async (type) => {
    const result = await publicationService.ajouterReaction(publication.id_publication, type);
    if (result.succes) {
      setReactionActive(type);
      chargerReactions();
    }
  };

  const handleModifier = async () => {
    if (!contenuEdite.trim()) {
      alert('Le contenu ne peut pas être vide');
      return;
    }

    const result = await publicationService.modifierPublication(
      publication.id_publication,
      { contenu: contenuEdite }
    );

    if (result.succes) {
      setModeEdition(false);
      if (onUpdate) onUpdate();
    } else {
      alert('Erreur lors de la modification');
    }
  };

  const annulerEdition = () => {
    setContenuEdite(publication.contenu || '');
    setModeEdition(false);
  };

  const iconeReaction = {
    like: '❤️',
    adore: '😍',
    triste: '😢',
    rigole: '😂',
    surpris: '😲',
    en_colere: '😡'
  };

  return (
    <div className="publication-carte">
      <div className="publication-header">
        <div className="auteur-info">
          <span className="auteur-avatar">👤</span>
          <div>
            <p className="auteur-nom">{publication.utilisateur_nom || 'Utilisateur'}</p>
            <p className="publication-date">
              {new Date(publication.date_ajout || publication.date_publication).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        {estProprietaire && (
          <div className="publication-actions">
            <button onClick={() => setModeEdition(true)} className="btn-modifier" title="Modifier">
              ✏️
            </button>
            <button onClick={() => onDelete(publication.id_publication)} className="btn-supprimer" title="Supprimer">
              🗑️
            </button>
          </div>
        )}
      </div>

      {modeEdition ? (
        <div className="edition-zone">
          <textarea
            value={contenuEdite}
            onChange={(e) => setContenuEdite(e.target.value)}
            className="textarea-edition"
            rows="4"
          />
          <div className="edition-actions">
            <button onClick={handleModifier} className="btn-sauvegarder">
              ✅ Sauvegarder
            </button>
            <button onClick={annulerEdition} className="btn-annuler">
              ❌ Annuler
            </button>
          </div>
        </div>
      ) : (
        <>
          {publication.titre && (
            <h3 className="publication-titre">{publication.titre}</h3>
          )}
          <p className="publication-contenu">{publication.contenu}</p>
        </>
      )}

      {publication.image && (
        <div className="publication-image-container">
          <img 
            src={publication.image} 
            alt="Publication" 
            className="publication-image"
          />
        </div>
      )}

      <div className="publication-reactions">
        {Object.entries(iconeReaction).map(([type, icone]) => (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            className={`btn-reaction ${reactionActive === type ? 'active' : ''}`}
            title={type}
          >
            <span className="reaction-icone">{icone}</span>
            <span className="reaction-count">{reactions[type] || 0}</span>
          </button>
        ))}
      </div>

      <div className="commentaires-section">
        <button 
          onClick={() => setAfficherCommentaires(!afficherCommentaires)} 
          className="btn-toggle-commentaires"
        >
          💬 {commentaires.length} commentaire{commentaires.length > 1 ? 's' : ''}
        </button>

        {afficherCommentaires && (
          <>
            <form onSubmit={ajouterCommentaire} className="form-commentaire">
              {commentaireEnReponse && (
                <div className="reponse-a">
                  En réponse à {commentaireEnReponse.nom_utilisateur}
                  <button 
                    type="button" 
                    onClick={() => setCommentaireEnReponse(null)}
                    className="btn-annuler-reponse"
                  >
                    ✕
                  </button>
                </div>
              )}
              <textarea
                value={nouveauCommentaire}
                onChange={(e) => setNouveauCommentaire(e.target.value)}
                placeholder={commentaireEnReponse ? 'Répondre...' : 'Ajouter un commentaire...'}
                rows="2"
              />
              <button type="submit" className="btn-commenter">
                Publier
              </button>
            </form>

            <div className="liste-commentaires">
              {afficherCommentairesRecursifs(commentaires)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Publication;
