import React, { useState } from 'react';
import { View, Dimensions, Pressable, Alert } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, PinchGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useCourseStore } from '../state/courseStore';
import { MindMapNode } from '../types';
import DraggableNode from './DraggableNode';
import ConnectionLines from './ConnectionLines';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MindMapCanvasProps {
  onCreateNode?: (type: 'course' | 'module' | 'sticky' | 'task', position: { x: number; y: number }) => void;
  onNodePress?: (node: MindMapNode) => void;
}

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  onCreateNode,
  onNodePress,
}) => {
  const { 
    getAllNodes, 
    getConnections, 
    updateNodePosition, 
    updateCanvasTransform, 
    canvasOffset, 
    canvasScale,
    toggleNodeCollapse,
    courses,
  } = useCourseStore();

  const [canvasSize] = useState({
    width: screenWidth * 3, // 3x screen width for scrolling
    height: screenHeight * 3, // 3x screen height for scrolling
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

  // Pan gesture handler for canvas
  const panGestureHandler = useAnimatedGestureHandler({
    onStart: () => {},
    onActive: (event) => {
      translateX.value = canvasOffset.x + event.translationX;
      translateY.value = canvasOffset.y + event.translationY;
    },
    onEnd: () => {
      runOnJS(updateCanvasTransform)(
        { x: translateX.value, y: translateY.value },
        scale.value
      );
    },
  });

  // Pinch gesture handler for zoom
  const pinchGestureHandler = useAnimatedGestureHandler({
    onStart: (event) => {
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    },
    onActive: (event) => {
      const newScale = Math.max(0.5, Math.min(3, canvasScale * event.scale));
      scale.value = newScale;
      
      // Adjust translation to zoom around focal point
      const scaleDiff = newScale - canvasScale;
      translateX.value = canvasOffset.x - (focalX.value * scaleDiff);
      translateY.value = canvasOffset.y - (focalY.value * scaleDiff);
    },
    onEnd: () => {
      runOnJS(updateCanvasTransform)(
        { x: translateX.value, y: translateY.value },
        scale.value
      );
    },
  });

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
    const nodes = getAllNodes();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Find the course and potentially module/sticky for this node
    let courseId = '';
    let moduleId = '';
    let stickyId = '';

    if (node.type === 'course') {
      courseId = nodeId;
    } else {
      // Find parent relationships
      const course = courses.find(c => 
        c.id === nodeId || 
        c.modules.some(m => 
          m.id === nodeId || 
          m.stickies.some(s => 
            s.id === nodeId || 
            s.tasks.some(t => t.id === nodeId)
          )
        )
      );
      
      if (course) {
        courseId = course.id;
        
        if (node.type === 'module') {
          moduleId = nodeId;
        } else {
          const module = course.modules.find(m => 
            m.id === nodeId || 
            m.stickies.some(s => 
              s.id === nodeId || 
              s.tasks.some(t => t.id === nodeId)
            )
          );
          
          if (module) {
            moduleId = module.id;
            
            if (node.type === 'sticky') {
              stickyId = nodeId;
            } else if (node.type === 'task') {
              const sticky = module.stickies.find(s => 
                s.tasks.some(t => t.id === nodeId)
              );
              if (sticky) {
                stickyId = sticky.id;
              }
            }
          }
        }
      }
    }

    updateNodePosition(node.type, courseId, nodeId, { x, y }, moduleId, stickyId);
  };

  const handleToggleCollapse = (node: MindMapNode) => {
    if (node.type === 'task') return;
    
    // Find course and module IDs for the node
    let courseId = '';
    let moduleId = '';

    if (node.type === 'course') {
      courseId = node.id;
    } else {
      const course = courses.find(c => 
        c.modules.some(m => 
          m.id === node.id || 
          m.stickies.some(s => s.id === node.id)
        )
      );
      
      if (course) {
        courseId = course.id;
        
        if (node.type === 'sticky') {
          const module = course.modules.find(m => 
            m.stickies.some(s => s.id === node.id)
          );
          if (module) {
            moduleId = module.id;
          }
        }
      }
    }

    toggleNodeCollapse(node.type, courseId, node.id, moduleId);
  };

  const handleCanvasLongPress = () => {
    Alert.alert(
      'Create New Node',
      'What would you like to create?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Course', onPress: () => onCreateNode?.('course', { x: 200, y: 200 }) },
        { text: 'Module', onPress: () => onCreateNode?.('module', { x: 200, y: 200 }) },
        { text: 'Sticky', onPress: () => onCreateNode?.('sticky', { x: 200, y: 200 }) },
        { text: 'Task', onPress: () => onCreateNode?.('task', { x: 200, y: 200 }) },
      ]
    );
  };

  const nodes = getAllNodes();
  const connections = getConnections();

  const resetCanvasView = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
    updateCanvasTransform({ x: 0, y: 0 }, 1);
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Canvas Controls */}
      <View className="absolute top-12 right-4 z-50 space-y-2">
        <Pressable
          onPress={resetCanvasView}
          className="bg-white w-12 h-12 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="home-outline" size={20} color="#374151" />
        </Pressable>
        
        <Pressable
          onPress={() => onCreateNode?.('course', { x: 100, y: 100 })}
          className="bg-blue-500 w-12 h-12 rounded-full items-center justify-center shadow-lg"
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* Main Canvas */}
      <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
        <Animated.View className="flex-1">
          <PanGestureHandler onGestureEvent={panGestureHandler}>
            <Animated.View className="flex-1">
              <Pressable
                onLongPress={handleCanvasLongPress}
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

                  {/* Draggable Nodes */}
                  {nodes.map((node) => (
                    <DraggableNode
                      key={node.id}
                      node={node}
                      onPositionChange={handleNodePositionChange}
                      onPress={onNodePress}
                      onToggleCollapse={handleToggleCollapse}
                      scale={scale.value}
                    />
                  ))}
                </Animated.View>
              </Pressable>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </PinchGestureHandler>
    </View>
  );
};

export default MindMapCanvas;