import React, { useEffect, useRef, useState } from 'react';
import CarteVideo from '../composants/CarteVideo';
import { useAuth } from '../contexte/AuthContext';
import { envoyerMessage, obtenirSuggestions, verifierStatut } from '../services/chatbotService';
import './Chatbot.css';

const Chatbot = () => {
  const { utilisateur } = useAuth();

  const [serviceStatus, setServiceStatus] = useState('offline');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Salut ! Je suis CinéaBot. Pose-moi une question ou cherche un film.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'Recommande-moi un film d\'action',
    'Quels sont les films populaires ?',
    'Trouve-moi une série comédie',
  ]);
  const [error, setError] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [filmsResults, setFilmsResults] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Vérifier le statut du service et charger les suggestions dynamiques
  useEffect(() => {
    const init = async () => {
      try {
        const status = await verifierStatut();
        setServiceStatus(status?.status === 'OK' ? 'online' : 'offline');
      } catch {
        setServiceStatus('offline');
      }

      try {
        const suggs = await obtenirSuggestions('home');
        if (Array.isArray(suggs) && suggs.length) {
          setSuggestions(suggs);
        }
      } catch {
        // garder les suggestions par défaut
      }
    };
    init();
  }, []);

  const pushMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text) return;

    setError(null);
    setIsLoading(true);

    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: text,
    };
    pushMessage(userMsg);
    setInputMessage('');

    try {
      const resp = await envoyerMessage(text, utilisateur?.id_utilisateur || null, { page: 'chatbot' });
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: resp?.answer || "Je n'ai pas compris, reformulez s'il vous plaît.",
        intent: resp?.intent,
      };
      pushMessage(botMsg);

      // Mettre à jour les résultats films si fournis
      const ui = resp?.ui_data;
      if (ui && ui.type === 'films' && Array.isArray(ui.items)) {
        setFilmsResults(ui.items);
      } else {
        setFilmsResults([]);
      }
    } catch (err) {
      console.error(err);
      setError("Le service chatbot est indisponible. Réessayez plus tard.");
      // Fallback message hors ligne
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Je cherche ça pour toi... (démo hors ligne)",
      };
      pushMessage(botMsg);
      setFilmsResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="chatbot-container">
      <div className="service-status">
        <div className={`status-indicator ${serviceStatus}`}></div>
        <span>
          {serviceStatus === 'online' ? 'CinéaBot en ligne' : 'CinéaBot hors ligne'}
        </span>
      </div>

      <div className="chatbot-main">
        <div className="chat-zone">
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'bot' ? (
                    <span>🤖</span>
                  ) : utilisateur?.photo_profil ? (
                    <img
                      src={
                        utilisateur.photo_profil.startsWith('http')
                          ? utilisateur.photo_profil
                          : `http://localhost:5002/media/${utilisateur.photo_profil}`
                      }
                      alt={utilisateur?.nom || 'Utilisateur'}
                      className="user-avatar"
                    />
                  ) : (
                    <span>👤</span>
                  )}
                </div>

                <div className="message-content">
                  {message.content}
                  {message.intent && message.type === 'bot' && (
                    <div className="message-intent">
                      {message.intent.replace('_', ' ')}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="loading-message">
                <div className="spinner"></div>
                <span>CinéaBot réfléchit…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-zone">
            {suggestions.length > 0 && (
              <div className="chat-suggestions">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="chat-input-form">
              <input
                type="text"
                className="chat-input"
                placeholder="Posez une question ou recherchez un film…"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? 'Envoi…' : 'Envoyer'}
              </button>
            </form>
          </div>
        </div>

        {filmsResults.length > 0 && (
          <div className="films-results">
            <div className="films-results-header">
              <h2>Résultats</h2>
              <span className="results-count">
                {filmsResults.length} résultat{filmsResults.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="films-grid">
              {filmsResults.map((film) => (
                <CarteVideo
                  key={film.id_film || film.id_serie}
                  film={film}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
