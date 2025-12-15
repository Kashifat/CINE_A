import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexte/AuthContext';
import authService from '../services/authService';
import PhotoUpload from '../composants/PhotoUpload';
import './Dashboard.css';

function Dashboard() {
  const { utilisateur, setUtilisateur } = useAuth();
  const [donneesProfil, setDonneesProfil] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [modeEdition, setModeEdition] = useState(false);
  const [formEdition, setFormEdition] = useState({
    nom: '',
    courriel: '',
    mot_de_passe: '',
    confirmation_mot_de_passe: ''
  });
  const [messageSucces, setMessageSucces] = useState('');

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    if (!utilisateur?.id_utilisateur) return;

    setChargement(true);
    setErreur('');

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
      setErreur('Erreur lors du chargement du profil');
    } finally {
      setChargement(false);
    }
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

        // Recharger les données
        await chargerDonnees();
      }
    } catch (error) {
      setErreur(error.response?.data?.erreur || 'Erreur lors de la modification');
    }
  };

  const formaterDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formaterMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(montant);
  };

  if (chargement) {
    return (
      <div className="dashboard-container">
        <div className="chargement">
          <div className="spinner-large"></div>
          <p>Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!donneesProfil) {
    return (
      <div className="dashboard-container">
        <div className="erreur-page">
          <h2>Erreur</h2>
          <p>{erreur || 'Impossible de charger le profil'}</p>
          <button onClick={chargerDonnees} className="btn-retry">Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-titre">Mon Tableau de Bord</h1>

      {messageSucces && (
        <div className="message-succes">{messageSucces}</div>
      )}

      {erreur && (
        <div className="message-erreur">{erreur}</div>
      )}

      <div className="dashboard-grid">
        {/* Section Profil */}
        <div className="carte carte-profil">
          <h2>Mon Profil</h2>
          
          <PhotoUpload
            userId={utilisateur.id_utilisateur}
            currentPhoto={donneesProfil.photo_profil}
            onPhotoUpdate={gererPhotoUpdate}
          />

          {!modeEdition ? (
            <div className="info-profil">
              <div className="info-item">
                <span className="label">Nom :</span>
                <span className="valeur">{donneesProfil.nom}</span>
              </div>
              <div className="info-item">
                <span className="label">Email :</span>
                <span className="valeur">{donneesProfil.courriel}</span>
              </div>
              <div className="info-item">
                <span className="label">Membre depuis :</span>
                <span className="valeur">{formaterDate(donneesProfil.date_inscription)}</span>
              </div>
              <button 
                className="btn btn-modifier"
                onClick={() => setModeEdition(true)}
              >
                Modifier le profil
              </button>
            </div>
          ) : (
            <form onSubmit={gererSoumissionProfil} className="form-edition">
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={formEdition.nom}
                  onChange={gererChangementForm}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="courriel"
                  value={formEdition.courriel}
                  onChange={gererChangementForm}
                  required
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
                />
              </div>
              <div className="form-group">
                <label>Confirmer le mot de passe</label>
                <input
                  type="password"
                  name="confirmation_mot_de_passe"
                  value={formEdition.confirmation_mot_de_passe}
                  onChange={gererChangementForm}
                  placeholder="Confirmer le nouveau mot de passe"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-valider">
                  Enregistrer
                </button>
                <button 
                  type="button" 
                  className="btn btn-annuler"
                  onClick={() => setModeEdition(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Section Abonnement */}
        <div className="carte carte-abonnement">
          <h2>Mon Abonnement</h2>
          {donneesProfil.abonnement ? (
            <div className="info-abonnement">
              <div className="statut-badge" data-actif={donneesProfil.abonnement.actif}>
                {donneesProfil.abonnement.actif ? '✓ Actif' : '✕ Inactif'}
              </div>
              <div className="info-item">
                <span className="label">Type :</span>
                <span className="valeur type-premium">{donneesProfil.abonnement.type}</span>
              </div>
              <div className="info-item">
                <span className="label">Début :</span>
                <span className="valeur">{formaterDate(donneesProfil.abonnement.date_debut)}</span>
              </div>
              <div className="info-item">
                <span className="label">Fin :</span>
                <span className="valeur">{formaterDate(donneesProfil.abonnement.date_fin)}</span>
              </div>
            </div>
          ) : (
            <div className="aucun-abonnement">
              <p>Aucun abonnement actif</p>
              <button className="btn btn-souscrire">S'abonner maintenant</button>
            </div>
          )}
        </div>

        {/* Statistiques - Contenu */}
        <div className="carte carte-statistiques">
          <h2>Statistiques de Contenu</h2>
          <div className="stats-grid">
            <div className="stat-item stat-primary">
              <div className="stat-icon">Visionnages</div>
              <div className="stat-valeur">{donneesProfil.total_visionnages || 0}</div>
              <div className="stat-label">Visionnages</div>
            </div>
            <div className="stat-item stat-success">
              <div className="stat-icon">❤️</div>
              <div className="stat-valeur">{donneesProfil.total_favoris || 0}</div>
              <div className="stat-label">Favoris</div>
            </div>
            <div className="stat-item stat-warning">
              <div className="stat-icon">Avis</div>
              <div className="stat-valeur">{donneesProfil.total_avis || 0}</div>
              <div className="stat-label">Avis Donnés</div>
            </div>
          </div>
        </div>

        {/* Statistiques - Social */}
        <div className="carte carte-statistiques">
          <h2>Statistiques Sociales</h2>
          <div className="stats-grid">
            <div className="stat-item stat-info">
              <div className="stat-icon">Publications</div>
              <div className="stat-valeur">{donneesProfil.total_publications || 0}</div>
              <div className="stat-label">Publications</div>
            </div>
            <div className="stat-item stat-like">
              <div className="stat-icon">👍</div>
              <div className="stat-valeur">{donneesProfil.total_likes || 0}</div>
              <div className="stat-label">Likes Reçus</div>
            </div>
            <div className="stat-item stat-comment">
              <div className="stat-icon">Commentaires</div>
              <div className="stat-valeur">{donneesProfil.total_commentaires || 0}</div>
              <div className="stat-label">Commentaires Reçus</div>
            </div>
          </div>
        </div>

        {/* Paiements récents */}
        <div className="carte carte-paiements">
          <h2>Paiements Récents</h2>
          {donneesProfil.paiements_recents && donneesProfil.paiements_recents.length > 0 ? (
            <div className="table-responsive">
              <table className="table-paiements">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Méthode</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {donneesProfil.paiements_recents.map((paiement, index) => (
                    <tr key={index}>
                      <td>{formaterDate(paiement.date_paiement)}</td>
                      <td className="montant">{formaterMontant(paiement.montant)}</td>
                      <td>{paiement.methode}</td>
                      <td>
                        <span className={`badge-statut statut-${paiement.statut.toLowerCase()}`}>
                          {paiement.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="aucune-donnee">Aucun paiement enregistré</p>
          )}
        </div>

        {/* Publications récentes */}
        <div className="carte carte-publications">
          <h2>Mes Publications Récentes</h2>
          {donneesProfil.publications_recentes && donneesProfil.publications_recentes.length > 0 ? (
            <div className="liste-publications">
              {donneesProfil.publications_recentes.map((pub) => (
                <div key={pub.id_publication} className="publication-item">
                  {pub.image && (
                    <img src={pub.image} alt="Publication" className="publication-image" />
                  )}
                  <div className="publication-contenu">
                    <p className="publication-texte">{pub.contenu}</p>
                    <div className="publication-meta">
                      <span className="publication-date">{formaterDate(pub.date_publication)}</span>
                      <div className="publication-stats">
                        <span>❤️ {pub.nb_reactions || 0}</span>
                        <span>Commentaires: {pub.nb_commentaires || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="aucune-donnee">Aucune publication</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
