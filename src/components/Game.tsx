import React, { useEffect, useState, useRef } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import Cell from './Cell';
import Pacman from './Pacman';
import Ghost from './Ghost';
import { Direction } from '@/lib/types';

interface GameProps {
  onScoreUpdate: (points: number) => void;
  onLifeLost: () => void;
}

const Game: React.FC<GameProps> = ({ onScoreUpdate, onLifeLost }) => {
  // Set up state for cell size and animation
  const [cellSize, setCellSize] = useState(20);
  const [debugMode, setDebugMode] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize the game engine
  const { gameState, resetGame, debugMovePacman } = useGameEngine({ onScoreUpdate, onLifeLost });
  const { level, pacman, ghosts, powerMode } = gameState;

  // Enhanced debug logs
  console.log('Pacman position:', JSON.stringify(pacman.position));
  console.log('Ghosts:', ghosts.map(g => ({ id: g.id, type: g.type, pos: g.position })));
  console.log('Cell size:', cellSize);
  console.log('Container dimensions:', 
    containerRef.current ? 
    `width: ${containerRef.current.clientWidth}, height: ${containerRef.current.clientHeight}` : 
    'not measured yet');

  // Calculate cell size based on available space
  useEffect(() => {
    const handleResize = () => {
      const gameContainer = containerRef.current;
      if (!gameContainer) return;

      const containerWidth = gameContainer.clientWidth;
      const mapWidth = level.map[0].length;
      
      // Calculate cell size based on available width
      const newCellSize = Math.floor(containerWidth / mapWidth);
      setCellSize(newCellSize);
      console.log('New cell size calculated:', newCellSize);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [level.map]);

  // Debug function to move Pac-Man manually
  const handleDebugMove = (direction: Direction) => {
    if (debugMovePacman) {
      debugMovePacman(direction);
    }
  };

  return (
    <div>
      {debugMode && (
        <div className="mb-4 flex gap-2 justify-center">
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded font-bold"
            onClick={() => resetGame()}
          >
            Reset Game
          </button>
        </div>
      )}
      <div 
        ref={containerRef}
        id="game-container" 
        className="relative w-full bg-maze-black border-8 border-maze-blue overflow-hidden"
        style={{ 
          minHeight: '500px', 
          height: `${level.map.length * cellSize}px`,
          boxShadow: '0 0 20px rgba(0, 191, 255, 0.7)',
          position: 'relative'
        }}
      >
        {/* Visual marker for initial Pacman position */}
        <div 
          className="absolute z-20 bg-red-500 rounded-full opacity-50" 
          style={{ 
            width: cellSize/2, 
            height: cellSize/2, 
            left: 9 * cellSize + cellSize/4, 
            top: 15 * cellSize + cellSize/4,
          }}
        ></div>

        {/* Render map cells */}
        {level.map.map((row, y) => (
          <div className="flex" key={`row-${y}`}>
            {row.map((cell, x) => (
              <Cell key={`cell-${x}-${y}`} type={cell} size={cellSize} />
            ))}
          </div>
        ))}

        {/* Render Pac-Man */}
        <Pacman 
          position={pacman.position} 
          direction={pacman.direction}
          size={cellSize}
          isEating={pacman.isEating}
        />

        {/* Render Ghosts */}
        {ghosts.map(ghost => (
          <Ghost 
            key={ghost.id}
            type={ghost.type}
            position={ghost.position}
            size={cellSize}
            mode={ghost.mode}
          />
        ))}
      </div>

      {debugMode && (
        <div className="mt-4 text-center text-sm">
          <p>Pacman position: x={pacman.position.x.toFixed(2)}, y={pacman.position.y.toFixed(2)}</p>
          <p>Direction: {Direction[pacman.direction]}</p>
        </div>
      )}
    </div>
  );
};

export default Game; 