import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexte/AuthContext';
import { FavorisProvider } from './contexte/FavorisContext';
import { setAuthContext } from './services/axiosConfig';
import notificationService from './services/notificationService';
import './App.css';

// Pages
import Accueil from './pages/Accueil';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Films from './pages/Films';
import Lecture from './pages/Lecture';
import Serie from './pages/Serie';
import Communaute from './pages/Communaute';
import Profil from './pages/Profil';
import Admin from './pages/Admin';
import BandeAnnonce from './pages/BandeAnnonce';
import TV from './pages/TV';
import Chatbot from './pages/Chatbot';
import JeuxPage from './pages/jeux';
import MaListe from './pages/MaListe';

// Composants
import BarreNavigation from './composants/BarreNavigation';
import ToastContainer from './composants/ToastContainer';

// Composant pour protéger les routes usagers (non-admin)
function UserRoute({ children }) {
  const { utilisateur, estAdmin } = useAuth();
  
  // Si c'est un admin, le rediriger vers /admin
  if (utilisateur && estAdmin()) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
}

// Composant pour protéger les routes admin
function AdminRoute({ children }) {
  const { estConnecte, estAdmin } = useAuth();
  
  // Si pas connecté, rediriger vers connexion
  if (!estConnecte()) {
    return <Navigate to="/connexion" replace />;
  }
  
  // Si ce n'est pas un admin, rediriger vers accueil
  if (!estAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppRoutes() {
  const authContext = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Initialiser le contexte auth pour axiosConfig
  useEffect(() => {
    setAuthContext(authContext);
  }, [authContext]);

  useEffect(() => {
    // Enregistrer le callback pour les notifications
    notificationService.setNotificationCallback((notification) => {
      setNotifications(prev => [...prev, notification]);
    });
  }, []);

  const handleRemoveNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="App">
      <BarreNavigation />
      <ToastContainer notifications={notifications} onRemove={handleRemoveNotification} />
      <Routes>
        {/* Routes publiques */}
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        
        {/* Routes usager uniquement (bloquées pour les admins) */}
        <Route path="/" element={<UserRoute><Accueil /></UserRoute>} />
        <Route path="/films" element={<UserRoute><Films /></UserRoute>} />
        <Route path="/lecture/:id" element={<UserRoute><Lecture /></UserRoute>} />
        <Route path="/serie/:id" element={<UserRoute><Serie /></UserRoute>} />
        <Route path="/bande-annonce/:type/:id" element={<UserRoute><BandeAnnonce /></UserRoute>} />
        <Route path="/tv" element={<UserRoute><TV /></UserRoute>} />
        <Route path="/ma-liste" element={<UserRoute><MaListe /></UserRoute>} />
        <Route path="/jeux" element={<UserRoute><JeuxPage /></UserRoute>} />
        <Route path="/communaute" element={<UserRoute><Communaute /></UserRoute>} />
        <Route path="/profil" element={<UserRoute><Profil /></UserRoute>} />
        <Route path="/chatbot" element={<UserRoute><Chatbot /></UserRoute>} />
        
        {/* Routes admin uniquement */}
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        
        {/* Redirection legacy */}
        <Route path="/dashboard" element={<Navigate to="/profil" />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {

  
  return (
    <AuthProvider>
      <FavorisProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </Router>
      </FavorisProvider>
    </AuthProvider>
  );
}

export default App;
