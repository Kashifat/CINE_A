import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexte/AuthContext';
import uploadService from '../services/uploadService';
import './Admin-Modern.css';

const Admin = () => {
  const { estAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Tous les hooks AVANT la protection
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // État pour les films
  const [films, setFilms] = useState([]);
  const [formFilm, setFormFilm] = useState({
    titre: '',
    description: '',
    categorie: '',
    duree: '',
    date_sortie: '',
    pays: '',
    affiche: null,
    bande_annonce: null,
    video_vo: null,
    video_vf: null
  });
  const [editingFilmId, setEditingFilmId] = useState(null);
  const [loadingFilms, setLoadingFilms] = useState(false);

  // État pour les séries
  const [series, setSeries] = useState([]);
  const [formSerie, setFormSerie] = useState({
    titre: '',
    description: '',
    categorie: '',
    pays: '',
    affiche: null,
    bande_annonce: null
  });
  const [saisons, setSaisons] = useState([]);
  const [formSaison, setFormSaison] = useState({
    id_serie: '',
    numero_saison: '',
    titre: '',
    annee: ''
  });
  const [episodes, setEpisodes] = useState([]);
  const [formEpisode, setFormEpisode] = useState({
    id_saison: '',
    numero_episode: '',
    titre: '',
    description: '',
    duree: '',
    video_vo: null,
    video_vf: null,
    bande_annonce: null
  });
  const [contentType, setContentType] = useState('films'); // 'films' ou 'series'
  const [loadingSeries, setLoadingSeries] = useState(false);

  // Modals de modification
  const [showModalModifierFilm, setShowModalModifierFilm] = useState(false);
  const [showModalModifierSerie, setShowModalModifierSerie] = useState(false);
  const [showModalModifierUtilisateur, setShowModalModifierUtilisateur] = useState(false);
  const [formModifierFilm, setFormModifierFilm] = useState(null);
  const [formModifierSerie, setFormModifierSerie] = useState(null);
  const [formModifierUtilisateur, setFormModifierUtilisateur] = useState(null);
  
  // État pour les utilisateurs
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // État pour les paiements
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // État pour les publications
  const [publications, setPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(false);
  
  // État pour les catégories
  const [categories, setCategories] = useState([]);
  
  // État général
  const [message, setMessage] = useState({ type: '', text: '' });

  // Charger catégories et données au montage
  useEffect(() => {
    if (estAdmin()) {
      chargerCategories();
      chargerFilms();
      chargerUtilisateurs();
      chargerPaiements();
    }
  }, [estAdmin]);
  
  // Protection (APRÈS les hooks)
  if (!estAdmin()) {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h2>Accès refusé</h2>
          <p>Vous n'avez pas les permissions pour accéder à cette page</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const chargerCategories = async () => {
    try {
      const response = await fetch('http://localhost:5002/contenus/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const chargerFilms = async () => {
    setLoadingFilms(true);
    try {
      const response = await fetch('http://localhost:5002/contenus/films');
      if (response.ok) {
        const data = await response.json();
        setFilms(data.films || []);
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors du chargement des films');
    } finally {
      setLoadingFilms(false);
    }
  };

  const chargerUtilisateurs = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('http://localhost:5001/utilisateurs', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.utilisateurs || []);
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoadingUsers(false);
    }
  };

  const chargerPaiements = async () => {
    setLoadingPayments(true);
    try {
      const response = await fetch('http://localhost:5003/paiements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data.paiements || []);
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors du chargement des paiements');
    } finally {
      setLoadingPayments(false);
    }
  };

  const chargerPublications = async () => {
    setLoadingPublications(true);
    try {
      const response = await fetch('http://localhost:5004/admin/publications/non-validees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPublications(data || []);
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors du chargement des publications');
    } finally {
      setLoadingPublications(false);
    }
  };

  const validerPublication = async (id) => {
    try {
      const response = await fetch(`http://localhost:5004/admin/publications/${id}/valider`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        afficherMessage('success', 'Publication validée');
        chargerPublications();
      } else {
        afficherMessage('error', 'Erreur lors de la validation');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de la validation');
    }
  };

  const supprimerPublication = async (id) => {
    if (!window.confirm('Supprimer cette publication ?')) return;
    try {
      const response = await fetch(`http://localhost:5004/admin/publications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        afficherMessage('success', 'Publication supprimée');
        chargerPublications();
      } else {
        afficherMessage('error', 'Erreur lors de la suppression');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de la suppression');
    }
  };

  const afficherMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const gererChangementFilm = (e) => {
    const { name, value } = e.target;
    setFormFilm({ ...formFilm, [name]: value });
  };

  const gererSelectionVideo = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormFilm({ ...formFilm, [type]: file });
    }
  };

  const gererSelectionFichierFilm = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormFilm({ ...formFilm, [type]: file });
    }
  };

  // Fonctions pour Séries
  const gererChangementSerie = (e) => {
    const { name, value } = e.target;
    setFormSerie({ ...formSerie, [name]: value });
  };

  const gererSelectionFichierSerie = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormSerie({ ...formSerie, [type]: file });
    }
  };

  const gererChangementSaison = (e) => {
    const { name, value } = e.target;
    setFormSaison({ ...formSaison, [name]: value });
  };

  const gererChangementEpisode = (e) => {
    const { name, value } = e.target;
    setFormEpisode({ ...formEpisode, [name]: value });
  };

  const gererSelectionFichierEpisode = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormEpisode({ ...formEpisode, [type]: file });
    }
  };

  const ajouterFilm = async (e) => {
    e.preventDefault();
    
    if (!formFilm.titre || !formFilm.categorie) {
      afficherMessage('error', 'Titre et catégorie obligatoires');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('titre', formFilm.titre);
      formData.append('description', formFilm.description);
      formData.append('id_categorie', formFilm.categorie);
      formData.append('duree', formFilm.duree || '120');
      formData.append('date_sortie', formFilm.date_sortie || new Date().toISOString().split('T')[0]);
      formData.append('pays', formFilm.pays || '');
      
      if (formFilm.video_vo) {
        formData.append('video_vo', formFilm.video_vo);
      }
      if (formFilm.video_vf) {
        formData.append('video_vf', formFilm.video_vf);
      }
      if (formFilm.affiche) {
        formData.append('affiche', formFilm.affiche);
      }
      if (formFilm.bande_annonce) {
        formData.append('bande_annonce', formFilm.bande_annonce);
      }

      const response = await fetch('http://localhost:5002/contenus/films', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        afficherMessage('success', 'Film ajouté avec succès');
        setFormFilm({
          titre: '',
          description: '',
          categorie: '',
          duree: '',
          date_sortie: '',
          pays: '',
          affiche: null,
          bande_annonce: null,
          video_vo: null,
          video_vf: null
        });
        chargerFilms();
      } else {
        afficherMessage('error', 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de l\'ajout du film');
    }
  };

  const ajouterSerie = async (e) => {
    e.preventDefault();
    
    if (!formSerie.titre || !formSerie.categorie) {
      afficherMessage('error', 'Titre et catégorie obligatoires pour la série');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('titre', formSerie.titre);
      formData.append('description', formSerie.description);
      formData.append('id_categorie', formSerie.categorie);
      formData.append('pays', formSerie.pays || '');
      
      if (formSerie.affiche) {
        formData.append('affiche', formSerie.affiche);
      }
      if (formSerie.bande_annonce) {
        formData.append('bande_annonce', formSerie.bande_annonce);
      }

      const response = await fetch('http://localhost:5002/contenus/series', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        afficherMessage('success', 'Série ajoutée avec succès');
        setFormSerie({
          titre: '',
          description: '',
          categorie: '',
          pays: '',
          affiche: null,
          bande_annonce: null
        });
        chargerSeries();
      } else {
        afficherMessage('error', 'Erreur lors de l\'ajout de la série');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de l\'ajout de la série');
    }
  };

  const ajouterSaison = async (e) => {
    e.preventDefault();
    
    if (!formSaison.id_serie || !formSaison.numero_saison) {
      afficherMessage('error', 'Série et numéro de saison obligatoires');
      return;
    }

    try {
      const response = await fetch('http://localhost:5002/contenus/saisons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_serie: formSaison.id_serie,
          numero_saison: formSaison.numero_saison,
          titre: formSaison.titre,
          annee: formSaison.annee
        })
      });

      if (response.ok) {
        afficherMessage('success', 'Saison ajoutée avec succès');
        setFormSaison({ id_serie: '', numero_saison: '', titre: '', annee: '' });
        chargerSaisons(formSaison.id_serie);
      } else {
        afficherMessage('error', 'Erreur lors de l\'ajout de la saison');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de l\'ajout de la saison');
    }
  };

  const ajouterEpisode = async (e) => {
    e.preventDefault();
    
    if (!formEpisode.id_saison || !formEpisode.numero_episode || !formEpisode.titre) {
      afficherMessage('error', 'Saison, numéro et titre d\'épisode obligatoires');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('id_saison', formEpisode.id_saison);
      formData.append('numero_episode', formEpisode.numero_episode);
      formData.append('titre', formEpisode.titre);
      formData.append('description', formEpisode.description);
      formData.append('duree', formEpisode.duree || '45');
      
      if (formEpisode.video_vo) {
        formData.append('video_vo', formEpisode.video_vo);
      }
      if (formEpisode.video_vf) {
        formData.append('video_vf', formEpisode.video_vf);
      }
      if (formEpisode.bande_annonce) {
        formData.append('bande_annonce', formEpisode.bande_annonce);
      }

      const response = await fetch('http://localhost:5002/contenus/episodes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        afficherMessage('success', 'Épisode ajouté avec succès');
        setFormEpisode({
          id_saison: '',
          numero_episode: '',
          titre: '',
          description: '',
          duree: '',
          video_vo: null,
          video_vf: null,
          bande_annonce: null
        });
        chargerEpisodes(formEpisode.id_saison);
      } else {
        afficherMessage('error', 'Erreur lors de l\'ajout de l\'épisode');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de l\'ajout de l\'épisode');
    }
  };

  const chargerSeries = async () => {
    setLoadingSeries(true);
    try {
      const response = await fetch('http://localhost:5002/contenus/series');
      if (response.ok) {
        const data = await response.json();
        setSeries(data.series || []);
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors du chargement des séries');
    } finally {
      setLoadingSeries(false);
    }
  };

  const chargerSaisons = async (id_serie) => {
    try {
      const response = await fetch(`http://localhost:5002/contenus/series/${id_serie}/saisons`);
      if (response.ok) {
        const data = await response.json();
        setSaisons(data.saisons || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const chargerEpisodes = async (id_saison) => {
    try {
      const response = await fetch(`http://localhost:5002/contenus/saisons/${id_saison}/episodes`);
      if (response.ok) {
        const data = await response.json();
        setEpisodes(data.episodes || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const supprimerSerie = async (serieId) => {
    if (!window.confirm('Supprimer cette série et tous ses contenus ?')) return;

    try {
      const response = await fetch(`http://localhost:5002/contenus/series/${serieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        afficherMessage('success', 'Série supprimée');
        chargerSeries();
      } else {
        afficherMessage('error', 'Erreur lors de la suppression');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de la suppression');
    }
  };

  const supprimerFilm = async (filmId) => {
    if (!window.confirm('Supprimer ce film ?')) return;

    try {
      const response = await fetch(`http://localhost:5002/contenus/films/${filmId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        afficherMessage('success', 'Film supprimé');
        chargerFilms();
      } else {
        afficherMessage('error', 'Erreur lors de la suppression');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de la suppression');
    }
  };

  const supprimerUtilisateur = async (userId) => {
    if (!window.confirm('Supprimer cet utilisateur et toutes ses données ?')) return;

    try {
      const response = await fetch(`http://localhost:5001/utilisateurs/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        afficherMessage('success', 'Utilisateur supprimé');
        chargerUtilisateurs();
      } else {
        afficherMessage('error', 'Erreur lors de la suppression');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de la suppression');
    }
  };

  // Fonctions de modification
  const ouvrirModalModifierFilm = (film) => {
    setFormModifierFilm({
      id_film: film.id_film,
      titre: film.titre || '',
      description: film.description || '',
      categorie: film.id_categorie || '',
      duree: film.duree || '',
      date_sortie: film.date_sortie || '',
      pays: film.pays || ''
    });
    setShowModalModifierFilm(true);
  };

  const modifierFilm = async (e) => {
    e.preventDefault();
    if (!formModifierFilm || !formModifierFilm.titre) {
      afficherMessage('error', 'Titre obligatoire');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5002/contenus/films/${formModifierFilm.id_film}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titre: formModifierFilm.titre,
          description: formModifierFilm.description,
          id_categorie: formModifierFilm.categorie,
          duree: formModifierFilm.duree,
          date_sortie: formModifierFilm.date_sortie,
          pays: formModifierFilm.pays
        })
      });

      if (response.ok) {
        afficherMessage('success', 'Film modifié avec succès');
        setShowModalModifierFilm(false);
        chargerFilms();
      } else {
        afficherMessage('error', 'Erreur lors de la modification');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de la modification');
    }
  };

  const ouvrirModalModifierSerie = (serie) => {
    setFormModifierSerie({
      id_serie: serie.id_serie,
      titre: serie.titre || '',
      description: serie.description || '',
      categorie: serie.id_categorie || '',
      pays: serie.pays || ''
    });
    setShowModalModifierSerie(true);
  };

  const modifierSerie = async (e) => {
    e.preventDefault();
    if (!formModifierSerie || !formModifierSerie.titre) {
      afficherMessage('error', 'Titre obligatoire');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5002/contenus/series/${formModifierSerie.id_serie}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          titre: formModifierSerie.titre,
          description: formModifierSerie.description,
          id_categorie: formModifierSerie.categorie,
          pays: formModifierSerie.pays
        })
      });

      if (response.ok) {
        afficherMessage('success', 'Série modifiée avec succès');
        setShowModalModifierSerie(false);
        chargerSeries();
      } else {
        afficherMessage('error', 'Erreur lors de la modification');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de la modification');
    }
  };

  const ouvrirModalModifierUtilisateur = (user) => {
    setFormModifierUtilisateur({
      id_utilisateur: user.id_utilisateur,
      nom: user.nom || '',
      courriel: user.courriel || ''
    });
    setShowModalModifierUtilisateur(true);
  };

  const modifierUtilisateur = async (e) => {
    e.preventDefault();
    if (!formModifierUtilisateur || !formModifierUtilisateur.nom) {
      afficherMessage('error', 'Nom obligatoire');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/utilisateurs/${formModifierUtilisateur.id_utilisateur}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nom: formModifierUtilisateur.nom,
          courriel: formModifierUtilisateur.courriel
        })
      });

      if (response.ok) {
        afficherMessage('success', 'Utilisateur modifié avec succès');
        setShowModalModifierUtilisateur(false);
        chargerUtilisateurs();
      } else {
        afficherMessage('error', 'Erreur lors de la modification');
      }
    } catch (error) {
      afficherMessage('error', 'Erreur lors de la modification');
    }
  };

  const filtrerUtilisateurs = users.filter(u =>
    u.nom.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.courriel.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Tableau de Bord Administration</h1>
        <p className="admin-subtitle">Gérez films, séries, utilisateurs et paiements</p>
      </div>

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Onglets */}
      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setActiveTab('dashboard'); }}
        >
          Tableau de Bord
        </button>
        <button
          className={`tab ${activeTab === 'films' ? 'active' : ''}`}
          onClick={() => { setActiveTab('films'); chargerFilms(); }}
        >
          Films & Séries
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => { setActiveTab('users'); chargerUtilisateurs(); }}
        >
          Utilisateurs
        </button>
        <button
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => { setActiveTab('payments'); chargerPaiements(); }}
        >
          Paiements
        </button>
        <button
          className={`tab ${activeTab === 'publications' ? 'active' : ''}`}
          onClick={() => { setActiveTab('publications'); chargerPublications(); }}
        >
          Publications
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="admin-content">

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="tab-content">
            <h2 className="section-header-modern">Vue d'ensemble des statistiques</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-value">{users.length}</div>
                  <div className="stat-label">Utilisateurs</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎬</div>
                <div className="stat-info">
                  <div className="stat-value">{films.length + series.length}</div>
                  <div className="stat-label">Films & Séries</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💳</div>
                <div className="stat-info">
                  <div className="stat-value">{payments.length}</div>
                  <div className="stat-label">Paiements</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📰</div>
                <div className="stat-info">
                  <div className="stat-value">{publications.length}</div>
                  <div className="stat-label">Publications en attente</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Films & Séries */}
        {activeTab === 'films' && (
          <div className="tab-content">
            <h2>Gestion des Films & Séries</h2>
            
            {/* Onglets Films/Séries */}
            <div className="content-type-tabs">
              <button
                className={`type-tab ${contentType === 'films' ? 'active' : ''}`}
                onClick={() => { setContentType('films'); chargerFilms(); }}
              >
                🎥 Films
              </button>
              <button
                className={`type-tab ${contentType === 'series' ? 'active' : ''}`}
                onClick={() => { setContentType('series'); chargerSeries(); }}
              >
                📺 Séries
              </button>
            </div>

            {/* FORMULAIRE FILMS */}
            {contentType === 'films' && (
              <>
                <div className="admin-form">
                  <h3 className="section-title">Ajouter un nouveau film</h3>
                  <form onSubmit={ajouterFilm}>
                    <div className="form-section">
                      <h4 className="section-title">Informations générales</h4>
                      <div className="form-grid">
                        <div className="form-group-modern full-width">
                          <label>
                            <span className="label-text">Titre du film</span>
                            <span className="label-required">*</span>
                          </label>
                          <input
                            type="text"
                            name="titre"
                            value={formFilm.titre}
                            onChange={gererChangementFilm}
                            required
                            className="input-modern"
                            placeholder="Entrez le titre du film"
                          />
                        </div>
                        <div className="form-group-modern">
                          <label>
                            <span className="label-text">Catégorie</span>
                            <span className="label-required">*</span>
                          </label>
                          <select
                            name="categorie"
                            value={formFilm.categorie}
                            onChange={gererChangementFilm}
                            required
                            className="input-modern"
                          >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map(cat => (
                              <option key={cat.id_categorie} value={cat.id_categorie}>
                                {cat.nom}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group-modern">
                          <label>
                            <span className="label-text">Durée (minutes)</span>
                          </label>
                          <input
                            type="number"
                            name="duree"
                            value={formFilm.duree}
                            onChange={gererChangementFilm}
                            className="input-modern"
                            placeholder="120"
                          />
                        </div>
                        <div className="form-group-modern">
                          <label>
                            <span className="label-text">Date de sortie</span>
                          </label>
                          <input
                            type="date"
                            name="date_sortie"
                            value={formFilm.date_sortie}
                            onChange={gererChangementFilm}
                            className="input-modern"
                          />
                        </div>
                        <div className="form-group-modern">
                          <label>
                            <span className="label-text">Pays</span>
                          </label>
                          <input
                            type="text"
                            name="pays"
                            value={formFilm.pays}
                            onChange={gererChangementFilm}
                            className="input-modern"
                            placeholder="ex: France"
                          />
                        </div>
                      </div>
                      <div className="form-group-modern full-width">
                        <label>
                          <span className="label-text">Description</span>
                        </label>
                        <textarea
                          name="description"
                          value={formFilm.description}
                          onChange={gererChangementFilm}
                          rows="4"
                          className="input-modern"
                          placeholder="Décrivez le film..."
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <h4 className="section-title">Fichiers médias</h4>
                      <div className="form-grid">
                        <div className="form-group-modern">
                          <label className="file-input-label">
                            <span className="label-text">Affiche (Image)</span>
                            <div className="file-input-wrapper">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => gererSelectionFichierFilm(e, 'affiche')}
                              />
                              <div className="file-input-placeholder">
                                <span>📁 Cliquez pour sélectionner</span>
                              </div>
                            </div>
                          </label>
                        </div>
                        <div className="form-group-modern">
                          <label className="file-input-label">
                            <span className="label-text">Bande Annonce (Vidéo)</span>
                            <div className="file-input-wrapper">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => gererSelectionFichierFilm(e, 'bande_annonce')}
                              />
                              <div className="file-input-placeholder">
                                <span>📁 Cliquez pour sélectionner</span>
                              </div>
                            </div>
                          </label>
                        </div>
                        <div className="form-group-modern full-width">
                          <label className="file-input-label">
                            <span className="label-text">Vidéo VO (Version Originale)</span>
                            <div className="file-input-wrapper">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => gererSelectionFichierFilm(e, 'video_vo')}
                              />
                              <div className="file-input-placeholder">
                                <span>📁 Cliquez pour sélectionner</span>
                              </div>
                            </div>
                          </label>
                        </div>
                        <div className="form-group-modern full-width">
                          <label className="file-input-label">
                            <span className="label-text">Vidéo VF (Version Française)</span>
                            <div className="file-input-wrapper">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => gererSelectionFichierFilm(e, 'video_vf')}
                              />
                              <div className="file-input-placeholder">
                                <span>📁 Cliquez pour sélectionner</span>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-actions-modern">
                      <button type="submit" className="btn btn-success-modern">
                        ✓ Ajouter le film
                      </button>
                      <button type="reset" className="btn btn-secondary-modern">
                        ↻ Réinitialiser
                      </button>
                    </div>
                  </form>
                </div>

                {/* Liste films */}
                <div className="admin-list">
                  <h3 className="section-title">Films existants</h3>
                  {loadingFilms ? (
                    <div className="loading-spinner"></div>
                  ) : films.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🎬</div>
                      <p>Aucun film n'a été ajouté pour le moment</p>
                    </div>
                  ) : (
                    <div className="content-grid-modern">
                      {films.map(film => (
                        <div key={film.id_film} className="content-card-modern">
                          <div className="card-image">
                            <img src={film.affiche || '/placeholder.jpg'} alt={film.titre} />
                            <div className="overlay-actions">
                              <button 
                                className="btn-icon-action"
                                onClick={() => ouvrirModalModifierFilm(film)}
                                title="Modifier"
                              >
                                ✎
                              </button>
                              <button
                                className="btn-icon-action btn-delete"
                                onClick={() => supprimerFilm(film.id_film)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <div className="card-content">
                            <h4 className="card-title">{film.titre}</h4>
                            <p className="card-description">{film.description?.substring(0, 80)}...</p>
                            <div className="card-meta">
                              <span className="badge">{film.categorie || 'Sans catégorie'}</span>
                              <span className="badge">{film.duree} min</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* FORMULAIRE SÉRIES */}
            {contentType === 'series' && (
              <>
                <div className="admin-form">
                  <h3 className="section-title">Ajouter une nouvelle série</h3>
                  <form onSubmit={ajouterSerie}>
                    <div className="form-section">
                      <h4 className="section-title">Informations générales</h4>
                      <div className="form-grid">
                        <div className="form-group-modern full-width">
                          <label>
                            <span className="label-text">Titre de la série</span>
                            <span className="label-required">*</span>
                          </label>
                          <input
                            type="text"
                            name="titre"
                            value={formSerie.titre}
                            onChange={gererChangementSerie}
                            required
                            className="input-modern"
                            placeholder="Entrez le titre de la série"
                          />
                        </div>
                        <div className="form-group-modern">
                          <label>
                            <span className="label-text">Catégorie</span>
                            <span className="label-required">*</span>
                          </label>
                          <select
                            name="categorie"
                            value={formSerie.categorie}
                            onChange={gererChangementSerie}
                            required
                            className="input-modern"
                          >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map(cat => (
                              <option key={cat.id_categorie} value={cat.id_categorie}>
                                {cat.nom}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group-modern">
                          <label>
                            <span className="label-text">Pays</span>
                          </label>
                          <input
                            type="text"
                            name="pays"
                            value={formSerie.pays}
                            onChange={gererChangementSerie}
                            className="input-modern"
                            placeholder="ex: France"
                          />
                        </div>
                      </div>
                      <div className="form-group-modern full-width">
                        <label>
                          <span className="label-text">Description</span>
                        </label>
                        <textarea
                          name="description"
                          value={formSerie.description}
                          onChange={gererChangementSerie}
                          rows="4"
                          className="input-modern"
                          placeholder="Décrivez la série..."
                        />
                      </div>
                    </div>

                    <div className="form-section">
                      <h4 className="section-title">Fichiers médias</h4>
                      <div className="form-grid">
                        <div className="form-group-modern full-width">
                          <label className="file-input-label">
                            <span className="label-text">Affiche (Image)</span>
                            <div className="file-input-wrapper">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => gererSelectionFichierSerie(e, 'affiche')}
                              />
                              <div className="file-input-placeholder">
                                <span>📁 Cliquez pour sélectionner</span>
                              </div>
                            </div>
                          </label>
                        </div>
                        <div className="form-group-modern full-width">
                          <label className="file-input-label">
                            <span className="label-text">Bande Annonce (Vidéo)</span>
                            <div className="file-input-wrapper">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => gererSelectionFichierSerie(e, 'bande_annonce')}
                              />
                              <div className="file-input-placeholder">
                                <span>📁 Cliquez pour sélectionner</span>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-actions-modern">
                      <button type="submit" className="btn btn-success-modern">
                        ✓ Ajouter la série
                      </button>
                      <button type="reset" className="btn btn-secondary-modern">
                        ↻ Réinitialiser
                      </button>
                    </div>
                  </form>
                </div>

                {/* Gestion Saisons et Épisodes */}
                <div className="admin-form">
                  <h3 className="section-title">Ajouter une saison</h3>
                  <form onSubmit={ajouterSaison}>
                    <div className="form-grid">
                      <div className="form-group-modern">
                        <label>
                          <span className="label-text">Série</span>
                          <span className="label-required">*</span>
                        </label>
                        <select
                          name="id_serie"
                          value={formSaison.id_serie}
                          onChange={gererChangementSaison}
                          required
                          className="input-modern"
                        >
                          <option value="">Sélectionner une série</option>
                          {series.map(s => (
                            <option key={s.id_serie} value={s.id_serie}>
                              {s.titre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group-modern">
                        <label>
                          <span className="label-text">Numéro de saison</span>
                          <span className="label-required">*</span>
                        </label>
                        <input
                          type="number"
                          name="numero_saison"
                          value={formSaison.numero_saison}
                          onChange={gererChangementSaison}
                          required
                          className="input-modern"
                        />
                      </div>
                      <div className="form-group-modern">
                        <label>
                          <span className="label-text">Titre de la saison</span>
                        </label>
                        <input
                          type="text"
                          name="titre"
                          value={formSaison.titre}
                          onChange={gererChangementSaison}
                          className="input-modern"
                          placeholder="Titre optionnel"
                        />
                      </div>
                      <div className="form-group-modern">
                        <label>
                          <span className="label-text">Année</span>
                        </label>
                        <input
                          type="text"
                          name="annee"
                          value={formSaison.annee}
                          onChange={gererChangementSaison}
                          className="input-modern"
                          placeholder="ex: 2024"
                        />
                      </div>
                    </div>
                    <div className="form-actions-modern">
                      <button type="submit" className="btn btn-success-modern">
                        ✓ Ajouter la saison
                      </button>
                    </div>
                  </form>
                </div>

                {/* Gestion Épisodes */}
                <div className="admin-form">
                  <h3 className="section-title">Ajouter un épisode</h3>
                  <form onSubmit={ajouterEpisode}>
                    <div className="form-grid">
                      <div className="form-group-modern">
                        <label>
                          <span className="label-text">Saison</span>
                          <span className="label-required">*</span>
                        </label>
                        <select
                          name="id_saison"
                          value={formEpisode.id_saison}
                          onChange={gererChangementEpisode}
                          required
                          className="input-modern"
                        >
                          <option value="">Sélectionner une saison</option>
                          {saisons.map(s => (
                            <option key={s.id_saison} value={s.id_saison}>
                              Saison {s.numero_saison} - {s.titre || 'Sans titre'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group-modern">
                        <label>
                          <span className="label-text">Numéro d'épisode</span>
                          <span className="label-required">*</span>
                        </label>
                        <input
                          type="number"
                          name="numero_episode"
                          value={formEpisode.numero_episode}
                          onChange={gererChangementEpisode}
                          required
                          className="input-modern"
                        />
                      </div>
                      <div className="form-group-modern">
                        <label>
                          <span className="label-text">Titre de l'épisode</span>
                          <span className="label-required">*</span>
                        </label>
                        <input
                          type="text"
                          name="titre"
                          value={formEpisode.titre}
                          onChange={gererChangementEpisode}
                          required
                          className="input-modern"
                          placeholder="Titre de l'épisode"
                        />
                      </div>
                      <div className="form-group-modern">
                        <label>
                          <span className="label-text">Durée (minutes)</span>
                        </label>
                        <input
                          type="number"
                          name="duree"
                          value={formEpisode.duree}
                          onChange={gererChangementEpisode}
                          className="input-modern"
                          placeholder="45"
                        />
                      </div>
                    </div>

                    <div className="form-group-modern full-width">
                      <label>
                        <span className="label-text">Description</span>
                      </label>
                      <textarea
                        name="description"
                        value={formEpisode.description}
                        onChange={gererChangementEpisode}
                        rows="3"
                        className="input-modern"
                        placeholder="Décrivez l'épisode..."
                      />
                    </div>

                    <div className="form-grid">
                      <div className="form-group-modern full-width">
                        <label className="file-input-label">
                          <span className="label-text">Vidéo VO (Version Originale)</span>
                          <div className="file-input-wrapper">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => gererSelectionFichierEpisode(e, 'video_vo')}
                            />
                            <div className="file-input-placeholder">
                              <span>📁 Cliquez pour sélectionner</span>
                            </div>
                          </div>
                        </label>
                      </div>
                      <div className="form-group-modern full-width">
                        <label className="file-input-label">
                          <span className="label-text">Vidéo VF (Version Française)</span>
                          <div className="file-input-wrapper">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => gererSelectionFichierEpisode(e, 'video_vf')}
                            />
                            <div className="file-input-placeholder">
                              <span>📁 Cliquez pour sélectionner</span>
                            </div>
                          </div>
                        </label>
                      </div>
                      <div className="form-group-modern full-width">
                        <label className="file-input-label">
                          <span className="label-text">Bande Annonce (Vidéo)</span>
                          <div className="file-input-wrapper">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => gererSelectionFichierEpisode(e, 'bande_annonce')}
                            />
                            <div className="file-input-placeholder">
                              <span>📁 Cliquez pour sélectionner</span>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="form-actions-modern">
                      <button type="submit" className="btn btn-success-modern">
                        ✓ Ajouter l'épisode
                      </button>
                    </div>
                  </form>
                </div>

                {/* Liste séries */}
                <div className="admin-list">
                  <h3 className="section-title">Séries existantes</h3>
                  {loadingSeries ? (
                    <div className="loading-spinner"></div>
                  ) : series.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📺</div>
                      <p>Aucune série n'a été ajoutée pour le moment</p>
                    </div>
                  ) : (
                    <div className="content-grid-modern">
                      {series.map(serie => (
                        <div key={serie.id_serie} className="content-card-modern">
                          <div className="card-image">
                            <img src={serie.affiche || '/placeholder.jpg'} alt={serie.titre} />
                            <div className="overlay-actions">
                              <button 
                                className="btn-icon-action"
                                onClick={() => ouvrirModalModifierSerie(serie)}
                                title="Modifier"
                              >
                                ✎
                              </button>
                              <button
                                className="btn-icon-action btn-delete"
                                onClick={() => supprimerSerie(serie.id_serie)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                          <div className="card-content">
                            <h4 className="card-title">{serie.titre}</h4>
                            <p className="card-description">{serie.description?.substring(0, 80)}...</p>
                            <div className="card-meta">
                              <span className="badge">{serie.categorie || 'Sans catégorie'}</span>
                              <span className="badge">{serie.pays || 'Pays'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Utilisateurs */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <h2 className="section-header-modern">Gestion des Utilisateurs</h2>
            
            <div className="search-bar-modern">
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>

            {loadingUsers ? (
              <div className="loading-spinner"></div>
            ) : filtrerUtilisateurs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👥</div>
                <p>Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="table-container-modern">
                <table className="data-table-modern">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Inscription</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrerUtilisateurs.map(user => (
                      <tr key={user.id_utilisateur}>
                        <td>
                          <div className="user-avatar">{user.nom.charAt(0).toUpperCase()}</div>
                          {user.nom}
                        </td>
                        <td>{user.courriel}</td>
                        <td>{new Date(user.date_inscription).toLocaleDateString('fr-FR')}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon-small"
                              onClick={() => ouvrirModalModifierUtilisateur(user)}
                              title="Modifier"
                            >
                              ✎
                            </button>
                            <button
                              className="btn-icon-small btn-delete"
                              onClick={() => supprimerUtilisateur(user.id_utilisateur)}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Paiements */}
        {activeTab === 'payments' && (
          <div className="tab-content">
            <h2 className="section-header-modern">Gestion des Paiements</h2>
            
            {loadingPayments ? (
              <div className="loading-spinner"></div>
            ) : payments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <p>Aucun paiement trouvé</p>
              </div>
            ) : (
              <div className="table-container-modern">
                <table className="data-table-modern">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Utilisateur</th>
                      <th>Montant</th>
                      <th>Méthode</th>
                      <th>Statut</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment.id_paiement}>
                        <td><span className="id-badge">#{payment.id_paiement}</span></td>
                        <td>{payment.id_utilisateur}</td>
                        <td><span className="amount-badge">${payment.montant}</span></td>
                        <td>{payment.methode}</td>
                        <td>
                          <span className={`status-badge status-${payment.statut.toLowerCase()}`}>
                            {payment.statut}
                          </span>
                        </td>
                        <td>{new Date(payment.date_paiement).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Publications */}
        {activeTab === 'publications' && (
          <div className="tab-content">
            <h2 className="section-header-modern">Modération des Publications</h2>
            {loadingPublications ? (
              <div className="loading-spinner"></div>
            ) : publications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📰</div>
                <p>Aucune publication en attente de modération</p>
              </div>
            ) : (
              <div className="publications-grid-modern">
                {publications.map(pub => (
                  <div key={pub.id_publication} className="publication-card-modern">
                    <div className="publication-header">
                      <div className="publication-meta">
                        <h4 className="publication-id">Publication #{pub.id_publication}</h4>
                        <span className="publication-author">{pub.auteur || 'Auteur inconnu'}</span>
                        <span className="publication-date">{new Date(pub.date_ajout).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                    {pub.image && (
                      <div className="publication-image">
                        <img src={pub.image} alt="Publication" />
                      </div>
                    )}
                    <p className="publication-content">{pub.contenu}</p>
                    <div className="pub-actions-modern">
                      <button className="btn btn-approve" onClick={() => validerPublication(pub.id_publication)}>✓ Valider</button>
                      <button className="btn btn-reject" onClick={() => supprimerPublication(pub.id_publication)}>✕ Rejeter</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL: Modifier Film */}
      {showModalModifierFilm && formModifierFilm && (
        <div className="modal-overlay" onClick={() => setShowModalModifierFilm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier le film</h3>
              <button className="modal-close" onClick={() => setShowModalModifierFilm(false)}>✕</button>
            </div>
            <form onSubmit={modifierFilm} className="modal-form">
              <div className="form-grid">
                <div className="form-group-modern full-width">
                  <label>
                    <span className="label-text">Titre</span>
                    <span className="label-required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formModifierFilm.titre}
                    onChange={(e) => setFormModifierFilm({ ...formModifierFilm, titre: e.target.value })}
                    required
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>
                    <span className="label-text">Catégorie</span>
                    <span className="label-required">*</span>
                  </label>
                  <select
                    value={formModifierFilm.categorie}
                    onChange={(e) => setFormModifierFilm({ ...formModifierFilm, categorie: e.target.value })}
                    className="input-modern"
                  >
                    <option value="">Sélectionner</option>
                    {categories.map(cat => (
                      <option key={cat.id_categorie} value={cat.id_categorie}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>
                    <span className="label-text">Durée (min)</span>
                  </label>
                  <input
                    type="number"
                    value={formModifierFilm.duree}
                    onChange={(e) => setFormModifierFilm({ ...formModifierFilm, duree: e.target.value })}
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>
                    <span className="label-text">Date de sortie</span>
                  </label>
                  <input
                    type="date"
                    value={formModifierFilm.date_sortie}
                    onChange={(e) => setFormModifierFilm({ ...formModifierFilm, date_sortie: e.target.value })}
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>
                    <span className="label-text">Pays</span>
                  </label>
                  <input
                    type="text"
                    value={formModifierFilm.pays}
                    onChange={(e) => setFormModifierFilm({ ...formModifierFilm, pays: e.target.value })}
                    className="input-modern"
                  />
                </div>
              </div>
              <div className="form-group-modern full-width">
                <label>
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={formModifierFilm.description}
                  onChange={(e) => setFormModifierFilm({ ...formModifierFilm, description: e.target.value })}
                  rows="4"
                  className="input-modern"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-success-modern">✓ Enregistrer</button>
                <button type="button" className="btn btn-secondary-modern" onClick={() => setShowModalModifierFilm(false)}>✕ Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Modifier Série */}
      {showModalModifierSerie && formModifierSerie && (
        <div className="modal-overlay" onClick={() => setShowModalModifierSerie(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier la série</h3>
              <button className="modal-close" onClick={() => setShowModalModifierSerie(false)}>✕</button>
            </div>
            <form onSubmit={modifierSerie} className="modal-form">
              <div className="form-grid">
                <div className="form-group-modern full-width">
                  <label>
                    <span className="label-text">Titre</span>
                    <span className="label-required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formModifierSerie.titre}
                    onChange={(e) => setFormModifierSerie({ ...formModifierSerie, titre: e.target.value })}
                    required
                    className="input-modern"
                  />
                </div>
                <div className="form-group-modern">
                  <label>
                    <span className="label-text">Catégorie</span>
                    <span className="label-required">*</span>
                  </label>
                  <select
                    value={formModifierSerie.categorie}
                    onChange={(e) => setFormModifierSerie({ ...formModifierSerie, categorie: e.target.value })}
                    className="input-modern"
                  >
                    <option value="">Sélectionner</option>
                    {categories.map(cat => (
                      <option key={cat.id_categorie} value={cat.id_categorie}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group-modern">
                  <label>
                    <span className="label-text">Pays</span>
                  </label>
                  <input
                    type="text"
                    value={formModifierSerie.pays}
                    onChange={(e) => setFormModifierSerie({ ...formModifierSerie, pays: e.target.value })}
                    className="input-modern"
                  />
                </div>
              </div>
              <div className="form-group-modern full-width">
                <label>
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={formModifierSerie.description}
                  onChange={(e) => setFormModifierSerie({ ...formModifierSerie, description: e.target.value })}
                  rows="4"
                  className="input-modern"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-success-modern">✓ Enregistrer</button>
                <button type="button" className="btn btn-secondary-modern" onClick={() => setShowModalModifierSerie(false)}>✕ Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Modifier Utilisateur */}
      {showModalModifierUtilisateur && formModifierUtilisateur && (
        <div className="modal-overlay" onClick={() => setShowModalModifierUtilisateur(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier l'utilisateur</h3>
              <button className="modal-close" onClick={() => setShowModalModifierUtilisateur(false)}>✕</button>
            </div>
            <form onSubmit={modifierUtilisateur} className="modal-form">
              <div className="form-group-modern">
                <label>
                  <span className="label-text">Nom</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="text"
                  value={formModifierUtilisateur.nom}
                  onChange={(e) => setFormModifierUtilisateur({ ...formModifierUtilisateur, nom: e.target.value })}
                  required
                  className="input-modern"
                />
              </div>
              <div className="form-group-modern">
                <label>
                  <span className="label-text">Email</span>
                  <span className="label-required">*</span>
                </label>
                <input
                  type="email"
                  value={formModifierUtilisateur.courriel}
                  onChange={(e) => setFormModifierUtilisateur({ ...formModifierUtilisateur, courriel: e.target.value })}
                  required
                  className="input-modern"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-success-modern">✓ Enregistrer</button>
                <button type="button" className="btn btn-secondary-modern" onClick={() => setShowModalModifierUtilisateur(false)}>✕ Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
