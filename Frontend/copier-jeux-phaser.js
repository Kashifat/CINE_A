/**
 * Script pour copier sélectivement des jeux Phaser depuis examples-master
 * vers Frontend/public/phaser-jeux/
 */

const fs = require('fs-extra');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', 'examples-master', 'public', '3.86');
const DEST_DIR = path.join(__dirname, 'public', 'phaser-jeux');

// Liste des jeux à copier (chemin relatif depuis src/)
const JEUX_A_COPIER = [
  'games/breakout/breakout.js',
  'games/snake/part10.js',
  'games/firstgame/part10.js',
  'games/bank panic/part1.js',
  'games/coin clicker/part1.js',
  'games/minesweeper/part1.js',
  'games/card memory/part1.js',
  'games/snowmen attack/part1.js',
  'physics/arcade/asteroids.js',
  'games/emoji match/part1.js'
];

// Fichiers et dossiers communs à copier
const FICHIERS_COMMUNS = [
  'view.html',
  'build/phaser.min.js',
  'build/phaser.js',
  'css/view.css',
  'css-new/view.css'
];

const DOSSIERS_ASSETS = [
  'assets/animations',
  'assets/atlas',
  'assets/audio',
  'assets/fonts',
  'assets/games',
  'assets/loader-tests',
  'assets/particles',
  'assets/physics',
  'assets/pics',
  'assets/sprites',
  'assets/tests',
  'assets/tilemaps'
];

async function copierJeux() {
  console.log('🎮 Copie des jeux Phaser depuis examples-master...\n');

  // Vérifier que la source existe
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Le dossier source n'existe pas: ${SOURCE_DIR}`);
    console.error('Assure-toi que examples-master est au bon endroit.');
    process.exit(1);
  }

  // Créer le dossier de destination
  await fs.ensureDir(DEST_DIR);
  console.log(`✅ Dossier de destination créé: ${DEST_DIR}\n`);

  // Copier les fichiers communs
  console.log('📄 Copie des fichiers communs...');
  for (const fichier of FICHIERS_COMMUNS) {
    const src = path.join(SOURCE_DIR, fichier);
    const dest = path.join(DEST_DIR, fichier);
    
    if (fs.existsSync(src)) {
      await fs.copy(src, dest);
      console.log(`  ✓ ${fichier}`);
    } else {
      console.log(`  ⚠️  ${fichier} (non trouvé, ignoré)`);
    }
  }

  // Copier les assets nécessaires
  console.log('\n🎨 Copie des assets...');
  for (const dossier of DOSSIERS_ASSETS) {
    const src = path.join(SOURCE_DIR, dossier);
    const dest = path.join(DEST_DIR, dossier);
    
    if (fs.existsSync(src)) {
      await fs.copy(src, dest, { overwrite: false });
      const taille = await getTailleDossier(dest);
      console.log(`  ✓ ${dossier} (${taille})`);
    }
  }

  // Copier les jeux sélectionnés
  console.log('\n🎮 Copie des jeux sélectionnés...');
  for (const jeu of JEUX_A_COPIER) {
    const src = path.join(SOURCE_DIR, 'src', jeu);
    const dest = path.join(DEST_DIR, 'src', jeu);
    
    if (fs.existsSync(src)) {
      await fs.copy(src, dest);
      console.log(`  ✓ ${jeu}`);
    } else {
      console.log(`  ⚠️  ${jeu} (non trouvé)`);
    }
  }

  // Créer un fichier index.html personnalisé pour chaque jeu
  console.log('\n📝 Création des pages HTML pour chaque jeu...');
  await creerPagesHTML();

  const tailleFinale = await getTailleDossier(DEST_DIR);
  console.log(`\n✅ Copie terminée! Taille totale: ${tailleFinale}`);
  console.log(`📁 Emplacement: ${DEST_DIR}`);
  console.log('\n💡 Prochaine étape: mettre à jour jeuxConfig.js');
}

async function creerPagesHTML() {
  const htmlTemplate = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jeu Phaser</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
        }
        #game-container {
            max-width: 100%;
            max-height: 100vh;
        }
    </style>
    <script src="build/phaser.min.js"></script>
</head>
<body>
    <div id="game-container"></div>
    <script src="src/GAME_PATH"></script>
</body>
</html>`;

  for (let i = 0; i < JEUX_A_COPIER.length; i++) {
    const jeu = JEUX_A_COPIER[i];
    const nomFichier = `jeu-${i + 1}.html`;
    const html = htmlTemplate.replace('GAME_PATH', jeu);
    const dest = path.join(DEST_DIR, nomFichier);
    
    await fs.writeFile(dest, html);
    console.log(`  ✓ ${nomFichier} → ${path.basename(jeu)}`);
  }
}

async function getTailleDossier(dir) {
  if (!fs.existsSync(dir)) return '0 B';
  
  let taille = 0;
  const fichiers = await fs.readdir(dir, { withFileTypes: true });
  
  for (const fichier of fichiers) {
    const chemin = path.join(dir, fichier.name);
    if (fichier.isDirectory()) {
      taille += parseInt(await getTailleDossierRec(chemin));
    } else {
      const stats = await fs.stat(chemin);
      taille += stats.size;
    }
  }
  
  return formatTaille(taille);
}

async function getTailleDossierRec(dir) {
  let taille = 0;
  const fichiers = await fs.readdir(dir, { withFileTypes: true });
  
  for (const fichier of fichiers) {
    const chemin = path.join(dir, fichier.name);
    if (fichier.isDirectory()) {
      taille += parseInt(await getTailleDossierRec(chemin));
    } else {
      const stats = await fs.stat(chemin);
      taille += stats.size;
    }
  }
  
  return taille;
}

function formatTaille(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Exécution
copierJeux().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
