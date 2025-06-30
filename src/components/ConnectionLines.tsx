import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Defs, Marker } from 'react-native-svg';
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
  const createCurvedPath = (connection: Connection) => {
    const { fromPosition, toPosition } = connection;
    
    // Validate positions
    if (!fromPosition || !toPosition || 
        typeof fromPosition.x !== 'number' || typeof fromPosition.y !== 'number' ||
        typeof toPosition.x !== 'number' || typeof toPosition.y !== 'number') {
      return `M 0 0 L 0 0`;
    }
    
    // Simple straight line for debugging
    return `M ${fromPosition.x} ${fromPosition.y} L ${toPosition.x} ${toPosition.y}`;
  };

  if (connections.length === 0) {
    return (
      <View 
        style={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          backgroundColor: 'rgba(255,0,0,0.8)',
          padding: 8,
          borderRadius: 4,
          zIndex: 1000
        }}
      >
        <Text style={{ color: 'white', fontSize: 12 }}>No connections</Text>
      </View>
    );
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
      {/* Debug indicator */}
      <View 
        style={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          backgroundColor: 'rgba(0,255,0,0.8)',
          padding: 8,
          borderRadius: 4,
          zIndex: 1000,
          maxWidth: 300
        }}
      >
        <Text style={{ color: 'white', fontSize: 12 }}>
          {connections.length} connections
        </Text>
        <Text style={{ color: 'white', fontSize: 10 }}>
          Canvas: {canvasWidth}x{canvasHeight}
        </Text>
        {connections.length > 0 && (
          <>
            <Text style={{ color: 'white', fontSize: 10 }}>
              First: {connections[0].fromNodeId?.slice(0,8)} → {connections[0].toNodeId?.slice(0,8)}
            </Text>
            <Text style={{ color: 'white', fontSize: 9 }}>
              From: {Math.round(connections[0].fromPosition.x)},{Math.round(connections[0].fromPosition.y)}
            </Text>
            <Text style={{ color: 'white', fontSize: 9 }}>
              To: {Math.round(connections[0].toPosition.x)},{Math.round(connections[0].toPosition.y)}
            </Text>
          </>
        )}
      </View>

      {/* Test with simple View components instead of SVG */}
      {connections.map((connection, index) => {
        const { fromPosition, toPosition } = connection;
        
        if (!fromPosition || !toPosition) return null;
        
        const dx = toPosition.x - fromPosition.x;
        const dy = toPosition.y - fromPosition.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
        return (
          <View
            key={connection.id}
            style={{
              position: 'absolute',
              left: fromPosition.x,
              top: fromPosition.y,
              width: length,
              height: 4,
              backgroundColor: '#00FF00',
              transformOrigin: '0 50%',
              transform: [{ rotate: `${angle}deg` }],
              zIndex: 1,
            }}
          />
        );
      })}
      
      {/* Test with a simple static line */}
      <View
        style={{
          position: 'absolute',
          left: 50,
          top: 50,
          width: 150,
          height: 4,
          backgroundColor: '#FF0000',
          transformOrigin: '0 50%',
          transform: [{ rotate: '45deg' }],
          zIndex: 2,
        }}
      />
    </View>
  );
};

export default ConnectionLines;