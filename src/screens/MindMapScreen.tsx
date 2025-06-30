import React, { useState } from 'react';
import { View, Text, Modal, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCourseStore } from '../state/courseStore';
import { MindMapNode, Position } from '../types';
import MindMapCanvas from '../components/MindMapCanvas';
import CreateCourseScreen from './CreateCourseScreen';
import CreateModuleScreen from './CreateModuleScreen';
import CreateStickyScreen from './CreateStickyScreen';
import CreateTaskScreen from './CreateTaskScreen';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CourseList'>;

export default function MindMapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { courses } = useCourseStore();
  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createType, setCreateType] = useState<'course' | 'module' | 'sticky' | 'task'>('course');
  const [createPosition, setCreatePosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedParentIds, setSelectedParentIds] = useState<{
    courseId?: string;
    moduleId?: string;
    stickyId?: string;
  }>({});

  const handleCreateNode = async (type: 'course' | 'module' | 'sticky' | 'task', position: Position) => {
    setCreateType(type);
    setCreatePosition(position);
    
    if (type === 'course') {
      // Course can be created directly
      setSelectedParentIds({});
      setCreateModalVisible(true);
    } else {
      // For other types, we need to select parents
      await selectParentForNode(type);
    }
  };

  const selectParentForNode = async (type: 'module' | 'sticky' | 'task') => {
    if (courses.length === 0) {
      Alert.alert('No Courses', 'Please create a course first');
      return;
    }

    if (type === 'module') {
      // Select course for module
      const courseOptions = courses.map(course => ({
        text: course.title,
        onPress: () => {
          setSelectedParentIds({ courseId: course.id });
          setCreateModalVisible(true);
        }
      }));
      
      Alert.alert(
        'Select Course',
        'Which course should this module belong to?',
        [
          { text: 'Cancel', style: 'cancel' },
          ...courseOptions,
        ]
      );
    } else if (type === 'sticky') {
      // Select course and module for sticky
      const courseOptions = courses
        .filter(course => course.modules.length > 0)
        .map(course => ({
          text: course.title,
          onPress: () => selectModuleForSticky(course.id)
        }));
      
      if (courseOptions.length === 0) {
        Alert.alert('No Modules', 'Please create a module first');
        return;
      }
      
      Alert.alert(
        'Select Course',
        'Which course should this sticky belong to?',
        [
          { text: 'Cancel', style: 'cancel' },
          ...courseOptions,
        ]
      );
    } else if (type === 'task') {
      // Select course, module, and sticky for task
      const courseOptions = courses
        .filter(course => course.modules.some(m => m.stickies.length > 0))
        .map(course => ({
          text: course.title,
          onPress: () => selectModuleForTask(course.id)
        }));
      
      if (courseOptions.length === 0) {
        Alert.alert('No Stickies', 'Please create a sticky first');
        return;
      }
      
      Alert.alert(
        'Select Course',
        'Which course should this task belong to?',
        [
          { text: 'Cancel', style: 'cancel' },
          ...courseOptions,
        ]
      );
    }
  };

  const selectModuleForSticky = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    const moduleOptions = course.modules.map(module => ({
      text: module.title,
      onPress: () => {
        setSelectedParentIds({ courseId, moduleId: module.id });
        setCreateModalVisible(true);
      }
    }));
    
    Alert.alert(
      'Select Module',
      'Which module should this sticky belong to?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...moduleOptions,
      ]
    );
  };

  const selectModuleForTask = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    const moduleOptions = course.modules
      .filter(m => m.stickies.length > 0)
      .map(module => ({
        text: module.title,
        onPress: () => selectStickyForTask(courseId, module.id)
      }));
    
    Alert.alert(
      'Select Module',
      'Which module should this task belong to?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...moduleOptions,
      ]
    );
  };

  const selectStickyForTask = (courseId: string, moduleId: string) => {
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
    if (!module) return;
    
    const stickyOptions = module.stickies.map(sticky => ({
      text: sticky.title,
      onPress: () => {
        setSelectedParentIds({ courseId, moduleId, stickyId: sticky.id });
        setCreateModalVisible(true);
      }
    }));
    
    Alert.alert(
      'Select Sticky',
      'Which sticky should this task belong to?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...stickyOptions,
      ]
    );
  };

  const handleNodePress = (node: MindMapNode) => {
    // Handle node selection/editing
    Alert.alert(
      node.title,
      `Type: ${node.type}\\nClick to edit or view details`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => navigateToNodeDetail(node) },
      ]
    );
  };

  const navigateToNodeDetail = (node: MindMapNode) => {
    // Navigate to appropriate detail screen based on node type
    if (node.type === 'course') {
      const course = courses.find(c => c.id === node.id);
      if (course) {
        navigation.navigate('CourseDetail', { course });
      }
    }
    // Add other navigation cases as needed
  };

  const closeModal = () => {
    setCreateModalVisible(false);
    setSelectedParentIds({});
  };

  const renderCreateModal = () => {
    // We'll use the existing create screens, but they'll need to handle custom positioning
    // For now, we'll just close the modal and let the regular creation flow work
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Create {createType.charAt(0).toUpperCase() + createType.slice(1)}
        </Text>
        <Text className="text-gray-600 mb-6 text-center px-8">
          Use the + button in the top right to create new items, or navigate to the detailed screens for advanced creation.
        </Text>
        <Pressable
          onPress={closeModal}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Close</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View 
        className="bg-white border-b border-gray-200 px-4 py-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900">
              Course Mind Map
            </Text>
            <Text className="text-gray-600 text-sm mt-1">
              Drag nodes to organize • Long press to create • Pinch to zoom
            </Text>
          </View>
          
          <Pressable
            onPress={() => navigation.navigate('CourseList')}
            className="bg-gray-100 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="list-outline" size={16} color="#374151" />
            <Text className="text-gray-700 font-medium ml-2">List View</Text>
          </Pressable>
        </View>
      </View>

      {/* Mind Map Canvas */}
      <MindMapCanvas
        onCreateNode={handleCreateNode}
        onNodePress={handleNodePress}
      />

      {/* Create Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View className="flex-1">
          {renderCreateModal()}
        </View>
      </Modal>
    </View>
  );
}