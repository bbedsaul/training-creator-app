import React from 'react';
import { View } from 'react-native';
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
    
    // Calculate control points for a smooth curve
    const dx = toPosition.x - fromPosition.x;
    const dy = toPosition.y - fromPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Curve intensity based on distance
    const curvature = Math.min(distance * 0.3, 100);
    
    // Control points for bezier curve
    const cp1x = fromPosition.x + (dx > 0 ? curvature : -curvature);
    const cp1y = fromPosition.y;
    const cp2x = toPosition.x - (dx > 0 ? curvature : -curvature);
    const cp2y = toPosition.y;
    
    return `M ${fromPosition.x} ${fromPosition.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPosition.x} ${toPosition.y}`;
  };

  if (connections.length === 0) {
    return null;
  }

  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }}>
      <Svg width={canvasWidth} height={canvasHeight}>
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
              fill="#94A3B8"
            />
          </Marker>
        </Defs>
        
        {connections.map((connection) => (
          <Path
            key={connection.id}
            d={createCurvedPath(connection)}
            stroke="#94A3B8"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead)"
            opacity={0.6}
          />
        ))}
      </Svg>
    </View>
  );
};

export default ConnectionLines;