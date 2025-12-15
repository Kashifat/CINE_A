import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import { useFavoris } from '../contexte/FavorisContext';
import authService from '../services/authService';
import historiqueService from '../services/historiqueService';
import paiementService from '../services/paiementService';
import publicationService from '../services/publicationService';
import favorisService from '../services/favorisService';
import notificationService from '../services/notificationService';
import PhotoUpload from '../composants/PhotoUpload';
import CarteVideo from '../composants/CarteVideo';
import './Profil.css';

const Profil = () => {
  const { utilisateur, estConnecte, deconnexion, mettreAJourUtilisateur } = useAuth();
  const { favoris: favorisContext } = useFavoris();
  const navigate = useNavigate();
  const [ongletActif, setOngletActif] = useState('infos');
  const [donneesProfil, setDonneesProfil] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [publications, setPublications] = useState([]);
  const [favoris, setFavoris] = useState({ films: [], episodes: [] });
  const [chargement, setChargement] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
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

  // Recharger les favoris quand le contexte change (après ajout/retrait)
  useEffect(() => {
    if (ongletActif === 'favoris' && utilisateur?.id_utilisateur) {
      chargerFavorisAffichables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favorisContext, ongletActif]);

  const chargerFavorisAffichables = async () => {
    try {
      const res = await favorisService.lister(utilisateur.id_utilisateur);
      if (res.succes) {
        setFavoris(res.data || { films: [], episodes: [] });
      } else {
        setFavoris({ films: [], episodes: [] });
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    }
  };

  const chargerDonnees = async () => {
    setChargement(true);

    // Toujours charger les données de profil
    if (!donneesProfil && utilisateur?.id_utilisateur) {
      try {
        const response = await authService.obtenirProfilComplet(utilisateur.id_utilisateur);
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
        notificationService.showError('Erreur lors du chargement du profil');
      }
    }

    // Charger les données spécifiques à l'onglet
    try {
      if (ongletActif === 'historique') {
        const result = await historiqueService.obtenirHistorique(utilisateur.id_utilisateur);
        if (result.succes && result.data) {
          // Dédupliquer l'historique : garder seulement le dernier visionnage par film/série
          const deduplicatedMap = new Map();
          result.data.forEach(item => {
            // Créer une clé unique basée sur le type et l'ID
            let key;
            if (item.type === 'film' && item.id_film) {
              key = `film-${item.id_film}`;
            } else if (item.type === 'episode' && item.id_serie) {
              key = `serie-${item.id_serie}`;
            } else {
              // Fallback avec id_historique si les IDs ne sont pas disponibles
              key = `historique-${item.id_historique}`;
            }
            
            // Garder seulement si c'est la première occurrence (l'array est déjà trié par date DESC)
            if (!deduplicatedMap.has(key)) {
              deduplicatedMap.set(key, item);
            }
          });
          const deduplicatedHistorique = Array.from(deduplicatedMap.values());
          setHistorique(deduplicatedHistorique);
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
      } else if (ongletActif === 'favoris') {
        // Utiliser la fonction dédiée qui sera appelée aussi quand le contexte change
        chargerFavorisAffichables();
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement des données spécifiques:', error.message);
    }

    setChargement(false);
  };

  const gererPhotoUpdate = (nouvellePhoto) => {
    // Mettre à jour le contexte
    mettreAJourUtilisateur({ photo_profil: nouvellePhoto });

    // Mettre à jour les données du profil
    if (donneesProfil) {
      setDonneesProfil({ ...donneesProfil, photo_profil: nouvellePhoto });
    }

    // Afficher message de confirmation
    notificationService.showSuccess('Photo de profil mise à jour avec succès ✅');
  };

  const gererChangementForm = (e) => {
    setFormEdition({
      ...formEdition,
      [e.target.name]: e.target.value
    });
  };

  const gererSoumissionProfil = async (e) => {
    e.preventDefault();

    // Validation
    if (formEdition.mot_de_passe && formEdition.mot_de_passe !== formEdition.confirmation_mot_de_passe) {
      notificationService.showError('Les mots de passe ne correspondent pas');
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
        notificationService.showSuccess('Profil mis à jour avec succès ✅');
        setModeEdition(false);
        
        // Mettre à jour le contexte si nom ou email changé
        mettreAJourUtilisateur({
          nom: donneesModif.nom,
          courriel: donneesModif.courriel
        });
        
        setDonneesProfil(response.data);
      }
    } catch (error) {
      notificationService.showError('Erreur lors de la mise à jour du profil');
    }
  };

  const supprimerPublication = async (idPublication) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      try {
        const response = await publicationService.supprimerPublication(idPublication);
        if (response.succes) {
          setPublications(publications.filter(p => p.id_publication !== idPublication));
          notificationService.showSuccess('Publication supprimée avec succès');
        } else {
          notificationService.showError('Erreur lors de la suppression de la publication');
        }
      } catch (error) {
        notificationService.showError('Erreur lors de la suppression');
      }
    }
  };

  const handleDeconnexion = () => {
    deconnexion();
    navigate('/connexion');
  };

  const photoProfilUrl = donneesProfil?.photo_profil || utilisateur?.photo_profil;
  const photoProfilSrc = photoProfilUrl 
    ? (photoProfilUrl.startsWith('http') ? photoProfilUrl : `http://localhost:5002/media/${photoProfilUrl}`)
    : null;

  return (
    <div className="page-container profil-page">
      <button onClick={() => navigate('/')} className="btn-retour">← Retour</button>
      <h1 className="section-title">👤 Mon Profil</h1>

      <div className="profil-header">
        <div className="profil-avatar">
          {photoProfilSrc ? (
            <img src={photoProfilSrc} alt={utilisateur?.nom} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          ) : null}
          <span style={{display: photoProfilSrc ? 'none' : 'flex'}}>👤</span>
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
          Informations
        </button>
        <button
          onClick={() => setOngletActif('statistiques')}
          className={`onglet ${ongletActif === 'statistiques' ? 'active' : ''}`}
        >
          Statistiques
        </button>
        <button
          onClick={() => setOngletActif('historique')}
          className={`onglet ${ongletActif === 'historique' ? 'active' : ''}`}
        >
          Historique
        </button>
        <button
          onClick={() => setOngletActif('paiements')}
          className={`onglet ${ongletActif === 'paiements' ? 'active' : ''}`}
        >
          Paiements
        </button>
        <button
          onClick={() => setOngletActif('publications')}
          className={`onglet ${ongletActif === 'publications' ? 'active' : ''}`}
        >
          Publications
        </button>
        <button
          onClick={() => setOngletActif('favoris')}
          className={`onglet ${ongletActif === 'favoris' ? 'active' : ''}`}
        >
          Favoris
        </button>
      </div>

      <div className="profil-contenu">
        {ongletActif === 'infos' && (
          <div className="infos-section">
            {/* Section Photo de Profil */}
            <div className="profil-photo-section">
              <h3>Photo de Profil</h3>
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
                    Modifier
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
                      Enregistrer
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setModeEdition(false)} 
                      className="btn-cancel"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {ongletActif === 'statistiques' && (
          <div className="statistiques-section">
            <h3>Mes Statistiques</h3>
            
            {/* Statistiques de Contenu */}
            <div className="stats-category">
              <h4>Contenu Visionné</h4>
              <div className="stats-grid-profil">
                <div className="stat-card stat-primary">
                  <div className="stat-icon-large">Visionnages</div>
                  <div className="stat-info">
                    <div className="stat-number">{donneesProfil?.total_visionnages || 0}</div>
                    <div className="stat-title">Visionnages</div>
                  </div>
                </div>
                <div className="stat-card stat-success">
                  <div className="stat-icon-large">Favoris</div>
                  <div className="stat-info">
                    <div className="stat-number">{donneesProfil?.total_favoris || 0}</div>
                    <div className="stat-title">Favoris</div>
                  </div>
                </div>
                <div className="stat-card stat-warning">
                  <div className="stat-icon-large">Avis</div>
                  <div className="stat-info">
                    <div className="stat-number">{donneesProfil?.total_avis || 0}</div>
                    <div className="stat-title">Avis Donnés</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques Sociales */}
            <div className="stats-category">
              <h4>Activité Sociale</h4>
              <div className="stats-grid-profil">
                <div className="stat-card stat-info">
                  <div className="stat-icon-large">Publications</div>
                  <div className="stat-info">
                    <div className="stat-number">{donneesProfil?.total_publications || 0}</div>
                    <div className="stat-title">Publications</div>
                  </div>
                </div>
                <div className="stat-card stat-like">
                  <div className="stat-icon-large">👍</div>
                  <div className="stat-info">
                    <div className="stat-number">{donneesProfil?.total_likes || 0}</div>
                    <div className="stat-title">Likes Reçus</div>
                  </div>
                </div>
                <div className="stat-card stat-comment">
                  <div className="stat-icon-large">💬</div>
                  <div className="stat-info">
                    <div className="stat-number">{donneesProfil?.total_commentaires || 0}</div>
                    <div className="stat-title">Commentaires Reçus</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé général */}
            <div className="stats-summary">
              <h4>Résumé</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Total d'activités</span>
                  <span className="summary-value">
                    {(donneesProfil?.total_visionnages || 0) + 
                     (donneesProfil?.total_favoris || 0) + 
                     (donneesProfil?.total_avis || 0) + 
                     (donneesProfil?.total_publications || 0)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Engagement social</span>
                  <span className="summary-value">
                    {(donneesProfil?.total_likes || 0) + (donneesProfil?.total_commentaires || 0)}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Membre depuis</span>
                  <span className="summary-value">
                    {donneesProfil?.date_inscription 
                      ? new Date(donneesProfil.date_inscription).toLocaleDateString('fr-FR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {ongletActif === 'favoris' && (
          <div className="favoris-section">
            <h3>Mes Favoris</h3>
            {chargement ? (
              <div className="loading"><div className="spinner"></div></div>
            ) : (
              <>
                <h4>Films & Séries</h4>
                {favoris.films && favoris.films.length > 0 ? (
                  <div className="grid-films">
                    {favoris.films.map((f) => (
                      <CarteVideo key={`fav-film-${f.id_film}`} film={{ ...f, type: 'Film', est_favori: true }} estFavoriInitial={true} />
                    ))}
                  </div>
                ) : (
                  <p className="empty-message">Aucun favori film pour le moment</p>
                )}

                {favoris.episodes && favoris.episodes.length > 0 && (
                  <div className="favoris-episodes">
                    <h4>Épisodes</h4>
                    <ul>
                      {favoris.episodes.map((ep) => (
                        <li key={`fav-ep-${ep.id_episode}`}>
                          {ep.serie} — S{ep.numero_saison}E{ep.numero_episode} — {ep.titre}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
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
                  <div key={`${item.type}-${item.id_film || item.id_serie}`} className="historique-item">
                    {item.affiche && (
                      <div className="historique-affiche">
                        <img src={item.affiche} alt={item.titre} />
                      </div>
                    )}
                    <div className="historique-info">
                      <h4>{item.titre}</h4>
                      <p className="historique-date">
                        {new Date(item.date_visionnage).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="historique-type">
                        {item.type === 'film' ? 'Film' : 'Épisode'}
                      </p>
                      <p className="historique-position">
                        ⏱️ Position: <strong>{item.position}</strong>
                      </p>
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
                        Supprimer
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
