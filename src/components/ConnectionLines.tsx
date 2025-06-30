import React from 'react';
import { View, Text } from 'react-native';
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
      height: 2,
      backgroundColor: '#3B82F6',
      transformOrigin: '0 50%',
      transform: [{ rotate: `${angle}deg` }],
      opacity: 0.7,
      zIndex: 1,
    };
  };

  return (
    <View 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: canvasWidth, 
        height: canvasHeight,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: 'rgba(255, 0, 0, 0.1)' // Semi-transparent red background to verify it's rendered
      }}
    >
      {/* Test lines to verify rendering */}
      <View
        style={{
          position: 'absolute',
          left: 50,
          top: 50,
          width: 150,
          height: 6,
          backgroundColor: '#FF0000',
          zIndex: 1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 100,
          top: 100,
          width: 100,
          height: 6,
          backgroundColor: '#00FF00',
          transform: [{ rotate: '45deg' }],
          transformOrigin: '0 50%',
          zIndex: 1,
        }}
      />
      
      {/* Large test circle */}
      <View
        style={{
          position: 'absolute',
          left: 200,
          top: 200,
          width: 50,
          height: 50,
          backgroundColor: '#0000FF',
          borderRadius: 25,
          zIndex: 1,
        }}
      />
      
      {/* Connection Lines */}
      {connections.map((connection) => (
        <View
          key={connection.id}
          style={createConnectionLine(connection)}
        />
      ))}
      
      {/* Connection count indicator */}
      <View
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          padding: 8,
          borderRadius: 8,
          zIndex: 100,
        }}
      >
        <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>
          Lines: {connections.length}
        </Text>
      </View>
    </View>
  );
};

export default ConnectionLines;