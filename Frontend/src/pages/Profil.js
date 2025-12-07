import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import authService from '../services/authService';
import historiqueService from '../services/historiqueService';
import paiementService from '../services/paiementService';
import publicationService from '../services/publicationService';
import PhotoUpload from '../composants/PhotoUpload';
import './Profil.css';

const Profil = () => {
  const { utilisateur, estConnecte, deconnexion, setUtilisateur } = useAuth();
  const navigate = useNavigate();
  const [ongletActif, setOngletActif] = useState('infos');
  const [donneesProfil, setDonneesProfil] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [publications, setPublications] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [erreur, setErreur] = useState('');
  const [messageSucces, setMessageSucces] = useState('');
  const [formEdition, setFormEdition] = useState({
    nom: '',
    courriel: '',
    mot_de_passe: '',
    confirmation_mot_de_passe: ''
  });

  useEffect(() => {
    if (!estConnecte()) {
      navigate('/connexion');
      return;
    }
    chargerDonnees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ongletActif]);

  const chargerDonnees = async () => {
    setChargement(true);
    setErreur('');

    // Toujours charger les données de profil
    if (!donneesProfil && utilisateur?.id_utilisateur) {
      try {
        const response = await authService.obtenirProfil(utilisateur.id_utilisateur);
        if (response.data) {
          setDonneesProfil(response.data);
          setFormEdition({
            nom: response.data.nom || '',
            courriel: response.data.courriel || '',
            mot_de_passe: '',
            confirmation_mot_de_passe: ''
          });
        }
      } catch (error) {
        setErreur('Erreur lors du chargement du profil');
      }
    }

    // Charger les données spécifiques à l'onglet
    if (ongletActif === 'historique') {
      const result = await historiqueService.obtenirHistorique(utilisateur.id_utilisateur);
      if (result.succes) {
        setHistorique(result.data);
      }
    } else if (ongletActif === 'paiements') {
      const result = await paiementService.obtenirPaiements(utilisateur.id_utilisateur);
      if (result.succes) {
        setPaiements(result.data);
      }
    } else if (ongletActif === 'publications') {
      const result = await publicationService.obtenirPublicationsUtilisateur(utilisateur.id_utilisateur);
      if (result.succes) {
        setPublications(result.data);
      }
    }

    setChargement(false);
  };

  const gererPhotoUpdate = (nouvellePhoto) => {
    // Mettre à jour le contexte
    const utilisateurMaj = { ...utilisateur, photo_profil: nouvellePhoto };
    setUtilisateur(utilisateurMaj);
    localStorage.setItem('utilisateur', JSON.stringify(utilisateurMaj));

    // Mettre à jour les données du profil
    if (donneesProfil) {
      setDonneesProfil({ ...donneesProfil, photo_profil: nouvellePhoto });
    }
  };

  const gererChangementForm = (e) => {
    setFormEdition({
      ...formEdition,
      [e.target.name]: e.target.value
    });
  };

  const gererSoumissionProfil = async (e) => {
    e.preventDefault();
    setErreur('');
    setMessageSucces('');

    // Validation
    if (formEdition.mot_de_passe && formEdition.mot_de_passe !== formEdition.confirmation_mot_de_passe) {
      setErreur('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const donneesModif = {
        nom: formEdition.nom,
        courriel: formEdition.courriel
      };

      if (formEdition.mot_de_passe) {
        donneesModif.mot_de_passe = formEdition.mot_de_passe;
      }

      const response = await authService.modifierProfil(utilisateur.id_utilisateur, donneesModif);
      
      if (response.data) {
        setMessageSucces('Profil mis à jour avec succès');
        setModeEdition(false);
        
        // Mettre à jour le contexte si nom ou email changé
        const utilisateurMaj = {
          ...utilisateur,
          nom: donneesModif.nom,
          courriel: donneesModif.courriel
        };
        setUtilisateur(utilisateurMaj);
        localStorage.setItem('utilisateur', JSON.stringify(utilisateurMaj));
        
        setDonneesProfil(response.data);
      }
    } catch (error) {
      setErreur('Erreur lors de la mise à jour du profil');
    }
  };

  const supprimerPublication = async (idPublication) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      try {
        const response = await publicationService.supprimerPublication(idPublication);
        if (response.succes) {
          setPublications(publications.filter(p => p.id_publication !== idPublication));
          setMessageSucces('Publication supprimée avec succès');
        } else {
          setErreur('Erreur lors de la suppression de la publication');
        }
      } catch (error) {
        setErreur('Erreur lors de la suppression');
      }
    }
  };

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/connexion');
  };

  const photoProfilUrl = donneesProfil?.photo_profil || utilisateur?.photo_profil;

  return (
    <div className="page-container profil-page">
      <h1 className="section-title">👤 Mon Profil</h1>

      <div className="profil-header">
        <div className="profil-avatar">
          {photoProfilUrl ? (
            <img src={photoProfilUrl} alt={utilisateur?.nom} />
          ) : (
            <span>👤</span>
          )}
        </div>
        <div className="profil-info">
          <h2>{utilisateur?.nom}</h2>
          <p>{utilisateur?.courriel}</p>
        </div>
        <button onClick={handleDeconnexion} className="btn-deconnexion">
          Déconnexion
        </button>
      </div>

      <div className="profil-onglets">
        <button
          onClick={() => setOngletActif('infos')}
          className={`onglet ${ongletActif === 'infos' ? 'active' : ''}`}
        >
          📋 Informations
        </button>
        <button
          onClick={() => setOngletActif('historique')}
          className={`onglet ${ongletActif === 'historique' ? 'active' : ''}`}
        >
          📺 Historique
        </button>
        <button
          onClick={() => setOngletActif('paiements')}
          className={`onglet ${ongletActif === 'paiements' ? 'active' : ''}`}
        >
          💳 Paiements
        </button>
        <button
          onClick={() => setOngletActif('publications')}
          className={`onglet ${ongletActif === 'publications' ? 'active' : ''}`}
        >
          📰 Publications
        </button>
      </div>

      <div className="profil-contenu">
        {ongletActif === 'infos' && (
          <div className="infos-section">
            {erreur && <div className="message message-error">{erreur}</div>}
            {messageSucces && <div className="message message-success">{messageSucces}</div>}

            {/* Section Photo de Profil */}
            <div className="profil-photo-section">
              <h3>📸 Photo de Profil</h3>
              <PhotoUpload 
                userId={utilisateur?.id_utilisateur}
                currentPhoto={photoProfilUrl}
                onPhotoUpdate={gererPhotoUpdate}
              />
            </div>

            {/* Section Infos - Affichage ou Édition */}
            <div className="profil-edit-section">
              <div className="section-header">
                <h3>Informations personnelles</h3>
                {!modeEdition && (
                  <button 
                    onClick={() => setModeEdition(true)} 
                    className="btn-edit"
                  >
                    ✏️ Modifier
                  </button>
                )}
              </div>

              {!modeEdition ? (
                // Mode affichage
                <div className="profil-infos-display">
                  <div className="info-item">
                    <label>Nom</label>
                    <p>{donneesProfil?.nom || utilisateur?.nom}</p>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <p>{donneesProfil?.courriel || utilisateur?.courriel}</p>
                  </div>
                  <div className="info-item">
                    <label>Membre depuis</label>
                    <p>{donneesProfil?.date_inscription ? new Date(donneesProfil.date_inscription).toLocaleDateString('fr-FR') : 'N/A'}</p>
                  </div>
                </div>
              ) : (
                // Mode édition
                <form onSubmit={gererSoumissionProfil} className="profil-edit-form">
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      name="nom"
                      value={formEdition.nom}
                      onChange={gererChangementForm}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="courriel"
                      value={formEdition.courriel}
                      onChange={gererChangementForm}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Nouveau mot de passe (optionnel)</label>
                    <input
                      type="password"
                      name="mot_de_passe"
                      value={formEdition.mot_de_passe}
                      onChange={gererChangementForm}
                      placeholder="Laisser vide pour ne pas changer"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirmer le mot de passe</label>
                    <input
                      type="password"
                      name="confirmation_mot_de_passe"
                      value={formEdition.confirmation_mot_de_passe}
                      onChange={gererChangementForm}
                      placeholder="Confirmer le mot de passe"
                      className="form-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-save">
                      ✅ Enregistrer
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setModeEdition(false)} 
                      className="btn-cancel"
                    >
                      ❌ Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {ongletActif === 'historique' && (
          <div className="historique-section">
            <h3>Mon historique de visionnage</h3>
            {chargement ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : historique.length > 0 ? (
              <div className="historique-list">
                {historique.map((item) => (
                  <div key={item.id_historique} className="historique-item">
                    <div className="historique-info">
                      <h4>{item.titre}</h4>
                      <p className="historique-date">
                        {new Date(item.date_visionnage).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="historique-type">
                        {item.type === 'film' ? '🎬 Film' : '📺 Épisode'}
                      </p>
                    </div>
                    <div className="historique-progress">
                      <span className="position">Position: {item.position}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">Aucun historique pour le moment</p>
            )}
          </div>
        )}

        {ongletActif === 'paiements' && (
          <div className="paiements-section">
            <h3>Historique des paiements</h3>
            {chargement ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : paiements.length > 0 ? (
              <div className="paiements-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Montant</th>
                      <th>Méthode</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paiements.map((paiement) => (
                      <tr key={paiement.id_paiement}>
                        <td>{new Date(paiement.date_paiement).toLocaleDateString('fr-FR')}</td>
                        <td>{paiement.montant}€</td>
                        <td>{paiement.methode}</td>
                        <td>
                          <span className={`statut-badge ${paiement.statut.toLowerCase().replace(' ', '-')}`}>
                            {paiement.statut}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty-message">Aucun paiement enregistré</p>
            )}
          </div>
        )}

        {ongletActif === 'publications' && (
          <div className="publications-section">
            <h3>Mes Publications</h3>
            {chargement ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : publications.length > 0 ? (
              <div className="publications-list">
                {publications.map((publication) => (
                  <div key={publication.id_publication} className="publication-item">
                    {publication.image && (
                      <img src={publication.image} alt={publication.titre} className="publication-image" />
                    )}
                    <div className="publication-content">
                      <h4 className="publication-titre">{publication.titre}</h4>
                      <p className="publication-description">{publication.contenu}</p>
                      <div className="publication-meta">
                        <span className="publication-date">
                          {new Date(publication.date_creation).toLocaleDateString('fr-FR')}
                        </span>
                        <span className={`publication-statut ${publication.statut ? publication.statut.toLowerCase().replace(' ', '-') : 'pending'}`}>
                          {publication.statut || 'En attente'}
                        </span>
                      </div>
                      <button 
                        className="btn-delete-publication"
                        onClick={() => supprimerPublication(publication.id_publication)}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">Aucune publication pour le moment</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profil;
