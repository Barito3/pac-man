import { useState, useEffect } from 'react';
import Game from './components/Game';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // Reset the game state
  const resetGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setGameStarted(true);
  };

  // Handle game over
  useEffect(() => {
    if (lives <= 0) {
      setGameOver(true);
      setGameStarted(false);
    }
  }, [lives]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-maze-black p-4">
      <h1 className="text-4xl font-bold text-pacman-yellow mb-6">PAC-MAN</h1>
      
      {!gameStarted && !gameOver && (
        <div className="flex flex-col items-center">
          <p className="text-white mb-6 text-center">Use arrow keys to navigate Pac-Man through the maze</p>
          <button 
            onClick={resetGame}
            className="bg-pacman-yellow text-maze-black px-6 py-3 rounded-full font-bold text-xl hover:bg-yellow-400 transition-colors"
          >
            Start Game
          </button>
        </div>
      )}

      {gameStarted && (
        <div className="w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white">Score: <span className="text-pacman-yellow">{score}</span></div>
            <div className="text-white">Lives: <span className="text-pacman-yellow">{lives}</span></div>
          </div>
          <Game 
            onScoreUpdate={(points) => setScore(prev => prev + points)} 
            onLifeLost={() => setLives(prev => prev - 1)}
          />
        </div>
      )}

      {gameOver && (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl text-pacman-red mb-4">Game Over</h2>
          <p className="text-white mb-2">Final Score: <span className="text-pacman-yellow">{score}</span></p>
          <button 
            onClick={resetGame}
            className="bg-pacman-yellow text-maze-black px-6 py-3 rounded-full font-bold mt-4 hover:bg-yellow-400 transition-colors"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App; 