// Game entities
export enum EntityType {
  EMPTY = 0,
  WALL = 1,
  DOT = 2,
  POWER_PELLET = 3,
  PACMAN = 4,
  GHOST = 5,
  FRUIT = 6,
}

// Direction of movement
export enum Direction {
  NONE = 0,
  UP = 1,
  RIGHT = 2,
  DOWN = 3,
  LEFT = 4,
}

// Ghost behavior states
export enum GhostMode {
  CHASE = 'chase',
  SCATTER = 'scatter',
  FRIGHTENED = 'frightened',
}

// Ghost types with different behaviors
export enum GhostType {
  BLINKY = 'blinky', // Directly targets Pac-Man
  PINKY = 'pinky', // Targets four tiles ahead of Pac-Man
  INKY = 'inky', // Uses Blinky's position and Pac-Man's position to calculate target
  CLYDE = 'clyde', // Targets Pac-Man when far, scatters when close
}

// Position in the game grid
export interface Position {
  x: number;
  y: number;
}

// Ghost entity
export interface Ghost {
  id: string;
  type: GhostType;
  position: Position;
  direction: Direction;
  mode: GhostMode;
  targetPosition: Position;
  homePosition: Position;
  speed: number;
}

// Game level configuration
export interface Level {
  map: number[][];
  ghostSpeed: number;
  pacmanSpeed: number;
  dotPoints: number;
  powerPelletPoints: number;
  fruitPoints: number;
  ghostPoints: number;
  frightDuration: number; // Duration in milliseconds
}

// Game state
export interface GameState {
  level: Level;
  pacman: {
    position: Position;
    direction: Direction;
    nextDirection: Direction;
    speed: number;
    isEating: boolean;
  };
  ghosts: Ghost[];
  score: number;
  lives: number;
  dotsRemaining: number;
  powerMode: boolean;
  powerModeTimer: number | null;
} 