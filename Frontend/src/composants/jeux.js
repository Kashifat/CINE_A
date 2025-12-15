import { useState } from "react";
import "./jeux.css";

const games = [
  { name: "Candy Crush", path: "/01-Candy-Crush-Game/index.html" },
  { name: "Archery", path: "/02-Archery-Game/index.html" },
  { name: "Speed Typing", path: "/03-Speed-Typing-Game/index.html" },
  { name: "Breakout", path: "/04-Breakout-Game/index.html" },
  { name: "Minesweeper", path: "/05-Minesweeper-Game/index.html" },
  { name: "Tower Blocks", path: "/06-Tower-Blocks/index.html" },
  { name: "Ping Pong", path: "/07-Ping-Pong-Game/index.html" },
  { name: "Tetris", path: "/08-Tetris-Game/index.html" },
  { name: "Tilting Maze", path: "/09-Tilting-Maze-Game/index.html" },
  { name: "Memory Card", path: "/10-Memory-Card-Game/index.html" },
  { name: "Rock Paper Scissors", path: "/11-Rock-Paper-Scissors/index.html" },
  { name: "Type Number Guessing", path: "/12-Type-Number-Guessing-Game/index.html" },
  { name: "Tic Tac Toe", path: "/13-Tic-Tac-Toe/index.html" },
  { name: "Snake", path: "/14-Snake-Game/index.html" },
  { name: "Connect Four", path: "/15-Connect-Four-Game/index.html" },
  { name: "Insect Catch", path: "/16-Insect-Catch-Game/index.html" },
  { name: "Typing Challenge", path: "/17-Typing-Game/index.html" },
  { name: "Hangman", path: "/18-Hangman-Game/index.html" },
  { name: "Flappy Bird", path: "/19-Flappy-Bird-Game/index.html" },
  { name: "Crossy Road", path: "/20-Crossy-Road-Game/index.html" },
  { name: "2048", path: "/21-2048-Game/index.html" },
  { name: "Dice Roll Simulator", path: "/22-Dice-Roll-Simulator/index.html" },
  { name: "Shape Clicker", path: "/23-Shape-Clicker-Game/index.html" },
  { name: "Typing Game", path: "/24-Typing-Game/index.html" },
  { name: "Speak Number Guessing", path: "/25-Speak-Number-Guessing-Game/index.html" },
  { name: "Fruit Slicer", path: "/26-Fruit-Slicer-Game/index.html" },
  { name: "Quiz Game", path: "/27-Quiz-Game/index.html" },
  { name: "Emoji Catcher", path: "/28-Emoji-Catcher-Game/index.html" },
  { name: "Whack A Mole", path: "/29-Whack-A-Mole-Game/index.html" },
  { name: "Simon Says", path: "/30-Simon-Says-Game/index.html" },
];

export default function Jeux() {
  const [currentGame, setCurrentGame] = useState(null);

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
