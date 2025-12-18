import React, { useState, useEffect } from 'react';
import categoriesService from '../services/categoriesService';
import './GestionCategories.css';

const GestionCategories = () => {
  const [categories, setCategories] = useState([]);
  const [nouvelleCategorie, setNouvelleCategorie] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [supprimantId, setSupprimantId] = useState(null);

  // Charger les catégories au mount
  useEffect(() => {
    chargerCategories();
  }, []);

  const chargerCategories = async () => {
    setLoading(true);
    const result = await categoriesService.obtenirCategories();
    
    if (result.succes) {
      setCategories(result.data);
      setError('');
    } else {
      setError(result.erreur || 'Erreur lors du chargement');
    }
    setLoading(false);
  };

  const handleAjouterCategorie = async (e) => {
    e.preventDefault();
    
    if (!nouvelleCategorie.trim()) {
      setError('Veuillez entrer un nom de catégorie');
      return;
    }

    setLoading(true);
    const result = await categoriesService.ajouterCategorie(nouvelleCategorie);
    
    if (result.succes) {
      setMessage(`✅ ${result.message}`);
      setNouvelleCategorie('');
      setError('');
      await chargerCategories();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setError(result.erreur || 'Erreur lors de l\'ajout');
      setMessage('');
    }
    setLoading(false);
  };

  const handleSupprimerCategorie = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return;
    }

    setSupprimantId(id);
    const result = await categoriesService.supprimerCategorie(id);
    
    if (result.succes) {
      setMessage(`✅ Catégorie supprimée avec succès`);
      setError('');
      await chargerCategories();
      setTimeout(() => setMessage(''), 3000);
    } else {
      setError(result.erreur || 'Erreur lors de la suppression');
      setMessage('');
    }
    setSupprimantId(null);
  };

  return (
    <div className="gestion-categories-container">
      <h2>🎬 Gestion des Catégories</h2>
      
      {/* Formulaire d'ajout */}
      <form onSubmit={handleAjouterCategorie} className="categories-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Nom de la nouvelle catégorie"
            value={nouvelleCategorie}
            onChange={(e) => setNouvelleCategorie(e.target.value)}
            disabled={loading}
            className="form-input"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? '⏳ Ajout en cours...' : '➕ Ajouter'}
          </button>
        </div>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>

      {/* Liste des catégories */}
      <div className="categories-list">
        <h3>Catégories existantes ({categories.length})</h3>
        
        {loading && categories.length === 0 ? (
          <p className="loading">⏳ Chargement des catégories...</p>
        ) : categories.length === 0 ? (
          <p className="empty">Aucune catégorie pour le moment</p>
        ) : (
          <div className="categories-grid">
            {categories.map((cat) => (
              <div key={cat.id_categorie} className="category-card">
                <span className="category-name">{cat.nom}</span>
                <button
                  onClick={() => handleSupprimerCategorie(cat.id_categorie)}
                  disabled={supprimantId === cat.id_categorie}
                  className="btn-delete"
                  title="Supprimer cette catégorie"
                >
                  {supprimantId === cat.id_categorie ? '⏳' : '🗑️'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionCategories;
