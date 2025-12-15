import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexte/AuthContext';
import { envoyerMessage, obtenirSuggestions, verifierStatut } from '../services/chatbotService';
import CarteVideo from '../composants/CarteVideo';
import './Chatbot.css';

const Chatbot = () => {
  const { utilisateur } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [filmsResults, setFilmsResults] = useState([]);
  const [serviceStatus, setServiceStatus] = useState('checking');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll automatique vers le bas des messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Vérifier le statut du service au chargement
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await verifierStatut();
        setServiceStatus(status.status === 'OK' ? 'online' : 'offline');
      } catch (error) {
        setServiceStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Vérifier toutes les 30s

    return () => clearInterval(interval);
  }, []);

  // Charger les suggestions au démarrage
  useEffect(() => {
    const loadSuggestions = async () => {
      const sug = await obtenirSuggestions('films');
      setSuggestions(sug);
    };

    loadSuggestions();

    // Message de bienvenue
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        content: "Bonjour ! Je suis CinéaBot, votre assistant pour découvrir des films et séries. Comment puis-je vous aider ? 🎬",
        intent: 'greeting',
      },
    ]);
  }, []);

  // Gérer l'envoi d'un message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Ajouter le message utilisateur
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
    };
    setMessages((prev) => [...prev, newUserMessage]);

    setIsLoading(true);

    try {
      // Envoyer au chatbot
      const response = await envoyerMessage(
        userMessage,
        utilisateur?.id_utilisateur,
        { page: 'chatbot' }
      );

      // Ajouter la réponse du bot
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.answer,
        intent: response.intent,
      };
      setMessages((prev) => [...prev, botMessage]);

      // Si des films sont retournés, les afficher
      if (response.ui_data && response.ui_data.type === 'films' && response.ui_data.items) {
        setFilmsResults(response.ui_data.items);
      } else {
        setFilmsResults([]);
      }

      // Mettre à jour les suggestions si disponibles
      if (response.intent) {
        const newSuggestions = await obtenirSuggestions('films');
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Erreur chatbot:', error);
      setError(error.message || 'Une erreur est survenue. Le service chatbot est peut-être indisponible.');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants.",
        intent: 'error',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer un clic sur une suggestion
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="chatbot-container">
      {/* Statut du service */}
      <div className="service-status">
        <div className={`status-indicator ${serviceStatus}`}></div>
        <span>Chatbot {serviceStatus === 'online' ? 'en ligne' : 'hors ligne'}</span>
      </div>

      {/* En-tête */}
      <div className="chatbot-header">
        <h1>
          CinéaBot
        </h1>
        <p>Votre assistant intelligent pour découvrir des films et séries</p>
      </div>

      <div className="chatbot-main">
        {/* Zone de chat */}
        <div className="chat-zone">
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`chat-message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'bot' ? (
                    'BOT'
                  ) : utilisateur?.photo_profil ? (
                    <img 
                      src={utilisateur.photo_profil.startsWith('http') 
                        ? utilisateur.photo_profil 
                        : `http://localhost:5002/media/${utilisateur.photo_profil}`
                      }
                      alt={utilisateur?.nom}
                      className="user-avatar"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  {message.type === 'user' && !utilisateur?.photo_profil && (
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
                <span>CinéaBot réfléchit...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Zone de saisie */}
          <div className="chat-input-zone">
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="chat-suggestions">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                  >
                    💡 {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {/* Formulaire de saisie */}
            <form onSubmit={handleSubmit} className="chat-input-form">
              <input
                type="text"
                className="chat-input"
                placeholder="Posez une question ou recherchez un film..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? '⏳' : '📤'} Envoyer
              </button>
            </form>
          </div>
        </div>

        {/* Résultats de films */}
        {filmsResults.length > 0 && (
          <div className="films-results">
            <div className="films-results-header">
              <h2>
                🎬 Résultats de recherche
              </h2>
              <span className="results-count">
                {filmsResults.length} film{filmsResults.length > 1 ? 's' : ''} trouvé{filmsResults.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="films-grid">
              {filmsResults.map((film) => (
                <CarteVideo key={film.id_film || film.id_serie} film={film} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
