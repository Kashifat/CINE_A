import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import favorisService from '../services/favorisService';
import { useAuth } from './AuthContext';

const FavorisContext = createContext();

export const useFavoris = () => {
  const context = useContext(FavorisContext);
  if (!context) {
    throw new Error('useFavoris doit être utilisé dans un FavorisProvider');
  }
  return context;
};

export const FavorisProvider = ({ children }) => {
  const { utilisateur } = useAuth();
  const [favoris, setFavoris] = useState(new Set()); // Set d'IDs: "film_123" ou "episode_456"
  const [chargement, setChargement] = useState(true);

  // Charger les favoris au login/logout
  useEffect(() => {
    if (utilisateur?.id_utilisateur) {
      chargerFavoris(utilisateur.id_utilisateur);
    } else {
      setFavoris(new Set());
      setChargement(false);
    }
  }, [utilisateur?.id_utilisateur]);

  const chargerFavoris = useCallback(async (id_utilisateur) => {
    try {
      setChargement(true);
      const result = await favorisService.lister(id_utilisateur);
      if (result.succes && result.data) {
        // Construire un Set d'IDs: "film_123" ou "episode_789"
        const favorisIds = new Set();
        
        // Ajouter les films favoris
        if (result.data.films && Array.isArray(result.data.films)) {
          result.data.films.forEach((film) => {
            if (film.id_film) {
              favorisIds.add(`film_${film.id_film}`);
            }
          });
        }
        
        // Ajouter les épisodes favoris
        if (result.data.episodes && Array.isArray(result.data.episodes)) {
          result.data.episodes.forEach((episode) => {
            if (episode.id_episode) {
              favorisIds.add(`episode_${episode.id_episode}`);
            }
          });
        }
        
        setFavoris(favorisIds);
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error);
    } finally {
      setChargement(false);
    }
  }, []);

  // Vérifier si un film/épisode est favori
  const estFavori = useCallback((id_film = null, id_episode = null) => {
    if (id_film) return favoris.has(`film_${id_film}`);
    if (id_episode) return favoris.has(`episode_${id_episode}`);
    return false;
  }, [favoris]);

  // Ajouter un favori
  const ajouter = useCallback(
    async (id_utilisateur, id_film = null, id_episode = null) => {
      try {
        const payload = {
          id_utilisateur,
          id_film,
          id_episode,
        };
        const result = await favorisService.ajouter(payload);
        
        if (result.succes) {
          // Mettre à jour le contexte immédiatement (optimistic update)
          let key = null;
          if (id_film) key = `film_${id_film}`;
          else if (id_episode) key = `episode_${id_episode}`;
          
          if (key) {
            setFavoris((prev) => new Set([...prev, key]));
          }
          return { succes: true };
        } else {
          return { succes: false, erreur: result.erreur };
        }
      } catch (error) {
        console.error('Erreur ajout favori:', error);
        return { succes: false, erreur: error.message };
      }
    },
    []
  );

  // Retirer un favori
  const retirer = useCallback(
    async (id_utilisateur, id_film = null, id_episode = null) => {
      try {
        const payload = {
          id_utilisateur,
          id_film,
          id_episode,
        };
        const result = await favorisService.retirer(payload);
        
        if (result.succes) {
          // Mettre à jour le contexte immédiatement (optimistic update)
          let key = null;
          if (id_film) key = `film_${id_film}`;
          else if (id_episode) key = `episode_${id_episode}`;
          
          if (key) {
            setFavoris((prev) => {
              const updated = new Set(prev);
              updated.delete(key);
              return updated;
            });
          }
          return { succes: true };
        } else {
          return { succes: false, erreur: result.erreur };
        }
      } catch (error) {
        console.error('Erreur retrait favori:', error);
        return { succes: false, erreur: error.message };
      }
    },
    []
  );

  const value = {
    favoris,
    chargement,
    estFavori,
    ajouter,
    retirer,
    chargerFavoris, // Pour forcer un rechargement si besoin
  };

  return (
    <FavorisContext.Provider value={value}>
      {children}
    </FavorisContext.Provider>
  );
};
