-- =======================================
-- MIGRATION : Ajouter id_serie à favoris
-- Date : 17 décembre 2025
-- =======================================

USE cinea;

-- Étape 1 : Ajouter la colonne id_serie
ALTER TABLE favoris 
ADD COLUMN id_serie INT NULL AFTER id_episode;

-- Étape 2 : Ajouter la contrainte de clé étrangère
ALTER TABLE favoris
ADD CONSTRAINT fk_favori_serie 
FOREIGN KEY (id_serie) REFERENCES series(id_serie) ON DELETE CASCADE;

-- Étape 3 : Ajouter la clé unique pour utilisateur + serie
ALTER TABLE favoris
ADD UNIQUE KEY uk_favori_user_serie (id_utilisateur, id_serie);

-- Étape 4 : Supprimer l'ancienne contrainte CHECK si elle existe (optionnel)
-- Note : MariaDB peut ne pas avoir de CHECK nommé, on l'ignore si erreur
-- ALTER TABLE favoris DROP CONSTRAINT IF EXISTS chk_favori_film_ou_episode;

-- Étape 5 : Ajouter la nouvelle contrainte CHECK (XOR : film OU episode OU serie)
ALTER TABLE favoris
ADD CONSTRAINT chk_favori_film_ou_episode_ou_serie CHECK (
    (id_film IS NOT NULL AND id_episode IS NULL AND id_serie IS NULL)
    OR (id_film IS NULL AND id_episode IS NOT NULL AND id_serie IS NULL)
    OR (id_film IS NULL AND id_episode IS NULL AND id_serie IS NOT NULL)
);

-- Vérification : Afficher la nouvelle structure
DESCRIBE favoris;

-- Message de succès
SELECT 'Migration terminée avec succès ! La colonne id_serie a été ajoutée.' AS Statut;
