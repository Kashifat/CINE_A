-- =======================================
--  MIGRATION: Correction contrainte réactions
--  Une seule réaction par utilisateur par publication (comportement Facebook)
-- =======================================
USE cinea;
-- Supprimer l'ancienne contrainte
ALTER TABLE publication_reactions DROP INDEX uk_reaction_pub_user_type;
-- Ajouter la nouvelle contrainte (sans le type)
ALTER TABLE publication_reactions
ADD UNIQUE KEY uk_reaction_pub_user (id_publication, id_utilisateur);
-- Vérifier
SHOW INDEX
FROM publication_reactions;