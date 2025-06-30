import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { MindMapNode } from '../types';

interface DraggableNodeProps {
  node: MindMapNode;
  onPositionChange: (nodeId: string, x: number, y: number) => void;
  onPress?: (node: MindMapNode) => void;
  onToggleCollapse?: (node: MindMapNode) => void;
  scale: number;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({
  node,
  onPositionChange,
  onPress,
  onToggleCollapse,
  scale,
}) => {
  const translateX = useSharedValue(node.position.x);
  const translateY = useSharedValue(node.position.y);
  const isDragging = useSharedValue(false);

  React.useEffect(() => {
    translateX.value = node.position.x;
    translateY.value = node.position.y;
  }, [node.position.x, node.position.y]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translateX.value = node.position.x + event.translationX / scale;
      translateY.value = node.position.y + event.translationY / scale;
    })
    .onEnd(() => {
      isDragging.value = false;
      // Update position in store
      runOnJS(onPositionChange)(node.id, translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: withSpring(isDragging.value ? 1.05 : 1) },
      ],
      zIndex: isDragging.value ? 1000 : 10,
      elevation: isDragging.value ? 8 : 5,
    };
  });

  const getNodeIcon = () => {
    switch (node.type) {
      case 'course':
        return 'school-outline';
      case 'module':
        return 'library-outline';
      case 'sticky':
        return 'document-text-outline';
      case 'task':
        return 'checkmark-circle-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getNodeStyle = () => {
    const baseStyle = {
      width: node.size.width,
      height: node.size.height,
      borderRadius: node.type === 'task' ? node.size.height / 2 : 12,
      backgroundColor: node.color,
      borderWidth: 2,
      borderColor: node.isCollapsed ? '#6B7280' : 'white',
    };

    return baseStyle;
  };

  const getTextColor = () => {
    // Use white text for dark backgrounds
    return 'white';
  };

  const getFontSize = () => {
    switch (node.type) {
      case 'course':
        return 16;
      case 'module':
        return 14;
      case 'sticky':
        return 12;
      case 'task':
        return 10;
      default:
        return 12;
    }
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[animatedStyle, { position: 'absolute' }]}>
        <Pressable
          onPress={() => onPress?.(node)}
          style={getNodeStyle()}
          className="shadow-lg"
        >
          <View className="flex-1 p-2 justify-center items-center">
            {/* Header with icon and collapse button */}
            <View className="flex-row items-center justify-between w-full mb-1">
              <Ionicons 
                name={getNodeIcon() as any} 
                size={node.type === 'task' ? 12 : 16} 
                color={getTextColor()} 
              />
              {(node.type === 'course' || node.type === 'module' || node.type === 'sticky') && (
                <Pressable
                  onPress={() => onToggleCollapse?.(node)}
                  className="p-1"
                >
                  <Ionicons 
                    name={node.isCollapsed ? 'chevron-forward' : 'chevron-down'} 
                    size={12} 
                    color={getTextColor()} 
                  />
                </Pressable>
              )}
            </View>

            {/* Title */}
            <Text 
              style={{ 
                color: getTextColor(),
                fontSize: getFontSize(),
                fontWeight: '600',
                textAlign: 'center',
              }}
              numberOfLines={node.type === 'task' ? 1 : 2}
            >
              {node.title}
            </Text>

            {/* Type indicator */}
            {node.type !== 'task' && (
              <Text 
                style={{ 
                  color: getTextColor(),
                  fontSize: 8,
                  opacity: 0.8,
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                {node.type}
              </Text>
            )}

            {/* Collapsed indicator */}
            {node.isCollapsed && (
              <View className="absolute bottom-1 right-1">
                <Ionicons name="ellipsis-horizontal" size={10} color={getTextColor()} />
              </View>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

export default DraggableNode;