import React from 'react';
import { GhostType, GhostMode } from '@/lib/types';

interface GhostProps {
  type: GhostType;
  position: { x: number; y: number };
  size: number;
  mode: GhostMode;
}

const Ghost: React.FC<GhostProps> = ({ type, position, size, mode }) => {
  // Ensure position is valid
  const safePosition = {
    x: position?.x || 0,
    y: position?.y || 0
  };

  // Get ghost color based on type
  const getGhostColor = () => {
    if (mode === GhostMode.FRIGHTENED) {
      return '#0000FF'; // Blue when frightened
    }

    switch (type) {
      case GhostType.BLINKY:
        return '#FF0000'; // Red
      case GhostType.PINKY:
        return '#FF69B4'; // Pink
      case GhostType.INKY:
        return '#00BFFF'; // Light blue
      case GhostType.CLYDE:
        return '#FFA500'; // Orange
      default:
        return '#FFFFFF';
    }
  };

  // Get ghost eye direction (would need to be expanded for all directions)
  const getEyeStyle = () => {
    return {
      transform: 'translateX(15%)',
    };
  };

  // Calculate animation for frightened mode
  const getFrightenedAnimation = () => {
    if (mode === GhostMode.FRIGHTENED) {
      return 'animate-pulse';
    }
    return '';
  };

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
        zIndex: 5
      }}
    >
      <div className={`w-full h-full relative ${getFrightenedAnimation()}`}>
        {/* Ghost body */}
        <div
          className="absolute inset-0 rounded-t-full"
          style={{ backgroundColor: getGhostColor() }}
        ></div>
        
        {/* Ghost skirt */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{ backgroundColor: getGhostColor() }}
        >
          <div className="flex justify-between h-full">
            <div className="w-1/5 h-full rounded-b-full bg-maze-black"></div>
            <div className="w-1/5 h-full rounded-b-full bg-maze-black"></div>
            <div className="w-1/5 h-full rounded-b-full bg-maze-black"></div>
            <div className="w-1/5 h-full rounded-b-full bg-maze-black"></div>
          </div>
        </div>
        
        {/* Eyes */}
        {mode !== GhostMode.FRIGHTENED ? (
          <div className="absolute top-1/4 left-0 right-0 flex justify-center">
            <div className="w-1/3 h-1/3 bg-white rounded-full mr-1 flex items-center justify-center">
              <div
                className="w-1/2 h-1/2 bg-maze-black rounded-full"
                style={getEyeStyle()}
              ></div>
            </div>
            <div className="w-1/3 h-1/3 bg-white rounded-full ml-1 flex items-center justify-center">
              <div
                className="w-1/2 h-1/2 bg-maze-black rounded-full"
                style={getEyeStyle()}
              ></div>
            </div>
          </div>
        ) : (
          <div className="absolute top-1/3 left-0 right-0 flex justify-center items-center">
            <div className="text-white font-bold text-xl" style={{ fontSize: size / 3 }}>?</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ghost; 