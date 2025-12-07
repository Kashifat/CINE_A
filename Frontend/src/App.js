import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexte/AuthContext';
import './App.css';

// Pages
import Accueil from './pages/Accueil';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Films from './pages/Films';
import Lecture from './pages/Lecture';
import Serie from './pages/Serie';
import Live from './pages/Live';
import Communaute from './pages/Communaute';
import Profil from './pages/Profil';
import Admin from './pages/Admin';

// Composants
import BarreNavigation from './composants/BarreNavigation';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <BarreNavigation />
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/films" element={<Films />} />
            <Route path="/lecture/:id" element={<Lecture />} />
            <Route path="/serie/:id" element={<Serie />} />
            <Route path="/live" element={<Live />} />
            <Route path="/communaute" element={<Communaute />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/dashboard" element={<Navigate to="/profil" />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
