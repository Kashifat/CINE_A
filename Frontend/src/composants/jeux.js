import { useState } from "react";
import "./jeux.css";
import { games as CONFIG_GAMES } from "./jeuxConfig";

export default function Jeux() {
  const [currentGame, setCurrentGame] = useState(null);
  const limit = Number(process.env.REACT_APP_JEUX_LIMIT || CONFIG_GAMES.length);
  const games = CONFIG_GAMES.slice(0, Math.max(0, limit));

  return (
    <div className="jeux-container">
      <h1 className="jeux-title">Mini-Jeux</h1>

      {!currentGame && (
        <div className="jeux-grid">
          {games.map((game) => (
            <button
              key={game.name}
              className="jeux-card"
              onClick={() => setCurrentGame(game.path)}
            >
              {game.image ? (
                <img src={game.image} alt={game.name} className="jeux-card-image" />
              ) : null}
              <div className="jeux-card-name">{game.name}</div>
            </button>
          ))}
        </div>
      )}

      {currentGame && (
        <div className="jeux-player">
          <button
            className="jeux-back-arrow"
            onClick={() => setCurrentGame(null)}
            title="Retour aux jeux"
          >
            ← Retour
          </button>

          <iframe
            src={currentGame}
            title="Mini Jeu"
            className="jeux-iframe"
          />
        </div>
      )}
    </div>
  );
}