-- =======================================
--  BASE DE DONNÉES CINEA - MARIADB
-- =======================================
DROP DATABASE IF EXISTS cinea;
CREATE DATABASE cinea CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cinea;
SET sql_mode = 'STRICT_ALL_TABLES';
-- =======================================
--  TABLE UTILISATEURS
-- =======================================
CREATE TABLE utilisateurs (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    courriel VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    photo_profil VARCHAR(500) NULL COMMENT 'URL ou chemin de la photo de profil',
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE ADMINISTRATEURS
-- =======================================
CREATE TABLE administrateurs (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    courriel VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Modérateur'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE ABONNEMENTS
--  Deux types uniquement : mensuel, annuel
-- =======================================
CREATE TABLE abonnements (
    id_abonnement INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    type ENUM('mensuel', 'annuel') NOT NULL,
    date_debut DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_fin DATETIME NULL,
    actif TINYINT(1) DEFAULT 1,
    CONSTRAINT fk_abonnement_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_abonnement_utilisateur (id_utilisateur)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE CATEGORIES
-- =======================================
CREATE TABLE categories (
    id_categorie INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE SERIES
-- =======================================
CREATE TABLE series (
    id_serie INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    affiche VARCHAR(500),
    bande_annonce VARCHAR(500),
    date_sortie VARCHAR(20),
    pays VARCHAR(100),
    id_categorie INT,
    CONSTRAINT fk_series_categorie FOREIGN KEY (id_categorie) REFERENCES categories(id_categorie) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE SAISONS
-- =======================================
CREATE TABLE saisons (
    id_saison INT AUTO_INCREMENT PRIMARY KEY,
    id_serie INT NOT NULL,
    numero_saison INT NOT NULL,
    titre VARCHAR(255),
    annee VARCHAR(10),
    CONSTRAINT fk_saisons_series FOREIGN KEY (id_serie) REFERENCES series(id_serie) ON DELETE CASCADE,
    UNIQUE KEY uk_saison_serie (id_serie, numero_saison)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE EPISODES
-- =======================================
CREATE TABLE episodes (
    id_episode INT AUTO_INCREMENT PRIMARY KEY,
    id_saison INT NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    lien_vo VARCHAR(500),
    lien_vf VARCHAR(500),
    bande_annonce VARCHAR(500),
    duree VARCHAR(20),
    numero_episode INT,
    CONSTRAINT fk_episodes_saisons FOREIGN KEY (id_saison) REFERENCES saisons(id_saison) ON DELETE CASCADE,
    UNIQUE KEY uk_episode_saison (id_saison, numero_episode)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE FILMS
-- =======================================
CREATE TABLE films (
    id_film INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    id_categorie INT,
    lien_vo VARCHAR(500),
    -- Version originale
    lien_vf VARCHAR(500),
    -- Version française
    bande_annonce VARCHAR(500),
    affiche VARCHAR(500),
    date_sortie VARCHAR(20),
    duree VARCHAR(20),
    pays VARCHAR(100),
    type VARCHAR(20) DEFAULT 'Film',
    -- Film ou autre type si besoin
    popularite INT DEFAULT 0,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_films_categorie FOREIGN KEY (id_categorie) REFERENCES categories(id_categorie) ON DELETE
    SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE AVIS (sur les films)
-- =======================================
CREATE TABLE avis (
    id_avis INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT,
    id_film INT NULL,
    id_episode INT NULL,
    note TINYINT,
    commentaire TEXT,
    date_commentaire DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_note_0_5 CHECK (
        note BETWEEN 0 AND 5
    ),
    CONSTRAINT chk_avis_film_ou_episode CHECK (
        (
            id_film IS NOT NULL
            AND id_episode IS NULL
        )
        OR (
            id_film IS NULL
            AND id_episode IS NOT NULL
        )
    ),
    CONSTRAINT fk_avis_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    CONSTRAINT fk_avis_film FOREIGN KEY (id_film) REFERENCES films(id_film) ON DELETE CASCADE,
    CONSTRAINT fk_avis_episode FOREIGN KEY (id_episode) REFERENCES episodes(id_episode) ON DELETE CASCADE,
    INDEX idx_avis_film (id_film),
    INDEX idx_avis_episode (id_episode)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE HISTORIQUES (visionnage)
-- =======================================
CREATE TABLE historiques (
    id_historique INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT,
    id_film INT NULL,
    id_episode INT NULL,
    position VARCHAR(20) DEFAULT '00:00:00',
    date_visionnage DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_hist_film_ou_episode CHECK (
        (
            id_film IS NOT NULL
            AND id_episode IS NULL
        )
        OR (
            id_film IS NULL
            AND id_episode IS NOT NULL
        )
    ),
    CONSTRAINT fk_hist_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    CONSTRAINT fk_hist_film FOREIGN KEY (id_film) REFERENCES films(id_film) ON DELETE CASCADE,
    CONSTRAINT fk_hist_episode FOREIGN KEY (id_episode) REFERENCES episodes(id_episode) ON DELETE CASCADE,
    INDEX idx_hist_utilisateur (id_utilisateur),
    INDEX idx_hist_film (id_film),
    INDEX idx_hist_episode (id_episode)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE PAIEMENTS
-- =======================================
CREATE TABLE paiements (
    id_paiement INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    montant DECIMAL(10, 2) NOT NULL,
    methode VARCHAR(100),
    -- Mobile Money, Carte bancaire, etc.
    statut VARCHAR(50) DEFAULT 'En attente',
    -- En attente / Réussi / Échoué
    date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_paiement_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_paiement_utilisateur (id_utilisateur),
    INDEX idx_paiement_statut (statut)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE FAVORIS
-- =======================================
CREATE TABLE favoris (
    id_favori INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    id_film INT NULL,
    id_episode INT NULL,
    id_serie INT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_favori_film_ou_episode_ou_serie CHECK (
        (id_film IS NOT NULL AND id_episode IS NULL AND id_serie IS NULL)
        OR (id_film IS NULL AND id_episode IS NOT NULL AND id_serie IS NULL)
        OR (id_film IS NULL AND id_episode IS NULL AND id_serie IS NOT NULL)
    ),
    CONSTRAINT fk_favori_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    CONSTRAINT fk_favori_film FOREIGN KEY (id_film) REFERENCES films(id_film) ON DELETE CASCADE,
    CONSTRAINT fk_favori_episode FOREIGN KEY (id_episode) REFERENCES episodes(id_episode) ON DELETE CASCADE,
    CONSTRAINT fk_favori_serie FOREIGN KEY (id_serie) REFERENCES series(id_serie) ON DELETE CASCADE,
    UNIQUE KEY uk_favori_user_film (id_utilisateur, id_film),
    UNIQUE KEY uk_favori_user_episode (id_utilisateur, id_episode),
    UNIQUE KEY uk_favori_user_serie (id_utilisateur, id_serie),
    INDEX idx_favori_film (id_film),
    INDEX idx_favori_episode (id_episode),
    INDEX idx_favori_serie (id_serie)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE PUBLICATION (posts / magazine)
-- =======================================
CREATE TABLE publication (
    id_publication INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT NOT NULL,
    image VARCHAR(500),
    contenu TEXT,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut ENUM('en_attente', 'valide', 'refuse') DEFAULT 'en_attente',
    CONSTRAINT fk_publication_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    INDEX idx_pub_user (id_utilisateur),
    INDEX idx_pub_statut (statut)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE REACTIONS SUR PUBLICATIONS
-- =======================================
CREATE TABLE publication_reactions (
    id_reaction INT AUTO_INCREMENT PRIMARY KEY,
    id_publication INT NOT NULL,
    id_utilisateur INT NOT NULL,
    type ENUM(
        'like',
        'adore',
        'triste',
        'rigole',
        'surpris',
        'en_colere'
    ) DEFAULT 'like',
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reaction_publication FOREIGN KEY (id_publication) REFERENCES publication(id_publication) ON DELETE CASCADE,
    CONSTRAINT fk_reaction_utilisateur FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    UNIQUE KEY uk_reaction_pub_user_type (id_publication, id_utilisateur, type),
    INDEX idx_reaction_pub (id_publication)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  TABLE COMMENTAIRES SUR PUBLICATIONS
--  (commentaires + réponses à des commentaires)
-- =======================================
CREATE TABLE publication_commentaires (
    id_commentaire INT AUTO_INCREMENT PRIMARY KEY,
    id_publication INT NOT NULL,
    id_utilisateur INT NOT NULL,
    id_parent_commentaire INT NULL,
    contenu TEXT NOT NULL,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_com_pub FOREIGN KEY (id_publication) REFERENCES publication(id_publication) ON DELETE CASCADE,
    CONSTRAINT fk_com_user FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    CONSTRAINT fk_com_parent FOREIGN KEY (id_parent_commentaire) REFERENCES publication_commentaires(id_commentaire) ON DELETE CASCADE,
    INDEX idx_com_pub (id_publication),
    INDEX idx_com_parent (id_parent_commentaire)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- =======================================
--  INSERTIONS DE BASE
-- =======================================
INSERT INTO categories (nom)
VALUES ('Action'),
    ('Drame'),
    ('Comédie'),
    ('Romance'),
    ('Série'),
    ('Documentaire');
INSERT INTO administrateurs (nom, courriel, mot_de_passe, role)
VALUES (
        'Admin Principal',
        'admin@cinea.com',
        'admin123',
        'SuperAdmin'
    );
-- =======================================
--  TABLE NOTIFICATIONS (social / système)
-- =======================================
CREATE TABLE notifications (
    id_notification INT AUTO_INCREMENT PRIMARY KEY,
    -- Celui qui reçoit la notification
    id_utilisateur_cible INT NOT NULL,
    -- Celui qui a fait l'action (like, commentaire, etc.)
    id_utilisateur_source INT NOT NULL,
    -- Type de notification (extensible plus tard)
    type_notification ENUM(
        'like_publication',
        'commentaire_publication',
        'reponse_commentaire'
    ) NOT NULL,
    -- Liens vers le contenu concerné
    id_publication INT NULL,
    id_commentaire INT NULL,
    -- Message prêt à afficher côté front
    message TEXT,
    -- 0 = non lu, 1 = lu
    est_lu TINYINT(1) DEFAULT 0,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Clés étrangères
    CONSTRAINT fk_notif_user_cible FOREIGN KEY (id_utilisateur_cible) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    CONSTRAINT fk_notif_user_source FOREIGN KEY (id_utilisateur_source) REFERENCES utilisateurs(id_utilisateur) ON DELETE CASCADE,
    CONSTRAINT fk_notif_publication FOREIGN KEY (id_publication) REFERENCES publication(id_publication) ON DELETE CASCADE,
    CONSTRAINT fk_notif_commentaire FOREIGN KEY (id_commentaire) REFERENCES publication_commentaires(id_commentaire) ON DELETE CASCADE,
    -- Index pour les performances
    INDEX idx_notif_user_cible (id_utilisateur_cible, est_lu, date_creation),
    INDEX idx_notif_user_source (id_utilisateur_source),
    INDEX idx_notif_publication (id_publication),
    INDEX idx_notif_commentaire (id_commentaire)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;