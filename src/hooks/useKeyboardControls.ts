import { useState, useEffect } from 'react';
import { Direction } from '@/lib/types';

export function useKeyboardControls() {
  const [direction, setDirection] = useState<Direction>(Direction.NONE);
  const [nextDirection, setNextDirection] = useState<Direction>(Direction.NONE);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          setNextDirection(Direction.UP);
          break;
        case 'ArrowRight':
          setNextDirection(Direction.RIGHT);
          break;
        case 'ArrowDown':
          setNextDirection(Direction.DOWN);
          break;
        case 'ArrowLeft':
          setNextDirection(Direction.LEFT);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Method to update the current direction
  const updateDirection = (newDirection: Direction) => {
    setDirection(newDirection);
  };

  // Method to clear the next direction after it's been processed
  const clearNextDirection = () => {
    setNextDirection(Direction.NONE);
  };

  return {
    direction,
    nextDirection,
    updateDirection,
    clearNextDirection,
  };
} 