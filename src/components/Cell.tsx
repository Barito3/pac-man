import React from 'react';
import { EntityType } from '@/lib/types';

interface CellProps {
  type: EntityType;
  size: number;
}

const Cell: React.FC<CellProps> = ({ type, size }) => {
  const renderCell = () => {
    switch (type) {
      case EntityType.WALL:
        return (
          <div 
            className="w-full h-full bg-maze-blue rounded-sm"
          />
        );
      case EntityType.DOT:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1/4 h-1/4 bg-pacman-yellow rounded-full" />
          </div>
        );
      case EntityType.POWER_PELLET:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1/2 h-1/2 bg-pacman-yellow rounded-full animate-pulse" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="flex items-center justify-center" 
      style={{ width: size, height: size }}
    >
      {renderCell()}
    </div>
  );
};

export default Cell; 