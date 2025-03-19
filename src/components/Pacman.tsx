import React, { useMemo, useEffect, useState } from 'react';
import { Direction } from '@/lib/types';

interface PacmanProps {
  position: { x: number; y: number };
  direction: Direction;
  size: number;
  isEating: boolean;
}

const Pacman: React.FC<PacmanProps> = ({ position, direction, size, isEating }) => {
  // State for mouth animation
  const [mouthOpen, setMouthOpen] = useState(true);
  
  // Animate mouth while moving
  useEffect(() => {
    if (!isEating) return;
    
    const animationInterval = setInterval(() => {
      setMouthOpen(prev => !prev);
    }, 150); // Animation speed
    
    return () => clearInterval(animationInterval);
  }, [isEating]);
  
  // Ensure position is valid
  const safePosition = useMemo(() => {
    return {
      x: position?.x || 0,
      y: position?.y || 0
    };
  }, [position]);

  // Calculate rotation based on direction
  const rotation = useMemo(() => {
    switch (direction) {
      case Direction.UP:
        return -90;
      case Direction.RIGHT:
        return 0;
      case Direction.DOWN:
        return 90;
      case Direction.LEFT:
        return 180;
      default:
        return 0;
    }
  }, [direction]);

  // Calculate the mouth opening angle based on animation
  const mouthAngle = useMemo(() => {
    if (!isEating) return 10;  // Slightly open when not moving
    return mouthOpen ? 45 : 5; // Open wide or almost closed when moving
  }, [isEating, mouthOpen]);

  return (
    <div
      className="absolute"
      style={{
        width: size,
        height: size,
        left: 0,
        top: 0,
        transform: `translate(${Math.floor(safePosition.x * size)}px, ${Math.floor(safePosition.y * size)}px)`,
        transition: 'transform 0.1s linear',
        zIndex: 10
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100"
      >
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          fill="#FFCC00" 
        />
        <path
          d={`M50 50 L${50 + 40 * Math.cos((360 - mouthAngle) * Math.PI / 180)} ${50 - 40 * Math.sin((360 - mouthAngle) * Math.PI / 180)} A40 40 0 0 0 ${50 + 40 * Math.cos(mouthAngle * Math.PI / 180)} ${50 + 40 * Math.sin(mouthAngle * Math.PI / 180)} Z`}
          fill="#000000"
          transform={`rotate(${rotation}, 50, 50)`}
        />
      </svg>
    </div>
  );
};

export default Pacman; 