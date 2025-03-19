import { Position, Direction, EntityType, Level } from './types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Shadcn-style utility for merging class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate the distance between two positions
export function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}

// Check if a position is valid (not a wall)
export function isValidPosition(position: Position, level: Level, isGhost: boolean = false): boolean {
  // Get the rounded position for grid alignment
  const x = Math.round(position.x);
  const y = Math.round(position.y);
  
  // Basic boundary check
  if (x < 0 || y < 0 || y >= level.map.length || x >= level.map[0].length) {
    return false;
  }

  // For ghosts, we only need to check if it's a wall
  if (isGhost) {
    return level.map[y][x] !== EntityType.WALL;
  }

  // For Pac-Man, we keep the stricter checks
  // Check if the rounded position is a wall
  if (level.map[y][x] === EntityType.WALL) {
    return false;
  }

  // Create a small buffer around walls for Pac-Man
  const threshold = 0.3;
  
  // Check nearby positions
  const nearbyPositions = [
    { x: Math.floor(position.x), y: Math.floor(position.y) },
    { x: Math.ceil(position.x), y: Math.floor(position.y) },
    { x: Math.floor(position.x), y: Math.ceil(position.y) },
    { x: Math.ceil(position.x), y: Math.ceil(position.y) },
  ];

  // Check if any nearby position is too close to a wall
  for (const pos of nearbyPositions) {
    if (pos.x >= 0 && pos.y >= 0 && pos.y < level.map.length && pos.x < level.map[0].length) {
      if (level.map[pos.y][pos.x] === EntityType.WALL) {
        const distance = Math.sqrt(
          Math.pow(position.x - pos.x, 2) + 
          Math.pow(position.y - pos.y, 2)
        );
        if (distance < threshold) {
          return false;
        }
      }
    }
  }

  return true;
}

// Get the next position based on current position and direction
export function getNextPosition(position: Position, direction: Direction): Position {
  // If no direction, return current position
  if (direction === Direction.NONE) {
    return { ...position };
  }

  // Calculate next position based on direction
  // Using a smaller step (0.5) for more accurate collision detection
  const step = 0.5;
  switch (direction) {
    case Direction.UP:
      return { x: position.x, y: position.y - step };
    case Direction.RIGHT:
      return { x: position.x + step, y: position.y };
    case Direction.DOWN:
      return { x: position.x, y: position.y + step };
    case Direction.LEFT:
      return { x: position.x - step, y: position.y };
    default:
      return { ...position };
  }
}

// Get all valid directions from a position
export function getValidDirections(position: Position, level: Level, isGhost: boolean = false): Direction[] {
  const validDirections: Direction[] = [];
  
  // Check each direction
  const directions = [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT];
  
  for (const direction of directions) {
    const nextPos = getNextPosition(position, direction);
    if (isValidPosition(nextPos, level, isGhost)) {
      validDirections.push(direction);
    }
  }
  
  return validDirections;
}

// Get the opposite direction
export function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case Direction.UP:
      return Direction.DOWN;
    case Direction.RIGHT:
      return Direction.LEFT;
    case Direction.DOWN:
      return Direction.UP;
    case Direction.LEFT:
      return Direction.RIGHT;
    default:
      return Direction.NONE;
  }
}

// Check if two positions are the same
export function isSamePosition(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

// Get the best direction to move toward a target position
export function getBestDirection(
  currentPos: Position,
  targetPos: Position,
  level: Level,
  currentDirection: Direction
): Direction {
  // Get all valid directions from current position
  const validDirections = getValidDirections(currentPos, level);
  
  // If there are no valid directions, return NONE
  if (validDirections.length === 0) {
    console.log("No valid directions available from", currentPos);
    return Direction.NONE;
  }
  
  // Avoid reversing direction unless it's the only option
  const oppositeDirection = getOppositeDirection(currentDirection);
  const preferredDirections = validDirections.filter(dir => 
    dir !== oppositeDirection || validDirections.length === 1
  );
  
  // If there are no preferred directions after filtering, use any valid direction
  const directionsToUse = preferredDirections.length > 0 ? preferredDirections : validDirections;
  
  // If there's only one direction available, use it
  if (directionsToUse.length === 1) {
    return directionsToUse[0];
  }

  // Calculate distances for each valid direction
  const distances = directionsToUse.map(dir => {
    const nextPos = getNextPosition(currentPos, dir);
    return {
      direction: dir,
      distance: calculateDistance(nextPos, targetPos),
    };
  });

  // Sort by distance (ascending)
  distances.sort((a, b) => a.distance - b.distance);

  // Return the direction with the shortest distance
  return distances[0].direction;
}

// Get random direction from valid directions
export function getRandomDirection(position: Position, level: Level, currentDirection: Direction): Direction {
  const validDirections = getValidDirections(position, level);
  
  // Try to avoid going back the way we came
  const oppositeDirection = getOppositeDirection(currentDirection);
  const filteredDirections = validDirections.filter(dir => dir !== oppositeDirection);
  
  // If we can only go back the way we came, do that
  const directionsToUse = filteredDirections.length > 0 ? filteredDirections : validDirections;
  
  // Pick a random direction from the available ones
  return directionsToUse[Math.floor(Math.random() * directionsToUse.length)];
}

// Check for collision between pac-man and ghosts
export function checkCollision(pacmanPos: Position, ghostPos: Position): boolean {
  // Use a smaller threshold for more accurate collision detection
  const threshold = 0.5;
  
  return Math.abs(pacmanPos.x - ghostPos.x) < threshold && 
         Math.abs(pacmanPos.y - ghostPos.y) < threshold;
}

// Count the number of dots remaining in the level
export function countDotsRemaining(level: Level): number {
  let count = 0;
  for (let y = 0; y < level.map.length; y++) {
    for (let x = 0; x < level.map[y].length; x++) {
      if (level.map[y][x] === EntityType.DOT || level.map[y][x] === EntityType.POWER_PELLET) {
        count++;
      }
    }
  }
  return count;
}

// Format a score with commas
export function formatScore(score: number): string {
  return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
} 