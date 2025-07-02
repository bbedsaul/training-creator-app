import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { MindMapNode } from '../types';

interface DraggableNodeProps {
  node: MindMapNode;
  onPositionChange: (nodeId: string, x: number, y: number) => void;
  onLongPress: (node: MindMapNode) => void;
  onPress: (node: MindMapNode) => void;
  onDelete?: (node: MindMapNode) => void;
  scale: number;
  isBeingEdited?: boolean;
  isSelected?: boolean;
}

const DraggableNode: React.FC<DraggableNodeProps> = ({
  node,
  onPositionChange,
  onLongPress,
  onPress,
  onDelete,
  scale,
  isBeingEdited = false,
  isSelected = false,
}) => {
  const translateX = useSharedValue(node.position.x);
  const translateY = useSharedValue(node.position.y);
  const isDragging = useSharedValue(false);
  const pulseAnimation = useSharedValue(1);

  React.useEffect(() => {
    translateX.value = node.position.x;
    translateY.value = node.position.y;
  }, [node.position.x, node.position.y]);

  // Pulse animation for editing state
  React.useEffect(() => {
    if (isBeingEdited) {
      pulseAnimation.value = withRepeat(
        withSpring(1.1, { duration: 1000 }),
        -1,
        true
      );
    } else {
      pulseAnimation.value = withSpring(1);
    }
  }, [isBeingEdited]);

  // Pan gesture for dragging
  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      console.log('Pan started on:', node.title);
    })
    .onUpdate((event) => {
      translateX.value = node.position.x + event.translationX / scale;
      translateY.value = node.position.y + event.translationY / scale;
    })
    .onEnd(() => {
      isDragging.value = false;
      console.log('Pan ended on:', node.title);
      runOnJS(onPositionChange)(node.id, translateX.value, translateY.value);
    });

  // Tap gesture for selecting nodes (or editing if not selected)
  const tapGesture = Gesture.Tap()
    .onStart(() => {
      if (isSelected) {
        console.log('Tap on selected node:', node.title, '- opening edit');
        runOnJS(onPress)(node);
      } else {
        console.log('Tap detected on:', node.title, '- selecting');
        runOnJS(onPress)(node);
      }
    });

  // Long press gesture for creating children
  const longPressGesture = Gesture.LongPress()
    .minDuration(600) // 600ms long press
    .onStart(() => {
      console.log('Long press triggered on:', node.type, node.title);
      if (node.type !== 'task') { // Tasks can't create children
        runOnJS(onLongPress)(node);
      } else {
        console.log('Tasks cannot create children');
      }
    });

  // Combine gestures in priority order: long press > pan > tap
  const composedGestures = Gesture.Exclusive(longPressGesture, panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { 
          scale: withSpring(
            isDragging.value ? 1.05 : 
            isBeingEdited ? pulseAnimation.value : 1
          ) 
        },
      ],
      zIndex: isDragging.value ? 1000 : isBeingEdited ? 500 : 10,
      elevation: isDragging.value ? 8 : isBeingEdited ? 6 : 5,
    };
  });

  const getNodeIcon = () => {
    switch (node.type) {
      case 'course': return 'school-outline';
      case 'module': return 'library-outline';
      case 'sticky': return 'document-text-outline';
      case 'task': return 'checkmark-circle-outline';
      default: return 'ellipse-outline';
    }
  };

  const getNodeStyle = () => {
    return {
      width: node.size.width,
      height: node.size.height,
      borderRadius: node.type === 'task' ? node.size.height / 2 : 12,
      backgroundColor: node.color,
      borderWidth: isBeingEdited ? 3 : isSelected ? 3 : 2,
      borderColor: isBeingEdited ? '#3B82F6' : isSelected ? '#F59E0B' : 'white',
      shadowColor: isBeingEdited ? '#3B82F6' : isSelected ? '#F59E0B' : '#000',
      shadowOffset: isBeingEdited || isSelected ? { width: 0, height: 0 } : { width: 0, height: 2 },
      shadowOpacity: isBeingEdited || isSelected ? 0.4 : 0.1,
      shadowRadius: isBeingEdited || isSelected ? 8 : 4,
    };
  };

  const getTextColor = () => 'white';

  const getFontSize = () => {
    switch (node.type) {
      case 'course': return 16;
      case 'module': return 14;
      case 'sticky': return 12;
      case 'task': return 10;
      default: return 12;
    }
  };

  return (
    <GestureDetector gesture={composedGestures}>
      <Animated.View style={[animatedStyle, { position: 'absolute' }]}>
        <View style={getNodeStyle()} className="shadow-lg">
          <View className="flex-1 p-2 justify-center items-center">
            {/* Header with icon and editing indicator */}
            <View className="flex-row items-center justify-center w-full mb-1">
              <Ionicons 
                name={getNodeIcon() as any} 
                size={node.type === 'task' ? 12 : 16} 
                color={getTextColor()} 
              />
              {isBeingEdited && (
                <Ionicons 
                  name="create-outline" 
                  size={12} 
                  color={getTextColor()} 
                  style={{ marginLeft: 4 }}
                />
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

            {/* Long press hint for non-task nodes */}
            {node.type !== 'task' && !isBeingEdited && (
              <View className="absolute bottom-1 right-1">
                <Ionicons name="add-circle-outline" size={8} color={getTextColor()} />
              </View>
            )}

            {/* Editing indicator */}
            {isBeingEdited && (
              <View className="absolute -top-2 -right-2 bg-blue-500 w-6 h-6 rounded-full items-center justify-center">
                <Ionicons name="create" size={12} color="white" />
              </View>
            )}

            {/* Delete button when selected */}
            {isSelected && onDelete && node.type !== 'course' && (
              <Pressable
                onPress={() => onDelete(node)}
                className="absolute -top-2 -left-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                style={{ zIndex: 1000 }}
              >
                <Ionicons name="close" size={12} color="white" />
              </Pressable>
            )}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

export default DraggableNode;