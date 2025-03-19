import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  GameState, Direction, EntityType, Position, Ghost, GhostMode, GhostType, Level 
} from '@/lib/types';
import { 
  isValidPosition, getNextPosition, isSamePosition, getBestDirection, 
  getRandomDirection, checkCollision, countDotsRemaining, getValidDirections
} from '@/lib/utils';
import { 
  level1, initialGhosts, initialPacmanPosition, ghostModeCycle 
} from '@/lib/gameData';
import { useKeyboardControls } from './useKeyboardControls';

interface UseGameEngineProps {
  onScoreUpdate: (points: number) => void;
  onLifeLost: () => void;
}

export function useGameEngine({ onScoreUpdate, onLifeLost }: UseGameEngineProps) {
  // Initialize game state
  const [gameState, setGameState] = useState<GameState>({
    level: level1,
    pacman: {
      position: initialPacmanPosition,
      direction: Direction.NONE,
      nextDirection: Direction.NONE,
      speed: level1.pacmanSpeed,
      isEating: false,
    },
    ghosts: initialGhosts,
    score: 0,
    lives: 3,
    dotsRemaining: countDotsRemaining(level1),
    powerMode: false,
    powerModeTimer: null,
  });

  // Set up animation frame reference
  const animationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const ghostModeTimerRef = useRef<number>(0);
  const currentGhostModeIndexRef = useRef<number>(0);

  // Get keyboard controls
  const { 
    direction, 
    nextDirection, 
    updateDirection, 
    clearNextDirection 
  } = useKeyboardControls();

  // Reset positions after life lost
  const resetPositions = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      pacman: {
        ...prev.pacman,
        position: initialPacmanPosition,
        direction: Direction.NONE,
        nextDirection: Direction.NONE,
      },
      ghosts: initialGhosts,
      powerMode: false,
      powerModeTimer: null,
    }));
    clearNextDirection();
    updateDirection(Direction.NONE);
    ghostModeTimerRef.current = 0;
    currentGhostModeIndexRef.current = 0;
  }, [clearNextDirection, updateDirection]);

  // Update map cell after Pac-Man eats something
  const updateMapCell = useCallback((position: Position, newValue: EntityType) => {
    // Ensure position coordinates are integers
    const x = Math.round(position.x);
    const y = Math.round(position.y);
    
    setGameState(prev => {
      const newMap = [...prev.level.map];
      // Check bounds before updating
      if (x >= 0 && y >= 0 && y < newMap.length && x < newMap[0].length) {
        newMap[y][x] = newValue;
      }
      
      const newLevel = {
        ...prev.level,
        map: newMap,
      };
      
      return {
        ...prev,
        level: newLevel,
        dotsRemaining: countDotsRemaining(newLevel),
      };
    });
  }, []);

  // Handle collisions with dots, power pellets, and ghosts
  const handleCollisions = useCallback(() => {
    const { pacman, level, powerMode, ghosts } = gameState;
    // Round the position to integers before accessing the map
    const x = Math.round(pacman.position.x);
    const y = Math.round(pacman.position.y);
    
    // Make sure position is within map bounds before accessing
    if (x >= 0 && y >= 0 && y < level.map.length && x < level.map[0].length) {
      const cell = level.map[y][x];

      // Handle dot collection
      if (cell === EntityType.DOT) {
        updateMapCell({x, y}, EntityType.EMPTY);
        onScoreUpdate(level.dotPoints);
      }

      // Handle power pellet collection
      if (cell === EntityType.POWER_PELLET) {
        updateMapCell({x, y}, EntityType.EMPTY);
        onScoreUpdate(level.powerPelletPoints);
        
        // Enable power mode
        setGameState(prev => ({
          ...prev,
          powerMode: true,
          powerModeTimer: level.frightDuration,
          ghosts: prev.ghosts.map(ghost => ({
            ...ghost,
            mode: GhostMode.FRIGHTENED,
            direction: getOppositeDirection(ghost.direction),
          })),
        }));
      }
    }

    // Check for ghost collisions with improved detection
    for (const ghost of ghosts) {
      if (checkCollision(pacman.position, ghost.position)) {
        if (powerMode && ghost.mode === GhostMode.FRIGHTENED) {
          // Pac-Man eats ghost in power mode
          onScoreUpdate(level.ghostPoints);
          setGameState(prev => ({
            ...prev,
            ghosts: prev.ghosts.map(g => 
              g.id === ghost.id
                ? { 
                    ...g, 
                    position: g.homePosition,
                    mode: GhostMode.FRIGHTENED,  // Keep frightened but send back home
                  }
                : g
            ),
          }));
        } else if (ghost.mode !== GhostMode.FRIGHTENED) {
          // Ghost eats Pac-Man if not in frightened mode
          onLifeLost();
          resetPositions();
          return;
        }
      }
    }
  }, [gameState, onLifeLost, onScoreUpdate, resetPositions, updateMapCell]);

  // Get ghost target based on type and current mode
  const getGhostTarget = useCallback((ghost: Ghost): Position => {
    const { pacman, ghosts } = gameState;
    const pacmanPos = pacman.position;
    const pacmanDir = pacman.direction;

    // In frightened mode, choose random target
    if (ghost.mode === GhostMode.FRIGHTENED) {
      return {
        x: Math.floor(Math.random() * level1.map[0].length),
        y: Math.floor(Math.random() * level1.map.length),
      };
    }

    // In scatter mode, return to home corner
    if (ghost.mode === GhostMode.SCATTER) {
      return ghost.targetPosition;
    }

    // In chase mode, each ghost has different targeting strategy
    switch (ghost.type) {
      case GhostType.BLINKY: // Direct chase
        return pacmanPos;
        
      case GhostType.PINKY: // Targets 4 tiles ahead of Pac-Man
        let targetX = pacmanPos.x;
        let targetY = pacmanPos.y;
        
        // Calculate position 4 tiles ahead of Pac-Man
        switch (pacmanDir) {
          case Direction.UP:
            targetY -= 4;
            break;
          case Direction.RIGHT:
            targetX += 4;
            break;
          case Direction.DOWN:
            targetY += 4;
            break;
          case Direction.LEFT:
            targetX -= 4;
            break;
        }
        
        return { x: targetX, y: targetY };
        
      case GhostType.INKY: // Uses Blinky's position
        const blinky = ghosts.find(g => g.type === GhostType.BLINKY);
        if (!blinky) return pacmanPos;
        
        // Calculate position 2 tiles ahead of Pac-Man
        let aheadX = pacmanPos.x;
        let aheadY = pacmanPos.y;
        
        switch (pacmanDir) {
          case Direction.UP:
            aheadY -= 2;
            break;
          case Direction.RIGHT:
            aheadX += 2;
            break;
          case Direction.DOWN:
            aheadY += 2;
            break;
          case Direction.LEFT:
            aheadX -= 2;
            break;
        }
        
        // Calculate vector from Blinky to this position and double it
        const vectorX = aheadX - blinky.position.x;
        const vectorY = aheadY - blinky.position.y;
        
        return {
          x: aheadX + vectorX,
          y: aheadY + vectorY,
        };
        
      case GhostType.CLYDE: // Alternates between chase and scatter
        // If Clyde is far from Pac-Man (> 8 tiles), chase; otherwise, scatter
        const distance = Math.sqrt(
          Math.pow(pacmanPos.x - ghost.position.x, 2) +
          Math.pow(pacmanPos.y - ghost.position.y, 2)
        );
        
        return distance > 8 ? pacmanPos : ghost.targetPosition;
        
      default:
        return pacmanPos;
    }
  }, [gameState]);

  // Get opposite direction
  const getOppositeDirection = (dir: Direction): Direction => {
    switch (dir) {
      case Direction.UP: return Direction.DOWN;
      case Direction.RIGHT: return Direction.LEFT;
      case Direction.DOWN: return Direction.UP;
      case Direction.LEFT: return Direction.RIGHT;
      default: return Direction.NONE;
    }
  };

  // Update ghosts based on their AI behaviors
  const updateGhosts = useCallback((deltaTime: number) => {
    setGameState(prev => {
      const updatedGhosts = prev.ghosts.map(ghost => {
        // Calculate movement based on speed and delta time
        const moveAmount = (ghost.speed * deltaTime) / 1000;
        
        // Get the next position in current direction
        const nextPos = getNextPosition(ghost.position, ghost.direction);
        const willHitWall = !isValidPosition(nextPos, prev.level, true);
        
        // Check if we need to change direction
        if (willHitWall || ghost.direction === Direction.NONE) {
          // Get target position based on ghost type and mode
          const targetPos = getGhostTarget(ghost);
          
          // Choose new direction
          let newDirection;
          if (ghost.mode === GhostMode.FRIGHTENED) {
            // In frightened mode, choose a random valid direction
            const validDirs = getValidDirections(ghost.position, prev.level, true);
            newDirection = validDirs[Math.floor(Math.random() * validDirs.length)];
          } else {
            // Use pathfinding to move toward target
            newDirection = getBestDirection(ghost.position, targetPos, prev.level, ghost.direction);
          }
          
          // If still no valid direction, try random
          if (newDirection === Direction.NONE) {
            const validDirs = getValidDirections(ghost.position, prev.level, true);
            if (validDirs.length > 0) {
              newDirection = validDirs[Math.floor(Math.random() * validDirs.length)];
            }
          }
          
          // Apply movement in new direction
          let newX = ghost.position.x;
          let newY = ghost.position.y;
          
          switch (newDirection) {
            case Direction.UP:
              newY -= moveAmount;
              break;
            case Direction.RIGHT:
              newX += moveAmount;
              break;
            case Direction.DOWN:
              newY += moveAmount;
              break;
            case Direction.LEFT:
              newX -= moveAmount;
              break;
          }
          
          return {
            ...ghost,
            position: { x: newX, y: newY },
            direction: newDirection,
          };
        }
        
        // Continue moving in current direction
        let newX = ghost.position.x;
        let newY = ghost.position.y;
        
        switch (ghost.direction) {
          case Direction.UP:
            newY -= moveAmount;
            break;
          case Direction.RIGHT:
            newX += moveAmount;
            break;
          case Direction.DOWN:
            newY += moveAmount;
            break;
          case Direction.LEFT:
            newX -= moveAmount;
            break;
        }
        
        return {
          ...ghost,
          position: { x: newX, y: newY },
        };
      });
      
      return {
        ...prev,
        ghosts: updatedGhosts,
      };
    });
  }, [getGhostTarget]);

  // Update ghost modes based on timer
  const updateGhostModes = useCallback((deltaTime: number) => {
    if (gameState.powerMode) return; // Don't change modes during power mode
    
    ghostModeTimerRef.current += deltaTime;
    
    const currentMode = ghostModeCycle[currentGhostModeIndexRef.current];
    
    if (ghostModeTimerRef.current >= currentMode.duration) {
      // Move to next mode in cycle
      ghostModeTimerRef.current = 0;
      currentGhostModeIndexRef.current = 
        (currentGhostModeIndexRef.current + 1) % ghostModeCycle.length;
      
      const newMode = ghostModeCycle[currentGhostModeIndexRef.current].mode;
      
      // Update ghost modes
      setGameState(prev => ({
        ...prev,
        ghosts: prev.ghosts.map(ghost => ({
          ...ghost,
          mode: newMode,
          // Reverse direction when mode changes
          direction: getOppositeDirection(ghost.direction),
        })),
      }));
    }
  }, [gameState.powerMode]);

  // Update power mode timer
  const updatePowerMode = useCallback((deltaTime: number) => {
    setGameState(prev => {
      if (!prev.powerMode) return prev;
      
      const newTimer = prev.powerModeTimer! - deltaTime;
      
      if (newTimer <= 0) {
        // Power mode ends
        return {
          ...prev,
          powerMode: false,
          powerModeTimer: null,
          ghosts: prev.ghosts.map(ghost => ({
            ...ghost,
            mode: ghostModeCycle[currentGhostModeIndexRef.current].mode,
          })),
        };
      }
      
      // Update timer
      return {
        ...prev,
        powerModeTimer: newTimer,
      };
    });
  }, []);

  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!lastUpdateTimeRef.current) {
      lastUpdateTimeRef.current = timestamp;
    }
    
    const deltaTime = timestamp - lastUpdateTimeRef.current;
    lastUpdateTimeRef.current = timestamp;
    
    // Cap deltaTime to prevent huge jumps if tab is inactive
    const cappedDeltaTime = Math.min(deltaTime, 100);
    
    console.log("Game loop running, deltaTime:", cappedDeltaTime);
    
    // Update Pac-Man
    setGameState(prev => {
      const { pacman, level } = prev;
      const { position, direction, speed } = pacman;
      
      // Try to change direction if a new direction is requested
      let newDirection = direction;
      let newNextDirection = prev.pacman.nextDirection;
      
      if (nextDirection !== Direction.NONE && nextDirection !== direction) {
        newNextDirection = nextDirection;
        
        // Always snap to grid when changing direction
        const snappedPos = { 
          x: Math.round(position.x), 
          y: Math.round(position.y) 
        };
        
        // Check if next position in requested direction is valid
        const nextPos = getNextPosition(snappedPos, nextDirection);
        
        if (isValidPosition(nextPos, level)) {
          // Can change direction - snap to grid first for clean turns
          newDirection = nextDirection;
          clearNextDirection();
          newNextDirection = Direction.NONE;
          
          // Return and use the snapped position to avoid wall clipping
          return {
            ...prev,
            pacman: {
              ...prev.pacman,
              position: snappedPos,
              direction: newDirection,
              nextDirection: newNextDirection,
              isEating: true,
            },
          };
        }
      }
      
      // Calculate maximum safe movement distance to avoid wall clipping
      const moveAmount = (speed * cappedDeltaTime) / 1000;
      
      // Try smaller movement increments to prevent wall clipping
      const safeIncrement = 0.1;
      let newX = position.x;
      let newY = position.y;
      let remainingMove = moveAmount;
      let canMove = true;
      
      while (remainingMove > 0 && canMove) {
        // Calculate the next increment (either the small increment or what's left)
        const thisIncrement = Math.min(safeIncrement, remainingMove);
        let testX = newX;
        let testY = newY;
        
        // Apply the movement increment in the current direction
        switch (newDirection) {
          case Direction.UP:
            testY -= thisIncrement;
            break;
          case Direction.RIGHT:
            testX += thisIncrement;
            break;
          case Direction.DOWN:
            testY += thisIncrement;
            break;
          case Direction.LEFT:
            testX -= thisIncrement;
            break;
          default:
            remainingMove = 0;
            continue;
        }
        
        // Check if this position is valid
        const roundedPos = { 
          x: Math.round(testX), 
          y: Math.round(testY) 
        };
        
        if (isValidPosition(roundedPos, level)) {
          // Safe to move here
          newX = testX;
          newY = testY;
          remainingMove -= thisIncrement;
        } else {
          // Hit a wall, stop movement
          canMove = false;
          
          // Snap to grid when hitting a wall
          newX = Math.round(newX);
          newY = Math.round(newY);
        }
      }
      
      // Align to grid while moving in corridors
      if (canMove && newDirection !== Direction.NONE) {
        if (newDirection === Direction.LEFT || newDirection === Direction.RIGHT) {
          // Keep Y aligned when moving horizontally
          newY = Math.round(position.y);
        } else if (newDirection === Direction.UP || newDirection === Direction.DOWN) {
          // Keep X aligned when moving vertically
          newX = Math.round(position.x);
        }
      }
      
      if (canMove) {
        // Update Pac-Man position
        return {
          ...prev,
          pacman: {
            ...prev.pacman,
            position: { x: newX, y: newY },
            direction: newDirection,
            nextDirection: newNextDirection,
            isEating: true,
          },
        };
      } else {
        // If can't move, stop and snap to grid
        return {
          ...prev,
          pacman: {
            ...prev.pacman,
            position: { x: Math.round(position.x), y: Math.round(position.y) },
            direction: Direction.NONE,
            nextDirection: newNextDirection,
            isEating: false,
          },
        };
      }
    });
    
    // Run ghost updates directly to ensure they actually move
    updateGhosts(cappedDeltaTime);
    updateGhostModes(cappedDeltaTime);
    updatePowerMode(cappedDeltaTime);
    handleCollisions();
    updateDirection(direction);
    
    // Continue animation loop
    animationRef.current = requestAnimationFrame(gameLoop);
  }, [
    clearNextDirection, direction, handleCollisions, nextDirection, 
    updateDirection, updateGhostModes, updateGhosts, updatePowerMode
  ]);

  // Debug function to manually move Pac-Man
  const debugMovePacman = useCallback((direction: Direction) => {
    setGameState(prev => {
      const currentPos = prev.pacman.position;
      // Snap to grid before moving to prevent wall clipping
      const snappedPos = {
        x: Math.round(currentPos.x),
        y: Math.round(currentPos.y)
      };
      
      // Calculate the next position based on the direction
      const nextPos = getNextPosition(snappedPos, direction);
      
      // Check if the position is valid
      if (isValidPosition(nextPos, prev.level)) {
        return {
          ...prev,
          pacman: {
            ...prev.pacman,
            // Use the snapped position to prevent wall clipping
            position: nextPos,
            direction: direction,
            isEating: true,
          }
        };
      }
      
      // If can't move in that direction, keep current position but snap to grid
      return {
        ...prev,
        pacman: {
          ...prev.pacman,
          position: snappedPos,
          direction: prev.pacman.direction,
          isEating: false,
        }
      };
    });
  }, []);

  // Start and stop game loop
  useEffect(() => {
    // Start the game loop
    animationRef.current = requestAnimationFrame(gameLoop);
    
    // Clean up on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameLoop]);

  return {
    gameState,
    resetGame: resetPositions,
    debugMovePacman,
  };
} 