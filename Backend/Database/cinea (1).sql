-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 15 déc. 2025 à 13:57
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `cinea`
--

-- --------------------------------------------------------

--
-- Structure de la table `abonnements`
--

CREATE TABLE `abonnements` (
  `id_abonnement` int(11) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `type` enum('mensuel','annuel') NOT NULL,
  `date_debut` datetime DEFAULT current_timestamp(),
  `date_fin` datetime DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `abonnements`
--

INSERT INTO `abonnements` (`id_abonnement`, `id_utilisateur`, `type`, `date_debut`, `date_fin`, `actif`) VALUES
(1, 1, 'mensuel', '2025-12-01 14:22:58', '2026-01-01 14:22:58', 1),
(2, 2, 'annuel', '2025-12-01 14:22:58', '2026-12-01 14:22:58', 1),
(3, 3, 'mensuel', '2025-12-01 14:22:58', '2026-01-01 14:22:58', 1),
(4, 4, 'annuel', '2025-12-01 14:22:58', '2026-12-01 14:22:58', 1),
(5, 5, 'mensuel', '2025-12-01 14:22:58', '2026-01-01 14:22:58', 1);

-- --------------------------------------------------------

--
-- Structure de la table `administrateurs`
--

CREATE TABLE `administrateurs` (
  `id_admin` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `courriel` varchar(255) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'Modérateur'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `administrateurs`
--

INSERT INTO `administrateurs` (`id_admin`, `nom`, `courriel`, `mot_de_passe`, `role`) VALUES
(1, 'Admin Principal', 'admin@cinea.com', '$2b$12$TT2HxekBI1YqxLOP/1SXbu6u9JbnBeVzatoJM.O2yyJEBub2u88VC', 'SuperAdmin'),
(2, 'Sophie Martin', 'sophie.martin@cinea.com', '$2b$12$VGoKhtSR0Oq/khyllaeljOHv7RPeflyfCVVJ7hH5fukD.ztLWsrXe', 'Modérateur'),
(3, 'Pierre Dubois', 'pierre.dubois@cinea.com', '$2b$12$ylwDPSyZgpUTWEqoMC7PnuuacVrOXjkDEoAuSmFTKQKrjT627Z0V2', 'Modérateur'),
(4, 'Marie Laurent', 'marie.laurent@cinea.com', '$2b$12$hoeXPx2FN/gatT7nrEDqAe10UBIFEaZvBzyaopYyDXWVV8Qugk.pS', 'Modérateur'),
(5, 'Lucas Bernard', 'lucas.bernard@cinea.com', '$2b$12$c9zdeZ6pxG6M6610M0xX/eApQNJBFLhopZ/HGbkajmJbw9CQWBijm', 'SuperAdmin'),
(10, 'ologny', 'olognykashifat@gmail.com', '123456', 'Modérateur');

-- --------------------------------------------------------

--
-- Structure de la table `avis`
--

CREATE TABLE `avis` (
  `id_avis` int(11) NOT NULL,
  `id_utilisateur` int(11) DEFAULT NULL,
  `id_film` int(11) DEFAULT NULL,
  `id_episode` int(11) DEFAULT NULL,
  `note` tinyint(4) DEFAULT NULL,
  `commentaire` text DEFAULT NULL,
  `date_commentaire` datetime DEFAULT current_timestamp()
) ;

--
-- Déchargement des données de la table `avis`
--

INSERT INTO `avis` (`id_avis`, `id_utilisateur`, `id_film`, `id_episode`, `note`, `commentaire`, `date_commentaire`) VALUES
(1, 1, 4, NULL, 5, 'Magnifique film !', '2025-12-01 14:26:30'),
(2, 2, 4, NULL, 4, 'Très bon scénario.', '2025-12-01 14:26:30'),
(3, 3, 5, NULL, 3, 'Pas mauvais.', '2025-12-01 14:26:30'),
(11, 12, 15, NULL, 5, 'c\'est un bon film jaime', '2025-12-05 10:04:47'),
(12, 12, 16, NULL, 5, 'j\'adore ce film', '2025-12-06 23:41:19');

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id_categorie` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id_categorie`, `nom`) VALUES
(1, 'Action'),
(2, 'Drame'),
(3, 'Comédie'),
(4, 'Romance'),
(5, 'Série'),
(6, 'Documentaire');

-- --------------------------------------------------------

--
-- Structure de la table `episodes`
--

CREATE TABLE `episodes` (
  `id_episode` int(11) NOT NULL,
  `id_saison` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `lien_vo` varchar(500) DEFAULT NULL,
  `lien_vf` varchar(500) DEFAULT NULL,
  `bande_annonce` varchar(500) DEFAULT NULL,
  `duree` varchar(20) DEFAULT NULL,
  `numero_episode` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `episodes`
--

INSERT INTO `episodes` (`id_episode`, `id_saison`, `titre`, `description`, `lien_vo`, `lien_vf`, `bande_annonce`, `duree`, `numero_episode`) VALUES
(7, 4, 'Épisode 1 - Première Scène', 'Premier épisode de la série de test.', 'series/serie1/saison1/eps1_vo.mp4', 'series/serie1/saison1/eps1_vf.mp4', 'bande_annonces/film1_trailer.mp4', '00:24:00', 1),
(8, 5, 'Épisode 1 - Le Retour', 'Premier épisode de la série 2.', 'series/serie2/saison1/eps1_vo.mp4', 'series/serie2/saison1/eps1_vf.mp4', 'bande_annonces/serie2_trailer.mp4', '00:30:00', 1),
(9, 5, 'Épisode 2 - La Chute', 'Deuxième épisode de la série 2.', 'series/serie2/saison1/eps2_vo.mp4', 'series/serie2/saison1/eps2_vf.mp4', 'bande_annonces/serie2_trailer.mp4', '00:32:00', 2),
(10, 6, 'debut', 'Naruto est un manga et anime culte créé par Masashi Kishimoto, centré sur Naruto Uzumaki, un jeune ninja du village de Konoha qui rêve de devenir Hokage, le chef et protecteur de son village.\r\n', 'episodes/ep_vo_20251208_102154_7b9e3664.mp4', 'episodes/ep_vf_20251208_102154_da1f980a.mp4', NULL, '29', 1),
(11, 6, 'Naruto', 'Naruto est un manga et anime culte créé par Masashi Kishimoto, centré sur Naruto Uzumaki, un jeune ninja du village de Konoha qui rêve de devenir Hokage, le chef et protecteur de son village.', 'episodes/ep_vo_20251208_102450_faa11ffb.mp4', 'episodes/ep_vf_20251208_102450_f60090e0.mp4', NULL, '30', 2),
(12, 7, 'Naruto', 'Naruto est un manga et anime culte créé par Masashi Kishimoto, centré sur Naruto Uzumaki, un jeune ninja du village de Konoha qui rêve de devenir Hokage, le chef et protecteur de son village.\r\n', 'episodes/ep_vo_20251208_102559_8323ba04.mp4', 'episodes/ep_vf_20251208_102559_2e1be5ad.mp4', NULL, '30', 1);

-- --------------------------------------------------------

--
-- Structure de la table `favoris`
--

CREATE TABLE `favoris` (
  `id_favori` int(11) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `id_film` int(11) DEFAULT NULL,
  `id_episode` int(11) DEFAULT NULL,
  `date_ajout` datetime DEFAULT current_timestamp()
) ;

--
-- Déchargement des données de la table `favoris`
--

INSERT INTO `favoris` (`id_favori`, `id_utilisateur`, `id_film`, `id_episode`, `date_ajout`) VALUES
(1, 1, 4, NULL, '2025-12-01 14:26:30'),
(2, 2, 5, NULL, '2025-12-01 14:26:30'),
(3, 3, 4, NULL, '2025-12-01 14:26:30'),
(8, 12, 4, NULL, '2025-12-15 07:55:13'),
(9, 12, 5, NULL, '2025-12-15 07:55:17');

-- --------------------------------------------------------

--
-- Structure de la table `films`
--

CREATE TABLE `films` (
  `id_film` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `id_categorie` int(11) DEFAULT NULL,
  `lien_vo` varchar(500) DEFAULT NULL,
  `lien_vf` varchar(500) DEFAULT NULL,
  `bande_annonce` varchar(500) DEFAULT NULL,
  `affiche` varchar(500) DEFAULT NULL,
  `date_sortie` varchar(20) DEFAULT NULL,
  `duree` varchar(20) DEFAULT NULL,
  `pays` varchar(100) DEFAULT NULL,
  `type` varchar(20) DEFAULT 'Film',
  `popularite` int(11) DEFAULT 0,
  `date_ajout` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `films`
--

INSERT INTO `films` (`id_film`, `titre`, `description`, `id_categorie`, `lien_vo`, `lien_vf`, `bande_annonce`, `affiche`, `date_sortie`, `duree`, `pays`, `type`, `popularite`, `date_ajout`) VALUES
(4, 'Film 1 - Le Début', 'Un film de démonstration pour tester la lecture VF/VO et la bande-annonce.', 1, 'films/film1_vo.mp4', 'films/film1_vf.mp4', 'bande_annonces/film1_trailer.mp4', 'images/img_film1.jpg', '2025-01-01', '00:25:00', 'Côte d\'Ivoire', 'Film', 0, '2025-12-01 14:25:04'),
(5, 'Film 2 - La Suite', 'Deuxième film utilisé pour les tests.', 1, 'films/film2_vo.mp4', 'films/film2_vf.mp4', 'bande_annonces/film2_trailer.mp4', 'images/img_film2.jpg', '2025-03-10', '01:10:00', 'Côte d\'Ivoire', 'Film', 0, '2025-12-01 14:26:30'),
(15, 'Le Monstre Des Mers 2022', 'Le Monstre des Mers (The Sea Beast) est un film d’animation Netflix sorti en 2022, réalisé par Chris Williams. Il raconte l’aventure épique d’un chasseur de monstres marins et d’une jeune orpheline qui découvrent que les créatures qu’ils pourchassent ne sont pas forcément celles qu’on croit.\r\n\r\n🎬 Informations principales\r\n- Titre original : The Sea Beast\r\n- Réalisation : Chris Williams\r\n- Scénario : Chris Williams, Nell Benjamin\r\n- Musique : Mark Mancina\r\n- Durée : 115 minutes\r\n- Genre : Animation, aventure, fantastique, famille\r\n- Distribution vocale : Karl Urban (Jacob Holland), Zaris-Angel Hator (Maisie Brumble), Jared Harris, Marianne Jean-Baptiste\r\n\r\n\r\n', 3, 'films/film_vo_20251205_093828_60862a35.avi', 'films/film_vf_20251205_093835_f7301fcf.avi', 'bande_annonces/ba_film_20251205_093842_4719f8fe.avi', 'images/affiche_film_20251205_093842_75ac47ad.jpg', '2008-04-12', '3', 'État unis ', 'Film', 0, '2025-12-05 09:38:48'),
(16, 'Titanic', 'Titanic est un film dramatique et romantique réalisé par James Cameron en 1997, qui raconte l’histoire fictive d’un amour impossible sur fond du naufrage historique du paquebot Titanic en avril 1912.', 4, 'films/film_vo_20251206_233852_b4200809.mp4', 'films/film_vf_20251206_233902_ab659557.mp4', 'bande_annonces/ba_film_20251206_233906_4698e2cd.mp4', 'images/affiche_film_20251206_233906_14cd93c8.jpg', '1972-02-11', '3', 'État unis ', 'Film', 0, '2025-12-06 23:39:07');

-- --------------------------------------------------------

--
-- Structure de la table `historiques`
--

CREATE TABLE `historiques` (
  `id_historique` int(11) NOT NULL,
  `id_utilisateur` int(11) DEFAULT NULL,
  `id_film` int(11) DEFAULT NULL,
  `id_episode` int(11) DEFAULT NULL,
  `position` varchar(20) DEFAULT '00:00:00',
  `date_visionnage` datetime DEFAULT current_timestamp()
) ;

--
-- Déchargement des données de la table `historiques`
--

INSERT INTO `historiques` (`id_historique`, `id_utilisateur`, `id_film`, `id_episode`, `position`, `date_visionnage`) VALUES
(76, 12, 15, NULL, '00:23:06', '2025-12-08 18:26:09'),
(77, 12, NULL, 10, '00:00:00', '2025-12-08 18:39:07');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id_notification` int(11) NOT NULL,
  `id_utilisateur_cible` int(11) NOT NULL,
  `id_utilisateur_source` int(11) NOT NULL,
  `type_notification` enum('like_publication','commentaire_publication','reponse_commentaire') NOT NULL,
  `id_publication` int(11) DEFAULT NULL,
  `id_commentaire` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `est_lu` tinyint(1) DEFAULT 0,
  `date_creation` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id_notification`, `id_utilisateur_cible`, `id_utilisateur_source`, `type_notification`, `id_publication`, `id_commentaire`, `message`, `est_lu`, `date_creation`) VALUES
(3, 1, 2, 'like_publication', 17, NULL, 'Emma Moreau a aimé votre publication ❤️', 0, '2025-12-08 10:56:21'),
(4, 1, 2, 'like_publication', 17, NULL, 'Emma Moreau a aimé votre publication ❤️', 0, '2025-12-08 10:56:46'),
(5, 13, 12, 'reponse_commentaire', 22, 17, 'titi ologny a répondu à votre commentaire 💭', 1, '2025-12-08 11:07:25'),
(6, 12, 13, 'commentaire_publication', 21, 19, 'ib okk a commenté votre publication 💬', 1, '2025-12-08 11:11:56'),
(7, 12, 13, 'like_publication', 21, NULL, 'ib okk a aimé votre publication ❤️', 1, '2025-12-08 11:13:52'),
(8, 13, 12, 'like_publication', 22, NULL, 'titi ologny a aimé votre publication ❤️', 0, '2025-12-11 18:13:16'),
(9, 13, 12, 'like_publication', 22, NULL, 'titi ologny a aimé votre publication ❤️', 0, '2025-12-11 19:10:27');

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

CREATE TABLE `paiements` (
  `id_paiement` int(11) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `methode` varchar(100) DEFAULT NULL,
  `statut` varchar(50) DEFAULT 'En attente',
  `date_paiement` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `paiements`
--

INSERT INTO `paiements` (`id_paiement`, `id_utilisateur`, `montant`, `methode`, `statut`, `date_paiement`) VALUES
(1, 1, 9.99, 'Mobile Money', 'Réussi', '2025-12-01 14:26:30'),
(2, 2, 99.99, 'Carte bancaire', 'Réussi', '2025-12-01 14:26:30'),
(3, 3, 9.99, 'Mobile Money', 'En attente', '2025-12-01 14:26:30');

-- --------------------------------------------------------

--
-- Structure de la table `publication`
--

CREATE TABLE `publication` (
  `id_publication` int(11) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `contenu` text DEFAULT NULL,
  `date_ajout` datetime DEFAULT current_timestamp(),
  `statut` enum('en_attente','valide','refuse') DEFAULT 'en_attente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `publication`
--

INSERT INTO `publication` (`id_publication`, `id_utilisateur`, `image`, `contenu`, `date_ajout`, `statut`) VALUES
(3, 12, NULL, 'bonjour', '2025-12-05 10:40:48', 'valide'),
(5, 11, 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', 'Quel est votre film préféré de tous les temps ? 🎬 Le mien reste un classique intemporel !', '2025-12-02 13:15:49', 'valide'),
(6, 5, 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800', 'Je viens de découvrir une pépite sur CineA ! Les séries documentaires sont incroyables 📺', '2025-11-14 01:15:49', 'refuse'),
(7, 11, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800', 'Soirée cinéma ce soir ! Qui a des recommandations ? Je suis d\'humeur pour un bon thriller 🍿', '2025-11-27 11:15:49', 'valide'),
(8, 2, 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800', 'L\'ambiance des vieux cinémas me manque... Ces salles avaient tellement de charme ! 🎞️', '2025-11-22 02:15:49', 'valide'),
(9, 10, 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800', 'Marathon de films ce week-end ! Préparez le pop-corn, on ne bouge plus du canapé 😄', '2025-11-21 05:15:49', 'valide'),
(10, 11, NULL, 'Cette scène m\'a donné des frissons... Le pouvoir du cinéma est vraiment magique ✨', '2025-11-16 07:15:49', 'valide'),
(11, 5, NULL, 'Qui se souvient de ce film culte ? Les effets spéciaux étaient révolutionnaires pour l\'époque !', '2025-12-01 02:15:49', 'valide'),
(12, 5, 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800', 'L\'art du cinéma, c\'est raconter mille histoires avec une seule image 📸', '2025-12-02 09:15:49', 'valide'),
(13, 5, 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800', 'Les documentaires sur CineA sont une mine d\'or ! J\'apprends tellement de choses 🎓', '2025-11-29 22:15:49', 'valide'),
(14, 11, 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800', 'Il y a quelque chose de magique à regarder un film au cinéma... L\'expérience est unique ! 🎭', '2025-12-03 06:15:49', 'valide'),
(15, 3, 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800', 'Cette série m\'a tenu en haleine jusqu\'au bout ! Impossible de décrocher 😱', '2025-11-29 17:15:49', 'valide'),
(16, 3, 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800', 'Le cinéma, c\'est l\'art de transformer des rêves en réalité 🌟', '2025-11-10 06:15:49', 'valide'),
(17, 1, 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', 'Je me sens nostalgique en regardant ces vieux films... Quelle époque ! 📽️', '2025-11-30 15:15:49', 'valide'),
(18, 11, 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800', 'Les classiques ne vieillissent jamais. Ils restent toujours aussi puissants ! 👏', '2025-11-15 11:15:49', 'valide'),
(19, 10, NULL, 'Vous avez vu la nouvelle série ? Je suis déjà accro au premier épisode ! 🔥', '2025-11-20 17:15:49', 'valide'),
(20, 12, NULL, 'CA VA', '2025-12-08 07:37:08', 'valide'),
(21, 12, 'http://localhost:5002/media/images/publication_20251208_074526_331bd2aa.webp', 'j\'ai rien en tete', '2025-12-08 07:45:31', 'valide'),
(22, 13, 'http://localhost:5002/media/images/publication_20251208_103620_85da4eef.jpg', 'jaime bien', '2025-12-08 10:36:28', 'valide');

-- --------------------------------------------------------

--
-- Structure de la table `publication_commentaires`
--

CREATE TABLE `publication_commentaires` (
  `id_commentaire` int(11) NOT NULL,
  `id_publication` int(11) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `id_parent_commentaire` int(11) DEFAULT NULL,
  `contenu` text NOT NULL,
  `date_ajout` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `publication_commentaires`
--

INSERT INTO `publication_commentaires` (`id_commentaire`, `id_publication`, `id_utilisateur`, `id_parent_commentaire`, `contenu`, `date_ajout`) VALUES
(5, 5, 12, NULL, 'bonjour', '2025-12-05 11:17:09'),
(6, 5, 12, 5, 'desoler', '2025-12-05 11:17:23'),
(7, 16, 12, NULL, 'oui cest vrai', '2025-12-07 02:13:27'),
(8, 3, 13, NULL, 'coll', '2025-12-07 23:16:21'),
(9, 13, 13, NULL, 'bonjour super', '2025-12-07 23:17:11'),
(10, 21, 13, NULL, 'cest super', '2025-12-08 10:01:31'),
(11, 22, 13, NULL, 'ok', '2025-12-08 10:38:42'),
(12, 22, 13, 11, 'ok', '2025-12-08 10:39:06'),
(13, 22, 12, NULL, 'halo', '2025-12-08 10:49:07'),
(14, 22, 12, 11, 'bye', '2025-12-08 10:50:59'),
(15, 22, 13, 14, 'coucou', '2025-12-08 10:51:40'),
(16, 22, 13, 13, 'hey', '2025-12-08 11:06:27'),
(17, 22, 12, 16, 'hey', '2025-12-08 11:07:23'),
(18, 22, 13, 17, 'tu va bien', '2025-12-08 11:09:26'),
(19, 21, 13, NULL, 'halo', '2025-12-08 11:11:54');

-- --------------------------------------------------------

--
-- Structure de la table `publication_reactions`
--

CREATE TABLE `publication_reactions` (
  `id_reaction` int(11) NOT NULL,
  `id_publication` int(11) NOT NULL,
  `id_utilisateur` int(11) NOT NULL,
  `type` enum('like','adore','triste','rigole','surpris','en_colere') DEFAULT 'like',
  `date_ajout` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `publication_reactions`
--

INSERT INTO `publication_reactions` (`id_reaction`, `id_publication`, `id_utilisateur`, `type`, `date_ajout`) VALUES
(3, 16, 12, 'like', '2025-12-07 02:13:06'),
(4, 18, 12, 'like', '2025-12-07 02:13:35'),
(5, 3, 12, 'like', '2025-12-07 02:14:00'),
(6, 3, 13, 'like', '2025-12-07 23:16:11'),
(7, 14, 13, 'like', '2025-12-07 23:16:37'),
(8, 5, 13, 'like', '2025-12-07 23:16:42'),
(9, 17, 13, 'like', '2025-12-07 23:16:49'),
(10, 20, 12, 'like', '2025-12-08 09:47:01'),
(12, 22, 13, 'like', '2025-12-08 10:38:30'),
(15, 17, 2, 'like', '2025-12-08 10:58:27'),
(16, 21, 13, 'like', '2025-12-08 11:13:50'),
(18, 22, 12, 'adore', '2025-12-11 19:10:25');

-- --------------------------------------------------------

--
-- Structure de la table `saisons`
--

CREATE TABLE `saisons` (
  `id_saison` int(11) NOT NULL,
  `id_serie` int(11) NOT NULL,
  `numero_saison` int(11) NOT NULL,
  `titre` varchar(255) DEFAULT NULL,
  `annee` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `saisons`
--

INSERT INTO `saisons` (`id_saison`, `id_serie`, `numero_saison`, `titre`, `annee`) VALUES
(4, 4, 1, 'Saison 1', '2025'),
(5, 5, 1, 'Saison 1 - Origines', '2025'),
(6, 6, 1, 'Naruto', '2010'),
(7, 6, 2, 'commencement', '2010');

-- --------------------------------------------------------

--
-- Structure de la table `series`
--

CREATE TABLE `series` (
  `id_serie` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `affiche` varchar(500) DEFAULT NULL,
  `bande_annonce` varchar(500) DEFAULT NULL,
  `date_sortie` varchar(20) DEFAULT NULL,
  `pays` varchar(100) DEFAULT NULL,
  `id_categorie` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `series`
--

INSERT INTO `series` (`id_serie`, `titre`, `description`, `affiche`, `bande_annonce`, `date_sortie`, `pays`, `id_categorie`) VALUES
(4, 'Série 1 - Les Débuts', 'Une série fictive de test avec 1 saison et 1 épisode VF/VO.', 'images/img_film1.jpg', 'bande_annonces/film1_trailer.mp4', '2025-02-01', 'Côte d\'Ivoire', 1),
(5, 'Série 2 - Les Retours', 'Deuxième série de test pour démonstration.', 'images/img_serie2.jpg', 'bande_annonces/serie2_trailer.mp4', '2025-04-01', 'Côte d\'Ivoire', 1),
(6, 'Naruto', 'Naruto est un manga et anime culte créé par Masashi Kishimoto, centré sur Naruto Uzumaki, un jeune ninja du village de Konoha qui rêve de devenir Hokage, le chef et protecteur de son village.\r\n🌟 Présentation générale\r\n- Origine : Manga publié entre 1999 et 2014 dans Weekly Shōnen Jump.\r\n- Adaptations : Deux séries animées (Naruto et Naruto Shippuden) diffusées de 2002 à 2017, avec plus de 700 épisodes.\r\n- Thèmes principaux : Ninjas, amitié, persévérance, rivalité, héritage familial et quête de reconnaissance.\r\n\r\n', 'images/affiche_serie_20251208_095127_56eb47b1.jpg', 'bande_annonces/ba_serie_20251208_095127_1935f7ee.mp4', NULL, 'Japon', 5);

-- --------------------------------------------------------

--
-- Structure de la table `utilisateurs`
--

CREATE TABLE `utilisateurs` (
  `id_utilisateur` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `courriel` varchar(255) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `photo_profil` varchar(500) DEFAULT NULL COMMENT 'URL ou chemin de la photo de profil',
  `date_inscription` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `utilisateurs`
--

INSERT INTO `utilisateurs` (`id_utilisateur`, `nom`, `courriel`, `mot_de_passe`, `photo_profil`, `date_inscription`) VALUES
(1, 'Jean Dupont', 'jean.dupont@email.com', 'jean123', NULL, '2025-12-01 14:22:58'),
(2, 'Emma Moreau', 'emma.moreau@email.com', 'emma123', NULL, '2025-12-01 14:22:58'),
(3, 'Thomas Petit', 'thomas.petit@email.com', 'thomas123', NULL, '2025-12-01 14:22:58'),
(4, 'Léa Robert', 'lea.robert@email.com', 'lea123', NULL, '2025-12-01 14:22:58'),
(5, 'Hugo Simon', 'hugo.simon@email.com', 'hugo123', NULL, '2025-12-01 14:22:58'),
(6, 'Jean Test User', 'test_1764619750.024597@test.com', '$2b$12$KqnWnl1O0X2WGYOX08lUoe1g2cCxokn8RxYybo8WVMgMdlBgnWNbC', NULL, '2025-12-01 15:09:12'),
(7, 'Jean Test User', 'test_1764619836.155716@test.com', '$2b$12$2EEAaQ5KTACUZfD3tBv88OHE5miVz7QkY5HxetezZWMvCUIEd6Bha', NULL, '2025-12-01 15:10:38'),
(10, 'Test Connexion', 'testconnexion@test.com', '$2b$12$8L0BlquyUfGiMg9IuOqXJOV651LQM3FgZXkl3CUbaako6fKQMxg8e', NULL, '2025-12-01 15:12:26'),
(11, 'Test', 'test_1764621395.2892425@test.com', '$2b$12$1dKYDPZAZmC5Tbtu7sFb7uoj6PmB/tg.ylP2LbROqlRQ3x4.uz2nG', NULL, '2025-12-01 15:36:37'),
(12, 'titi ologny', 'kashi.yesufu@gmail.com', '$2b$12$QrrirHPbky0rQIIz/Eu5J.jn3PDKLFB7kDDWDkgPcL.hEe.SDoobi', 'images/profil_12_20251205_100954_6fdd9bca.jpg', '2025-12-01 17:52:32'),
(13, 'ib okk', 'okk@gmail.com', '$2b$12$kFpavo8yVAZy7GR6Jel2i./.cNvM5LkMvJP4mFishciBQka9jwKPO', 'images/profil_13_20251207_231412_e9cf7c4e.jpg', '2025-12-07 23:12:11');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `abonnements`
--
ALTER TABLE `abonnements`
  ADD PRIMARY KEY (`id_abonnement`),
  ADD KEY `idx_abonnement_utilisateur` (`id_utilisateur`);

--
-- Index pour la table `administrateurs`
--
ALTER TABLE `administrateurs`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `courriel` (`courriel`);

--
-- Index pour la table `avis`
--
ALTER TABLE `avis`
  ADD PRIMARY KEY (`id_avis`),
  ADD KEY `fk_avis_utilisateur` (`id_utilisateur`),
  ADD KEY `idx_avis_film` (`id_film`),
  ADD KEY `idx_avis_episode` (`id_episode`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id_categorie`);

--
-- Index pour la table `episodes`
--
ALTER TABLE `episodes`
  ADD PRIMARY KEY (`id_episode`),
  ADD UNIQUE KEY `uk_episode_saison` (`id_saison`,`numero_episode`);

--
-- Index pour la table `favoris`
--
ALTER TABLE `favoris`
  ADD PRIMARY KEY (`id_favori`),
  ADD UNIQUE KEY `uk_favori_user_film` (`id_utilisateur`,`id_film`),
  ADD UNIQUE KEY `uk_favori_user_episode` (`id_utilisateur`,`id_episode`),
  ADD KEY `idx_favori_film` (`id_film`),
  ADD KEY `idx_favori_episode` (`id_episode`);

--
-- Index pour la table `films`
--
ALTER TABLE `films`
  ADD PRIMARY KEY (`id_film`),
  ADD KEY `fk_films_categorie` (`id_categorie`);

--
-- Index pour la table `historiques`
--
ALTER TABLE `historiques`
  ADD PRIMARY KEY (`id_historique`),
  ADD UNIQUE KEY `uq_hist_film` (`id_utilisateur`,`id_film`),
  ADD UNIQUE KEY `uq_hist_episode` (`id_utilisateur`,`id_episode`),
  ADD KEY `idx_hist_utilisateur` (`id_utilisateur`),
  ADD KEY `idx_hist_film` (`id_film`),
  ADD KEY `idx_hist_episode` (`id_episode`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id_notification`),
  ADD KEY `idx_notif_user_cible` (`id_utilisateur_cible`,`est_lu`,`date_creation`),
  ADD KEY `idx_notif_user_source` (`id_utilisateur_source`),
  ADD KEY `idx_notif_publication` (`id_publication`),
  ADD KEY `idx_notif_commentaire` (`id_commentaire`);

--
-- Index pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id_paiement`),
  ADD KEY `idx_paiement_utilisateur` (`id_utilisateur`),
  ADD KEY `idx_paiement_statut` (`statut`);

--
-- Index pour la table `publication`
--
ALTER TABLE `publication`
  ADD PRIMARY KEY (`id_publication`),
  ADD KEY `idx_pub_user` (`id_utilisateur`),
  ADD KEY `idx_pub_statut` (`statut`);

--
-- Index pour la table `publication_commentaires`
--
ALTER TABLE `publication_commentaires`
  ADD PRIMARY KEY (`id_commentaire`),
  ADD KEY `fk_com_user` (`id_utilisateur`),
  ADD KEY `idx_com_pub` (`id_publication`),
  ADD KEY `idx_com_parent` (`id_parent_commentaire`);

--
-- Index pour la table `publication_reactions`
--
ALTER TABLE `publication_reactions`
  ADD PRIMARY KEY (`id_reaction`),
  ADD UNIQUE KEY `uk_reaction_pub_user` (`id_publication`,`id_utilisateur`),
  ADD KEY `fk_reaction_utilisateur` (`id_utilisateur`),
  ADD KEY `idx_reaction_pub` (`id_publication`);

--
-- Index pour la table `saisons`
--
ALTER TABLE `saisons`
  ADD PRIMARY KEY (`id_saison`),
  ADD UNIQUE KEY `uk_saison_serie` (`id_serie`,`numero_saison`);

--
-- Index pour la table `series`
--
ALTER TABLE `series`
  ADD PRIMARY KEY (`id_serie`),
  ADD KEY `fk_series_categorie` (`id_categorie`);

--
-- Index pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  ADD PRIMARY KEY (`id_utilisateur`),
  ADD UNIQUE KEY `courriel` (`courriel`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `abonnements`
--
ALTER TABLE `abonnements`
  MODIFY `id_abonnement` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `administrateurs`
--
ALTER TABLE `administrateurs`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `avis`
--
ALTER TABLE `avis`
  MODIFY `id_avis` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id_categorie` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `episodes`
--
ALTER TABLE `episodes`
  MODIFY `id_episode` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `favoris`
--
ALTER TABLE `favoris`
  MODIFY `id_favori` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `films`
--
ALTER TABLE `films`
  MODIFY `id_film` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `historiques`
--
ALTER TABLE `historiques`
  MODIFY `id_historique` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id_notification` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `paiements`
--
ALTER TABLE `paiements`
  MODIFY `id_paiement` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `publication`
--
ALTER TABLE `publication`
  MODIFY `id_publication` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `publication_commentaires`
--
ALTER TABLE `publication_commentaires`
  MODIFY `id_commentaire` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pour la table `publication_reactions`
--
ALTER TABLE `publication_reactions`
  MODIFY `id_reaction` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `saisons`
--
ALTER TABLE `saisons`
  MODIFY `id_saison` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `series`
--
ALTER TABLE `series`
  MODIFY `id_serie` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `utilisateurs`
--
ALTER TABLE `utilisateurs`
  MODIFY `id_utilisateur` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `abonnements`
--
ALTER TABLE `abonnements`
  ADD CONSTRAINT `fk_abonnement_utilisateur` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `avis`
--
ALTER TABLE `avis`
  ADD CONSTRAINT `fk_avis_episode` FOREIGN KEY (`id_episode`) REFERENCES `episodes` (`id_episode`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_avis_film` FOREIGN KEY (`id_film`) REFERENCES `films` (`id_film`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_avis_utilisateur` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `episodes`
--
ALTER TABLE `episodes`
  ADD CONSTRAINT `fk_episodes_saisons` FOREIGN KEY (`id_saison`) REFERENCES `saisons` (`id_saison`) ON DELETE CASCADE;

--
-- Contraintes pour la table `favoris`
--
ALTER TABLE `favoris`
  ADD CONSTRAINT `fk_favori_episode` FOREIGN KEY (`id_episode`) REFERENCES `episodes` (`id_episode`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_favori_film` FOREIGN KEY (`id_film`) REFERENCES `films` (`id_film`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_favori_utilisateur` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `films`
--
ALTER TABLE `films`
  ADD CONSTRAINT `fk_films_categorie` FOREIGN KEY (`id_categorie`) REFERENCES `categories` (`id_categorie`) ON DELETE SET NULL;

--
-- Contraintes pour la table `historiques`
--
ALTER TABLE `historiques`
  ADD CONSTRAINT `fk_hist_episode` FOREIGN KEY (`id_episode`) REFERENCES `episodes` (`id_episode`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hist_film` FOREIGN KEY (`id_film`) REFERENCES `films` (`id_film`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hist_utilisateur` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_commentaire` FOREIGN KEY (`id_commentaire`) REFERENCES `publication_commentaires` (`id_commentaire`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notif_publication` FOREIGN KEY (`id_publication`) REFERENCES `publication` (`id_publication`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notif_user_cible` FOREIGN KEY (`id_utilisateur_cible`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_notif_user_source` FOREIGN KEY (`id_utilisateur_source`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `fk_paiement_utilisateur` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `publication`
--
ALTER TABLE `publication`
  ADD CONSTRAINT `fk_publication_utilisateur` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `publication_commentaires`
--
ALTER TABLE `publication_commentaires`
  ADD CONSTRAINT `fk_com_parent` FOREIGN KEY (`id_parent_commentaire`) REFERENCES `publication_commentaires` (`id_commentaire`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_com_pub` FOREIGN KEY (`id_publication`) REFERENCES `publication` (`id_publication`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_com_user` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `publication_reactions`
--
ALTER TABLE `publication_reactions`
  ADD CONSTRAINT `fk_reaction_publication` FOREIGN KEY (`id_publication`) REFERENCES `publication` (`id_publication`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reaction_utilisateur` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateurs` (`id_utilisateur`) ON DELETE CASCADE;

--
-- Contraintes pour la table `saisons`
--
ALTER TABLE `saisons`
  ADD CONSTRAINT `fk_saisons_series` FOREIGN KEY (`id_serie`) REFERENCES `series` (`id_serie`) ON DELETE CASCADE;

--
-- Contraintes pour la table `series`
--
ALTER TABLE `series`
  ADD CONSTRAINT `fk_series_categorie` FOREIGN KEY (`id_categorie`) REFERENCES `categories` (`id_categorie`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
