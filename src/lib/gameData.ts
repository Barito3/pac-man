import { Level, EntityType, Position, GhostType, Direction, Ghost, GhostMode } from './types';

// Basic level map 
// 0 = Empty, 1 = Wall, 2 = Dot, 3 = Power Pellet
export const level1Map: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
  [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 2, 1, 1, 1, 1],
  [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
  [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
  [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
  [1, 3, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 3, 1],
  [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
  [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Level 1 configuration
export const level1: Level = {
  map: level1Map,
  ghostSpeed: 2.0,
  pacmanSpeed: 3.5,
  dotPoints: 10,
  powerPelletPoints: 50,
  fruitPoints: 100,
  ghostPoints: 200,
  frightDuration: 8000, // 8 seconds
};

// Initial ghost positions and settings
export const initialGhosts: Ghost[] = [
  {
    id: 'ghost-1',
    type: GhostType.BLINKY,
    position: { x: 1, y: 1 },
    direction: Direction.RIGHT,
    mode: GhostMode.CHASE,
    targetPosition: { x: 18, y: 0 },
    homePosition: { x: 9, y: 8 },
    speed: level1.ghostSpeed * 1.0,  // Normalized speed
  },
  {
    id: 'ghost-2',
    type: GhostType.PINKY,
    position: { x: 17, y: 1 },
    direction: Direction.LEFT,
    mode: GhostMode.CHASE,
    targetPosition: { x: 0, y: 0 },
    homePosition: { x: 9, y: 9 },
    speed: level1.ghostSpeed * 1.0,  // Normalized speed
  },
  {
    id: 'ghost-3',
    type: GhostType.INKY,
    position: { x: 1, y: 19 },
    direction: Direction.RIGHT,
    mode: GhostMode.CHASE,
    targetPosition: { x: 18, y: 20 },
    homePosition: { x: 10, y: 9 },
    speed: level1.ghostSpeed * 1.0,  // Normalized speed
  },
  {
    id: 'ghost-4',
    type: GhostType.CLYDE,
    position: { x: 17, y: 19 },
    direction: Direction.LEFT,
    mode: GhostMode.CHASE,
    targetPosition: { x: 0, y: 20 },
    homePosition: { x: 8, y: 9 },
    speed: level1.ghostSpeed * 1.0,  // Normalized speed
  },
];

// Initial Pac-Man position
export const initialPacmanPosition: Position = { x: 9, y: 15 };

// Ghost behavior cycle in milliseconds
export const ghostModeCycle = [
  { mode: GhostMode.CHASE, duration: 15000 },   // 15 seconds chase
  { mode: GhostMode.SCATTER, duration: 5000 },  // 5 seconds scatter
  { mode: GhostMode.CHASE, duration: 15000 },   // 15 seconds chase
  { mode: GhostMode.SCATTER, duration: 5000 },  // 5 seconds scatter
  { mode: GhostMode.CHASE, duration: 15000 },   // 15 seconds chase
  { mode: GhostMode.SCATTER, duration: 5000 },  // 5 seconds scatter
  { mode: GhostMode.CHASE, duration: Infinity }, // Then permanent chase
]; 