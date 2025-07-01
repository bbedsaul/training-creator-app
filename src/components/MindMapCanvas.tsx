import React, { useState } from 'react';
import { View, Dimensions, Pressable, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useCourseStore } from '../state/courseStore';
import { MindMapNode } from '../types';
import DraggableNode from './DraggableNode';
import ConnectionLines from './ConnectionLines';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MindMapCanvasProps {
  onNodeLongPress: (node: MindMapNode) => void;
  courseId: string;
  editingObjectId?: string;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  onNodeLongPress,
  courseId,
  editingObjectId,
}) => {
  const { 
    getAllNodesForCourse,
    getConnectionsForCourse,
    updateNodePosition, 
    updateCanvasTransform, 
    canvasOffset, 
    canvasScale,
    courses,
  } = useCourseStore();

  const [canvasSize] = useState({
    width: screenWidth * 3,
    height: screenHeight * 3,
  });

  // Canvas pan and zoom values
  const translateX = useSharedValue(canvasOffset.x);
  const translateY = useSharedValue(canvasOffset.y);
  const scale = useSharedValue(canvasScale);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = canvasOffset.x;
    translateY.value = canvasOffset.y;
    scale.value = canvasScale;
  }, [canvasOffset, canvasScale]);

  // Pan gesture for canvas
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = canvasOffset.x + event.translationX;
      translateY.value = canvasOffset.y + event.translationY;
    })
    .onEnd(() => {
      runOnJS(updateCanvasTransform)(
        { x: translateX.value, y: translateY.value },
        scale.value
      );
    });

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      const newScale = Math.max(0.5, Math.min(3, canvasScale * event.scale));
      scale.value = newScale;
      
      const scaleDiff = newScale - canvasScale;
      translateX.value = canvasOffset.x - (focalX.value * scaleDiff);
      translateY.value = canvasOffset.y - (focalY.value * scaleDiff);
    })
    .onEnd(() => {
      runOnJS(updateCanvasTransform)(
        { x: translateX.value, y: translateY.value },
        scale.value
      );
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedCanvasStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const handleNodePositionChange = (nodeId: string, x: number, y: number) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;

    // Find the node type and parent relationships
    let nodeType: 'course' | 'module' | 'sticky' | 'task' = 'course';
    let moduleId = '';
    let stickyId = '';

    if (nodeId === courseId) {
      nodeType = 'course';
    } else {
      // Check modules
      const module = course.modules.find(m => m.id === nodeId);
      if (module) {
        nodeType = 'module';
      } else {
        // Check stickies
        for (const mod of course.modules) {
          const sticky = mod.stickies.find(s => s.id === nodeId);
          if (sticky) {
            nodeType = 'sticky';
            moduleId = mod.id;
            break;
          }
          // Check tasks
          for (const stick of mod.stickies) {
            const task = stick.tasks.find(t => t.id === nodeId);
            if (task) {
              nodeType = 'task';
              moduleId = mod.id;
              stickyId = stick.id;
              break;
            }
          }
        }
      }
    }

    updateNodePosition(nodeType, courseId, nodeId, { x, y }, moduleId, stickyId);
  };

  const nodes = getAllNodesForCourse(courseId);
  const connections = getConnectionsForCourse(courseId);

  const resetCanvasView = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
    updateCanvasTransform({ x: 0, y: 0 }, 1);
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Canvas Controls */}
      <View className="absolute top-12 right-4 z-50">
        <Pressable
          onPress={resetCanvasView}
          className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="home-outline" size={20} color="#374151" />
        </Pressable>
      </View>

      {/* Editing indicator */}
      {editingObjectId && (
        <View className="absolute top-12 left-4 z-50 bg-blue-500 px-3 py-2 rounded-lg">
          <Text className="text-white text-sm font-medium">✏️ Editing...</Text>
        </View>
      )}

      {/* Instructions */}
      <View className="absolute bottom-12 left-4 right-4 z-50">
        <View className="bg-black/70 px-4 py-2 rounded-lg">
          <Text className="text-white text-sm text-center">
            Long press: Course→Module, Module→Sticky, Sticky→Task
          </Text>
        </View>
      </View>

      {/* Debug info */}
      <View className="absolute top-20 left-4 z-50 bg-green-500 px-3 py-2 rounded-lg">
        <Text className="text-white text-xs">
          Nodes: {nodes.length} | Connections: {connections.length}
        </Text>
      </View>

      {/* Main Canvas */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View className="flex-1">
          <Pressable
            className="flex-1"
            style={{ width: canvasSize.width, height: canvasSize.height }}
          >
            <Animated.View style={[animatedCanvasStyle, { flex: 1 }]}>
              {/* Connection Lines */}
              <ConnectionLines
                connections={connections}
                canvasWidth={canvasSize.width}
                canvasHeight={canvasSize.height}
              />

              {/* Draggable Nodes - ONLY onLongPress, NO onPress */}
              {nodes.map((node) => (
                <DraggableNode
                  key={node.id}
                  node={node}
                  onPositionChange={handleNodePositionChange}
                  onLongPress={onNodeLongPress}
                  scale={canvasScale}
                  isBeingEdited={node.id === editingObjectId}
                />
              ))}
            </Animated.View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default MindMapCanvas;