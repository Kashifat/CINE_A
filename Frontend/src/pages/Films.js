import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import filmsService from '../services/filmsService';
import categoriesService from '../services/categoriesService';
import CarteVideo from '../composants/CarteVideo';
import './Films.css';

const Films = () => {
  const [films, setFilms] = useState([]);
  const [series, setSeries] = useState([]);
  const [tousLesContenus, setTousLesContenus] = useState([]);
  const [contenutAffiches, setContenuAffiches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categorieActive, setCategorieActive] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    chargerContenus();
    chargerCategories();
  }, []);

  useEffect(() => {
    filtrerContenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorieActive, recherche, tousLesContenus]);

  const chargerCategories = async () => {
    const result = await categoriesService.obtenirCategories();
    if (result.succes && result.data.length > 0) {
      setCategories(result.data);
    } else {
      console.error('Erreur chargement catégories:', result.erreur);
      // Fallback: garder une liste basique
      const fallback = [
        { id_categorie: 1, nom: 'Action' },
        { id_categorie: 2, nom: 'Drame' },
        { id_categorie: 3, nom: 'Comédie' }
      ];
      setCategories(fallback);
    }
  };

  const chargerContenus = async () => {
    setChargement(true);
    
    // Charger les films
    const resultFilms = await filmsService.obtenirTousLesFilms();
    if (resultFilms.succes) {
      setFilms(resultFilms.data);
    }
    
    // Charger les séries
    const resultSeries = await filmsService.obtenirToutesSeries();
    if (resultSeries.succes) {
      setSeries(resultSeries.data);
    }
    
    // Combiner tous les contenus
    const tousContenus = [
      ...(resultFilms.succes ? resultFilms.data : []),
      ...(resultSeries.succes ? resultSeries.data : [])
    ];
    setTousLesContenus(tousContenus);
    setContenuAffiches(tousContenus);
    
    setChargement(false);
  };

  const filtrerContenus = () => {
    let contenusFiltres = [...tousLesContenus];

    // Filtrer par catégorie
    if (categorieActive && categorieActive !== 'tous') {
      contenusFiltres = contenusFiltres.filter(contenu => 
        (contenu.categorie || '').toLowerCase() === categorieActive.toLowerCase() ||
        (contenu.genre || '').toLowerCase() === categorieActive.toLowerCase()
      );
    }

    // Filtrer par recherche
    if (recherche.trim()) {
      contenusFiltres = contenusFiltres.filter(contenu =>
        contenu.titre?.toLowerCase().includes(recherche.toLowerCase()) ||
        contenu.description?.toLowerCase().includes(recherche.toLowerCase())
      );
    }

    setContenuAffiches(contenusFiltres);
  };

  const handleRecherche = async (e) => {
    e.preventDefault();
    if (recherche.trim()) {
      setChargement(true);
      const result = await filmsService.rechercherContenus(recherche);
      if (result.succes) {
        setContenuAffiches(result.data);
      }
      setChargement(false);
    }
  };

  if (chargement) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container films-page">
      <button onClick={() => navigate('/')} className="btn-retour">← Retour</button>
      <h1 className="section-title"> Films & Séries</h1>

      {/* Barre de recherche */}
      <form onSubmit={handleRecherche} className="search-bar">
        <input
          type="text"
          placeholder="Rechercher un film, une série..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn-search">
           Rechercher
        </button>
      </form>

      {/* Filtres par catégorie */}
      <div className="categories-filter">
        <button
          onClick={() => setCategorieActive('tous')}
          className={`btn-categorie ${categorieActive === 'tous' ? 'active' : ''}`}
        >
          Tous
        </button>
        {categories.map((categorie) => (
          <button
            key={categorie.id_categorie}
            onClick={() => setCategorieActive(categorie.nom)}
            className={`btn-categorie ${categorieActive === categorie.nom ? 'active' : ''}`}
          >
            {categorie.nom}
          </button>
        ))}
      </div>

      {contenutAffiches.length > 0 ? (
        <div className="grid-container">
          {contenutAffiches.map((contenu, index) => (
            <CarteVideo 
              key={`${contenu.type || 'film'}-${contenu.id_film || contenu.id_serie}-${index}`} 
              film={contenu} 
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>Aucun résultat trouvé</p>
          <button onClick={() => { setRecherche(''); setCategorieActive('tous'); }} className="btn-secondary">
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
};

export default Films;
