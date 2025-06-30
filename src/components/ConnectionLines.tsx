import React from 'react';
import { View } from 'react-native';
import { Connection } from '../types';

interface ConnectionLinesProps {
  connections: Connection[];
  canvasWidth: number;
  canvasHeight: number;
}

const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  connections,
  canvasWidth,
  canvasHeight,
}) => {
  const createConnectionLine = (connection: Connection) => {
    const { fromPosition, toPosition } = connection;
    
    // Calculate line properties
    const dx = toPosition.x - fromPosition.x;
    const dy = toPosition.y - fromPosition.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    return {
      position: 'absolute' as const,
      left: fromPosition.x,
      top: fromPosition.y,
      width: length,
      height: 3,
      backgroundColor: '#3B82F6',
      transformOrigin: '0 50%',
      transform: [{ rotate: `${angle}deg` }],
      opacity: 0.8,
      zIndex: 1,
    };
  };

  if (connections.length === 0) {
    return null;
  }

  return (
    <View 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: canvasWidth, 
        height: canvasHeight,
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      {/* Connection Lines */}
      {connections.map((connection) => (
        <View
          key={connection.id}
          style={createConnectionLine(connection)}
        />
      ))}
    </View>
  );
};

export default ConnectionLines;