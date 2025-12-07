import React, { useState, useEffect } from 'react';
import filmsService from '../services/filmsService';
import CarteVideo from '../composants/CarteVideo';
import './Films.css';

const Films = () => {
  const [films, setFilms] = useState([]);
  const [series, setSeries] = useState([]);
  const [tousLesContenus, setTousLesContenus] = useState([]);
  const [contenutAffiches, setContenuAffiches] = useState([]);
  const [categorieActive, setCategorieActive] = useState('tous');
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);

  const categories = ['tous', 'action', 'comedie', 'drame', 'horreur', 'science-fiction', 'romance'];

  useEffect(() => {
    chargerContenus();
  }, []);

  useEffect(() => {
    filtrerContenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorieActive, recherche, tousLesContenus]);

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
    if (categorieActive !== 'tous') {
      contenusFiltres = contenusFiltres.filter(contenu => 
        (contenu.categorie || contenu.genre)?.toLowerCase().includes(categorieActive)
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
      <h1 className="section-title">🎬 Films & Séries</h1>

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
          🔍 Rechercher
        </button>
      </form>

      {/* Filtres par catégorie */}
      <div className="categories-filter">
        {categories.map((categorie) => (
          <button
            key={categorie}
            onClick={() => setCategorieActive(categorie)}
            className={`btn-categorie ${categorieActive === categorie ? 'active' : ''}`}
          >
            {categorie.charAt(0).toUpperCase() + categorie.slice(1)}
          </button>
        ))}
      </div>

      {/* Résultats */}
      <div className="resultats-info">
        <p>{contenutAffiches.length} résultat{contenutAffiches.length > 1 ? 's' : ''}</p>
      </div>

      {contenutAffiches.length > 0 ? (
        <div className="grid-container">
          {contenutAffiches.map((contenu) => (
            <CarteVideo key={contenu.id_film || contenu.id_serie} film={contenu} />
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
