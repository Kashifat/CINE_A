/**
 * SCRIPT DE TEST - Vérification complète du backend
 * 
 * Commandes pour tester manuellement dans le navigateur (F12 → Console):
 * 
 * 1. Tester l'authentification:
 *    - Copier la fonction testAuth() ci-dessous
 *    - Exécuter: testAuth()
 * 
 * 2. Tester les films:
 *    - Exécuter: testFilms()
 * 
 * 3. Tester les favoris:
 *    - Exécuter: testFavoris()
 * 
 * 4. Exécuter tous les tests:
 *    - Exécuter: runAllTests()
 */

// ===== VARIABLES GLOBALES =====
let token = null;
let userId = null;
let adminId = null;

// ===== UTILITAIRES =====
const API_BASE = 'http://localhost:5000'; // Port AUTH
const API_FILMS = 'http://localhost:5002'; // Port FILMS
const API_AVIS = 'http://localhost:5003'; // Port AVIS

const log = (title, data, status = 'info') => {
  const colors = {
    success: 'color: green; font-weight: bold;',
    error: 'color: red; font-weight: bold;',
    info: 'color: blue; font-weight: bold;',
    warning: 'color: orange; font-weight: bold;'
  };
  console.log(`%c${title}`, colors[status], data);
};

const request = async (method, url, data = null, useToken = true) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (useToken && token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!response.ok) {
      log(`ERREUR ${method} ${url}`, result, 'error');
      return { success: false, status: response.status, data: result };
    }
    
    log(`SUCCES ${method} ${url}`, result, 'success');
    return { success: true, status: response.status, data: result };
  } catch (error) {
    log(`ATTENTION ${method} ${url}`, error.message, 'error');
    return { success: false, error: error.message };
  }
};

// ===== TESTS D'AUTHENTIFICATION =====
async function testAuth() {
  console.clear();
  log('TESTS D\'AUTHENTIFICATION', '━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 1. Inscription d'un user test
  log('Inscription utilisateur', 'En cours...');
  let inscResult = await request('POST', `${API_BASE}/utilisateurs/inscription`, {
    nom: `TestUser_${Date.now()}`,
    courriel: `test_${Date.now()}@example.com`,
    mot_de_passe: 'TestPass123'
  }, false);
  
  if (!inscResult.success) {
    log('Inscription echouee', inscResult.data);
    return;
  }
  
  // 2. Connexion
  log('Connexion', 'En cours...');
  let connResult = await request('POST', `${API_BASE}/utilisateurs/connexion`, {
    courriel: inscResult.data.utilisateur.courriel,
    mot_de_passe: 'TestPass123'
  }, false);
  
  if (!connResult.success) {
    log('Connexion echouee', connResult.data);
    return;
  }
  
  token = connResult.data.token;
  userId = connResult.data.utilisateur.id_utilisateur;
  
  log('Token reçu', `ID User: ${userId}`);
  log('Token stocké', `${token.substring(0, 20)}...`);
  
  // 3. Vérifier le profil
  log('Profil utilisateur', 'En cours...');
  let profResult = await request('GET', `${API_BASE}/utilisateurs/${userId}/profil`, null, true);
  
  if (profResult.success) {
    log('Profil valide', {
      nom: profResult.data.nom,
      courriel: profResult.data.courriel,
      role: profResult.data.role || 'user'
    });
  }
}

// ===== TESTS DES FILMS =====
async function testFilms() {
  console.clear();
  log('TESTS DES FILMS', '━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 1. Lister les films
  log('Lister les films', 'En cours...');
  let filmResult = await request('GET', `${API_FILMS}/contenus/films`, null, false);
  
  if (!filmResult.success) {
    log('Films indisponibles', filmResult.data);
    return;
  }
  
  const films = filmResult.data.films || [];
  log(`Films chargés`, `${films.length} films trouvés`);
  
  if (films.length > 0) {
    const film = films[0];
    log('Premier film:', {
      id: film.id_film,
      titre: film.titre,
      categorie: film.categorie,
      note: film.note
    });
    
    // 2. Détails du film
    log('Détails du film', `Film ID: ${film.id_film}`);
    let detailResult = await request('GET', `${API_FILMS}/contenus/films/${film.id_film}`, null, false);
    
    if (detailResult.success) {
      log('Détails chargés', {
        titre: detailResult.data.titre,
        duree: detailResult.data.duree,
        description: detailResult.data.description?.substring(0, 50) + '...'
      });
    }
  }
  
  // 3. Catégories
  log('Catégories disponibles', 'En cours...');
  let catResult = await request('GET', `${API_FILMS}/contenus/categories`, null, false);
  
  if (catResult.success) {
    log('Catégories chargées', `${catResult.data.categories?.length} catégories`);
  }
}

// ===== TESTS DES FAVORIS =====
async function testFavoris() {
  console.clear();
  log('TESTS DES FAVORIS', '━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!token || !userId) {
    log('Pas de session', 'Exécutez testAuth() d\'abord', 'warning');
    return;
  }
  
  // 1. Lister les favoris existants
  log('Lister les favoris', `User ID: ${userId}`);
  let listResult = await request('GET', `${API_FILMS}/contenus/favoris/${userId}`, null, true);
  
  if (listResult.success) {
    log('Favoris chargés', {
      films: listResult.data.films?.length || 0,
      episodes: listResult.data.episodes?.length || 0
    });
  }
  
  // 2. Récupérer un film pour le tester
  log('Récupérer un film test', 'En cours...');
  let filmResult = await request('GET', `${API_FILMS}/contenus/films`, null, false);
  
  if (!filmResult.success || !filmResult.data.films?.length) {
    log('Aucun film disponible', 'Créez des films d\'abord', 'error');
    return;
  }
  
  const filmId = filmResult.data.films[0].id_film;
  
  // 3. Ajouter aux favoris
  log('Ajouter aux favoris', `Film ID: ${filmId}`);
  let addResult = await request('POST', `${API_FILMS}/contenus/favoris`, {
    id_utilisateur: userId,
    id_film: filmId,
    id_episode: null
  }, true);
  
  if (addResult.success) {
    log('Favori ajouté', 'Film maintenant en favori');
    
    // 4. Vérifier que c'est dans les favoris
    log('Vérifier favori', 'En cours...');
    let verifyResult = await request('GET', `${API_FILMS}/contenus/favoris/${userId}`, null, true);
    
    if (verifyResult.success && verifyResult.data.films?.some(f => f.id_film === filmId)) {
      log('Film confirmé en favoris', 'L\'ajout a fonctionné');
      
      // 5. Retirer des favoris
      log('Retirer des favoris', 'En cours...');
      let removeResult = await request('DELETE', `${API_FILMS}/contenus/favoris`, {
        id_utilisateur: userId,
        id_film: filmId,
        id_episode: null
      }, true);
      
      if (removeResult.success) {
        log('Favori retiré', 'Film retiré avec succès');
      }
    }
  } else if (addResult.status === 404) {
    log('⚠️ Utilisateur inexistant', `L'utilisateur ${userId} n'existe pas en DB`, 'warning');
  }
}

// ===== TEST DES AVIS =====
async function testAvis() {
  console.clear();
  log('⭐ TESTS DES AVIS', '━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (!token || !userId) {
    log('⚠️ Pas de session', 'Exécutez testAuth() d\'abord', 'warning');
    return;
  }
  
  // 1. Récupérer un film
  log('1️⃣ Récupérer un film test', 'En cours...');
  let filmResult = await request('GET', `${API_FILMS}/contenus/films`, null, false);
  
  if (!filmResult.success || !filmResult.data.films?.length) {
    log('❌ Aucun film disponible', 'Créez des films d\'abord', 'error');
    return;
  }
  
  const filmId = filmResult.data.films[0].id_film;
  
  // 2. Ajouter un avis
  log('2️⃣ Ajouter un avis', `Film ID: ${filmId}`);
  let avisResult = await request('POST', `${API_AVIS}/avis`, {
    id_utilisateur: userId,
    id_film: filmId,
    note: 4,
    commentaire: 'Très bon film! ✨'
  }, true);
  
  if (avisResult.success) {
    log('✅ Avis ajouté', 'Avis créé avec succès');
    
    // 3. Lister les avis du film
    log('3️⃣ Avis du film', 'En cours...');
    let listResult = await request('GET', `${API_AVIS}/avis/film/${filmId}`, null, true);
    
    if (listResult.success) {
      log('✅ Avis chargés', `${listResult.data.length} avis trouvés`);
    }
  }
}

// ===== TOUS LES TESTS =====
async function runAllTests() {
  console.clear();
  log('🚀 EXÉCUTION COMPLÈTE DES TESTS', '═══════════════════════════════');
  
  await testAuth();
  console.log('\n');
  
  await testFilms();
  console.log('\n');
  
  await testFavoris();
  console.log('\n');
  
  await testAvis();
  console.log('\n');
  
  log('✅ TOUS LES TESTS TERMINÉS', '═══════════════════════════════', 'success');
}

// ===== EXPORT POUR UTILISATION EN CONSOLE =====
if (typeof window !== 'undefined') {
  window.testAuth = testAuth;
  window.testFilms = testFilms;
  window.testFavoris = testFavoris;
  window.testAvis = testAvis;
  window.runAllTests = runAllTests;
  
  console.log('🧪 Tests de CineA chargés!');
  console.log('Commandes disponibles:');
  console.log('  - testAuth()      : Tester authentification');
  console.log('  - testFilms()     : Tester films');
  console.log('  - testFavoris()   : Tester favoris');
  console.log('  - testAvis()      : Tester avis');
  console.log('  - runAllTests()   : Exécuter tous les tests');
}

export { testAuth, testFilms, testFavoris, testAvis, runAllTests };
