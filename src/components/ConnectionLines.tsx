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
          maxWidth: 200
        }}
      >
        <Text style={{ color: 'white', fontSize: 12 }}>
          {connections.length} connections
        </Text>
        {connections.length > 0 && (
          <Text style={{ color: 'white', fontSize: 10 }}>
            First: {connections[0].fromNodeId} → {connections[0].toNodeId}
          </Text>
        )}
      </View>

      <Svg 
        width={canvasWidth} 
        height={canvasHeight}
        style={{ 
          backgroundColor: 'rgba(255,255,0,0.1)', // Slightly yellow tint to see SVG bounds
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <Defs>
          <Marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <Path
              d="M0,0 L0,7 L10,3.5 z"
              fill="#3B82F6"
            />
          </Marker>
        </Defs>
        
        {/* Test line to verify SVG is working */}
        <Path
          d="M 50 50 L 200 150"
          stroke="#FF0000"
          strokeWidth="4"
          fill="none"
          opacity={1}
        />
        
        {connections.map((connection, index) => (
          <Path
            key={connection.id}
            d={createCurvedPath(connection)}
            stroke="#00FF00"
            strokeWidth="8"
            fill="none"
            strokeDasharray="none"
            markerEnd="url(#arrowhead)"
            opacity={1}
          />
        ))}
      </Svg>
    </View>
  );
};

export default ConnectionLines;