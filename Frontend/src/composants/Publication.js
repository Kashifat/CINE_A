import React, { useState, useEffect } from 'react';
import publicationService from '../services/publicationService';
import commentaireService from '../services/commentaireService';
import notificationService from '../services/notificationService';
import './Publication.css';

// ⚙️ Configuration des réactions
const REACTIONS_CONFIG = {
  like:      { emoji: "👍", label: "J'aime" },
  adore:     { emoji: "❤️", label: "J'adore" },
  rigole:    { emoji: "😂", label: "Haha" },
  triste:    { emoji: "😢", label: "Triste" },
  en_colere: { emoji: "😡", label: "En colère" }
};

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
  const [afficherSelecteurReactions, setAfficherSelecteurReactions] = useState(false);
  const [commentaires, setCommentaires] = useState([]);
  const [afficherCommentaires, setAfficherCommentaires] = useState(false);
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [commentaireEnReponse, setCommentaireEnReponse] = useState(null);
  const [modeEdition, setModeEdition] = useState(false);
  const [contenuEdite, setContenuEdite] = useState(publication.contenu || '');
  const [repliesOpen, setRepliesOpen] = useState({});
  
  const utilisateurConnecte = JSON.parse(localStorage.getItem('utilisateur'));
  const estProprietaire = utilisateurConnecte && 
    (utilisateurConnecte.id_utilisateur === publication.id_utilisateur || 
     utilisateurConnecte.id_admin === publication.id_utilisateur);

  const peutGererCommentaire = (comm) => {
    if (!utilisateurConnecte) return false;
    const estAuteur = comm.id_utilisateur === utilisateurConnecte.id_utilisateur;
    const estAdmin = utilisateurConnecte.role === 'admin' || utilisateurConnecte.id_admin;
    return estAuteur || !!estAdmin;
  };

  useEffect(() => {
    chargerReactions();
    chargerReactionUtilisateur();
    if (afficherCommentaires) {
      chargerCommentaires();
    }
    // ✅ Pas de polling automatique - rafraîchissement uniquement après actions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publication.id_publication, afficherCommentaires]);

  // Fermer le sélecteur avec Echap
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setAfficherSelecteurReactions(false);
    };
    if (afficherSelecteurReactions) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [afficherSelecteurReactions]);

  const chargerReactions = async () => {
    const result = await publicationService.obtenirStatistiquesReactions(publication.id_publication);
    if (result.succes) {
      // ✅ Extraire uniquement les types de réactions (exclure id_publication et total)
      const { id_publication, total, ...typesReactions } = result.data;
      setReactions(typesReactions);
    }
  };

  const chargerReactionUtilisateur = async () => {
    const result = await publicationService.verifierReactionUtilisateur(publication.id_publication);
    if (result.succes && result.data?.type) {
      setReactionActive(result.data.type);
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

  const supprimerCommentaire = async (commentaire) => {
    if (!peutGererCommentaire(commentaire)) {
      notificationService.showError('❌ Vous ne pouvez pas supprimer ce commentaire');
      return;
    }

    if (window.confirm('Supprimer ce commentaire ?')) {
      const result = await commentaireService.supprimerCommentaire(commentaire.id_commentaire);
      if (result.succes) {
        notificationService.showSuccess('🗑️ Commentaire supprimé');
        chargerCommentaires();
      } else {
        notificationService.showError(result.erreur || '❌ Erreur lors de la suppression');
      }
    }
  };

  const toggleReplies = (id) => {
    setRepliesOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const afficherCommentairesRecursifs = (commentaires, niveau = 0) => {
    return commentaires.map(comm => (
      <div key={comm.id_commentaire} className={`commentaire niveau-${niveau}`}>
        <div className="commentaire-header">
          {comm.photo_profil && (
            <img 
              src={comm.photo_profil.startsWith('http') ? comm.photo_profil : `http://localhost:5002/media/${comm.photo_profil}`}
              alt={comm.nom_utilisateur}
              className="commentaire-avatar"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div className="commentaire-info">
            <strong>{comm.nom_utilisateur || 'Utilisateur'}</strong>
            <span className="commentaire-date">
              {comm.date_ajout ? new Date(comm.date_ajout).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Date invalide'}
            </span>
          </div>
        </div>
        <p className="commentaire-contenu">{comm.contenu}</p>
        <div className="commentaire-actions">
          <button 
            onClick={() => setCommentaireEnReponse(comm)} 
            className="btn-repondre"
          >
            Répondre
          </button>
          {peutGererCommentaire(comm) && (
            <button 
              onClick={() => supprimerCommentaire(comm)} 
              className="btn-supprimer-comm"
            >
              Supprimer
            </button>
          )}
        </div>
        {comm.reponses && comm.reponses.length > 0 && (
          <>
            <button
              type="button"
              className="btn-toggle-reponses"
              onClick={() => toggleReplies(comm.id_commentaire)}
              aria-expanded={!!repliesOpen[comm.id_commentaire]}
              aria-controls={`replies-${comm.id_commentaire}`}
            >
              <svg
                className={`chevron ${repliesOpen[comm.id_commentaire] ? 'open' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              {repliesOpen[comm.id_commentaire] ? 'Masquer' : 'Afficher'} {comm.reponses.length} réponse{comm.reponses.length > 1 ? 's' : ''}
            </button>
            {repliesOpen[comm.id_commentaire] && (
              <div id={`replies-${comm.id_commentaire}`} className="reponses">
                {afficherCommentairesRecursifs(comm.reponses, niveau + 1)}
              </div>
            )}
          </>
        )}
      </div>
    ));
  };

  const handleReaction = async (type) => {
    // ✅ Au clic sur un emoji : insérer/mettre à jour directement dans la BD
    if (reactionActive === type) {
      // Si on clique sur la même réaction, on la supprime (toggle)
      const result = await publicationService.supprimerReaction(publication.id_publication);
      if (result.succes) {
        setReactionActive(null);
        setAfficherSelecteurReactions(false);
        await chargerReactions();
      }
    } else {
      // Sinon, on ajoute/change la réaction (le backend gère automatiquement l'UPDATE si existe)
      const result = await publicationService.ajouterReaction(publication.id_publication, type);
      if (result.succes) {
        setReactionActive(type);
        setAfficherSelecteurReactions(false);
        await chargerReactions();
        const config = REACTIONS_CONFIG[type];
        if (config) {
          notificationService.showSuccess(`Réaction ajoutée ${config.emoji}`);
        }
      } else {
        notificationService.showError(result.erreur || 'Erreur lors de la réaction');
      }
    }
  };

  const handleModifier = async () => {
    if (!contenuEdite.trim()) {
      notificationService.showWarning('Le contenu ne peut pas être vide');
      return;
    }

    const result = await publicationService.modifierPublication(
      publication.id_publication,
      { contenu: contenuEdite }
    );

    if (result.succes) {
      setModeEdition(false);
      notificationService.showSuccess('Publication modifiée avec succès ✏️');
      if (onUpdate) onUpdate();
    } else {
      notificationService.showError(result.erreur || 'Erreur lors de la modification');
    }
  };

  const annulerEdition = () => {
    setContenuEdite(publication.contenu || '');
    setModeEdition(false);
  };

  // Calculer le total des réactions (uniquement les types, pas id_publication ou total)
  const totalReactions = ['like', 'adore', 'triste', 'rigole', 'surpris', 'en_colere']
    .reduce((sum, type) => sum + (reactions[type] || 0), 0);

  return (
    <div className="publication-carte">
      <div className="publication-header">
        <div className="auteur-info">
          <div className="auteur-avatar">
            {publication.utilisateur_photo ? (
              <img 
                src={publication.utilisateur_photo.startsWith('http') ? publication.utilisateur_photo : `http://localhost:5002/media/${publication.utilisateur_photo}`}
                alt={publication.utilisateur_nom}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div className="auteur-details">
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
        <p className="publication-contenu">{publication.contenu}</p>
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

      {/* 🎯 Barre d'interactions avec sélecteur d'emojis */}
      <div className="interactions-barre">
        <div className="reaction-container">
          <button 
            onClick={() => setAfficherSelecteurReactions((v) => !v)}
            className={`btn-interaction ${reactionActive ? 'active-reaction' : ''}`}
          >
            <span className="interaction-icone">
              {reactionActive && REACTIONS_CONFIG[reactionActive] 
                ? REACTIONS_CONFIG[reactionActive].emoji 
                : "👍"}
            </span>
            <span className="interaction-texte">
              {reactionActive && REACTIONS_CONFIG[reactionActive]
                ? REACTIONS_CONFIG[reactionActive].label
                : "J'aime"}
            </span>
            {totalReactions > 0 && <span className="interaction-count">{totalReactions}</span>}
          </button>
          
          {/* 🎭 Sélecteur d'emojis */}
          {afficherSelecteurReactions && (
            <>
              {/* Backdrop pour cliquer à l'extérieur et fermer */}
              <div className="reaction-backdrop" onClick={() => setAfficherSelecteurReactions(false)} />
              <div 
                className="selecteur-reactions"
              >
              {Object.entries(REACTIONS_CONFIG).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className={`emoji-btn ${reactionActive === type ? 'emoji-active' : ''}`}
                  title={config.label}
                >
                  <span className="emoji-icone">{config.emoji}</span>
                  <span className="emoji-label">{config.label}</span>
                </button>
              ))}
              </div>
            </>
          )}
        </div>
        
        <button 
          onClick={() => setAfficherCommentaires(!afficherCommentaires)}
          className="btn-interaction"
        >
          <span className="interaction-icone">💬</span>
          <span className="interaction-texte">Commenter</span>
          {commentaires.length > 0 && <span className="interaction-count">{commentaires.length}</span>}
        </button>
      </div>

      {/* 📊 Résumé des réactions */}
      {totalReactions > 0 && (
        <div className="reactions-resume">
          {Object.entries(REACTIONS_CONFIG).map(([type, config]) => (
            reactions[type] > 0 && (
              <span key={type} className="reaction-badge" title={`${reactions[type]} ${config.label}`}>
                {config.emoji} {reactions[type]}
              </span>
            )
          ))}
        </div>
      )}

      <div className="commentaires-section">
        {afficherCommentaires && (
          <>
            <form onSubmit={ajouterCommentaire} className="form-commentaire">
              <div className="commentaire-input-wrapper">
                <div className="commentaire-avatar">
                  {utilisateurConnecte?.photo_profil ? (
                    <img src={utilisateurConnecte.photo_profil} alt="Vous" />
                  ) : (
                    <span>👤</span>
                  )}
                </div>
                <input
                  type="text"
                  value={nouveauCommentaire}
                  onChange={(e) => setNouveauCommentaire(e.target.value)}
                  placeholder={commentaireEnReponse ? 'Répondre...' : 'Écrivez un commentaire...'}
                  className="input-commentaire"
                />
                <button type="submit" className="btn-commenter-moderne">
                  ➤
                </button>
              </div>

              {commentaireEnReponse && (
                <div className="reponse-a reponse-a-basse">
                  En réponse à <strong>{commentaireEnReponse.nom_utilisateur}</strong>
                  <button 
                    type="button" 
                    onClick={() => setCommentaireEnReponse(null)}
                    className="btn-annuler-reponse"
                  >
                    ✕
                  </button>
                </div>
              )}
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
