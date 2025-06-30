import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCourseStore } from '../state/courseStore';
import { MindMapNode, Position, Course } from '../types';
import MindMapCanvas from '../components/MindMapCanvas';
import CreateCourseScreen from './CreateCourseScreen';
import CreateModuleScreen from './CreateModuleScreen';
import CreateStickyScreen from './CreateStickyScreen';
import CreateTaskScreen from './CreateTaskScreen';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MindMap'>;

export default function MindMapScreen({ route }: { route: { params: { course: Course } } }) {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { course } = route.params;
  const { updateCourse, addModule, addSticky, addTask, getAllNodesForCourse, getConnectionsForCourse } = useCourseStore();
  
  // Determine what type of object will be created next
  const getNextCreationType = () => {
    const hasModules = course.modules.length > 0;
    const hasModulesWithoutStickies = course.modules.some(m => m.stickies.length === 0);
    const hasStickiesWithoutTasks = course.modules.some(m => 
      m.stickies.some(s => s.tasks.length === 0)
    );
    
    if (!hasModules) return 'module';
    if (hasModulesWithoutStickies) return 'sticky';
    if (hasStickiesWithoutTasks) return 'task';
    return 'module';
  };
  
  // Debug function to clear all data
  const clearAllData = async () => {
    try {
      await AsyncStorage.removeItem('course-storage');
    } catch (error) {
      console.log('Error clearing data:', error);
    }
  };
  
  // Initialize course position if it doesn't have one
  React.useEffect(() => {
    if (!course.position || !course.size) {
      updateCourse(course.id, {
        position: { x: 200, y: 150 },
        size: { width: 200, height: 120 },
        color: '#3B82F6'
      });
    }
  }, [course.id]);
  
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createType, setCreateType] = useState<'course' | 'module' | 'sticky' | 'task'>('course');
  const [createPosition, setCreatePosition] = useState<Position>({ x: 0, y: 0 });
  const [selectedParentIds, setSelectedParentIds] = useState<{
    courseId?: string;
    moduleId?: string;
    stickyId?: string;
  }>({});
  const [selectionModalVisible, setSelectionModalVisible] = useState(false);
  const [selectionOptions, setSelectionOptions] = useState<{
    title: string;
    message: string;
    options: { text: string; onPress: () => void }[];
  }>({ title: '', message: '', options: [] });

  const handleCreateNode = async (type: 'course' | 'module' | 'sticky' | 'task', position: Position) => {
    setCreateType(type);
    setCreatePosition(position);
    
    if (type === 'course') {
      // Course can be created directly
      setSelectedParentIds({});
      setCreateModalVisible(true);
    } else {
      // For smart creation, automatically find the best parent
      await selectParentForNodeSmart(type);
    }
  };

  const selectParentForNodeSmart = async (type: 'module' | 'sticky' | 'task') => {
    if (type === 'module') {
      // For modules, always attach to the current course
      setSelectedParentIds({ courseId: course.id });
      setCreateModalVisible(true);
    } else if (type === 'sticky') {
      // Find the first module without stickies or the one with fewest stickies
      if (course.modules.length === 0) {
        showSelectionModal('No Modules', 'Please create a module first', [
          { text: 'OK', onPress: () => setSelectionModalVisible(false) }
        ]);
        return;
      }
      
      const targetModule = course.modules.find(m => m.stickies.length === 0) ||
                         course.modules.reduce((prev, curr) => 
                           prev.stickies.length <= curr.stickies.length ? prev : curr
                         );
      
      setSelectedParentIds({ courseId: course.id, moduleId: targetModule.id });
      setCreateModalVisible(true);
    } else if (type === 'task') {
      // Find the first sticky without tasks
      let targetSticky = null;
      let targetModule = null;
      
      for (const module of course.modules) {
        const sticky = module.stickies.find(s => s.tasks.length === 0) ||
                      module.stickies.reduce((prev, curr) => 
                        prev.tasks.length <= curr.tasks.length ? prev : curr
                      );
        
        if (sticky) {
          targetSticky = sticky;
          targetModule = module;
          break;
        }
      }
      
      if (targetSticky && targetModule) {
        setSelectedParentIds({ 
          courseId: course.id, 
          moduleId: targetModule.id, 
          stickyId: targetSticky.id 
        });
        setCreateModalVisible(true);
      } else {
        showSelectionModal('No Stickies', 'Please create a sticky first', [
          { text: 'OK', onPress: () => setSelectionModalVisible(false) }
        ]);
      }
    }
  };

  const showSelectionModal = (title: string, message: string, options: { text: string; onPress: () => void }[]) => {
    setSelectionOptions({ title, message, options });
    setSelectionModalVisible(true);
  };

  const selectParentForNode = async (type: 'module' | 'sticky' | 'task') => {
    if (type === 'module') {
      // For modules, always attach to the current course
      setSelectedParentIds({ courseId: course.id });
      setCreateModalVisible(true);
    } else if (type === 'sticky') {
      // Select module for sticky
      if (course.modules.length === 0) {
        showSelectionModal('No Modules', 'Please create a module first', [
          { text: 'OK', onPress: () => setSelectionModalVisible(false) }
        ]);
        return;
      }

      const moduleOptions = course.modules.map(module => ({
        text: module.title,
        onPress: () => {
          setSelectedParentIds({ courseId: course.id, moduleId: module.id });
          setSelectionModalVisible(false);
          setCreateModalVisible(true);
        }
      }));
      
      showSelectionModal(
        'Select Module',
        'Which module should this sticky belong to?',
        [
          { text: 'Cancel', onPress: () => setSelectionModalVisible(false) },
          ...moduleOptions,
        ]
      );
    } else if (type === 'task') {
      // Select module and sticky for task
      const modulesWithStickies = course.modules.filter(m => m.stickies.length > 0);
      
      if (modulesWithStickies.length === 0) {
        showSelectionModal('No Stickies', 'Please create a sticky first', [
          { text: 'OK', onPress: () => setSelectionModalVisible(false) }
        ]);
        return;
      }

      const moduleOptions = modulesWithStickies.map(module => ({
        text: module.title,
        onPress: () => {
          setSelectionModalVisible(false);
          selectStickyForTask(course.id, module.id);
        }
      }));
      
      showSelectionModal(
        'Select Module',
        'Which module should this task belong to?',
        [
          { text: 'Cancel', onPress: () => setSelectionModalVisible(false) },
          ...moduleOptions,
        ]
      );
    }
  };

  const selectModuleForSticky = (courseId: string) => {
    // This function is now redundant since we're working with a single course
    // but keeping it for compatibility with existing calls
    const moduleOptions = course.modules.map(module => ({
      text: module.title,
      onPress: () => {
        setSelectedParentIds({ courseId, moduleId: module.id });
        setSelectionModalVisible(false);
        setCreateModalVisible(true);
      }
    }));
    
    showSelectionModal(
      'Select Module',
      'Which module should this sticky belong to?',
      [
        { text: 'Cancel', onPress: () => setSelectionModalVisible(false) },
        ...moduleOptions,
      ]
    );
  };

  const selectModuleForTask = (courseId: string) => {
    const moduleOptions = course.modules
      .filter(m => m.stickies.length > 0)
      .map(module => ({
        text: module.title,
        onPress: () => {
          setSelectionModalVisible(false);
          selectStickyForTask(courseId, module.id);
        }
      }));
    
    showSelectionModal(
      'Select Module',
      'Which module should this task belong to?',
      [
        { text: 'Cancel', onPress: () => setSelectionModalVisible(false) },
        ...moduleOptions,
      ]
    );
  };

  const selectStickyForTask = (courseId: string, moduleId: string) => {
    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return;
    
    const stickyOptions = module.stickies.map(sticky => ({
      text: sticky.title,
      onPress: () => {
        setSelectedParentIds({ courseId, moduleId, stickyId: sticky.id });
        setSelectionModalVisible(false);
        setCreateModalVisible(true);
      }
    }));
    
    showSelectionModal(
      'Select Sticky',
      'Which sticky should this task belong to?',
      [
        { text: 'Cancel', onPress: () => setSelectionModalVisible(false) },
        ...stickyOptions,
      ]
    );
  };

  const handleNodePress = (node: MindMapNode) => {
    // Handle node selection/editing
    showSelectionModal(
      node.title,
      `Type: ${node.type}\nClick to edit or view details`,
      [
        { text: 'Cancel', onPress: () => setSelectionModalVisible(false) },
        { text: 'View Details', onPress: () => {
          setSelectionModalVisible(false);
          navigateToNodeDetail(node);
        }},
      ]
    );
  };

  const navigateToNodeDetail = (node: MindMapNode) => {
    // Navigate to appropriate detail screen based on node type
    if (node.type === 'course') {
      navigation.navigate('CourseDetail', { course });
    } else if (node.type === 'module') {
      const module = course.modules.find(m => m.id === node.id);
      if (module) {
        navigation.navigate('ModuleDetail', { course, module });
      }
    } else if (node.type === 'sticky') {
      // Find the module and sticky
      for (const module of course.modules) {
        const sticky = module.stickies.find(s => s.id === node.id);
        if (sticky) {
          navigation.navigate('StickyDetail', { course, module, sticky });
          return;
        }
      }
    }
    // Tasks don't have detail screens yet
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
              {course.title}
            </Text>
            <Text className="text-gray-600 text-sm mt-1">
              Drag nodes to organize • Long press to create • Pinch to zoom
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              {getAllNodesForCourse(course.id).length} nodes • {getConnectionsForCourse(course.id).length} connections • Next: {getNextCreationType()}
            </Text>
          </View>
          
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-100 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="arrow-back-outline" size={16} color="#374151" />
            <Text className="text-gray-700 font-medium ml-2">Back to Courses</Text>
          </Pressable>
        </View>
      </View>

      {/* Mind Map Canvas */}
      <MindMapCanvas
        onCreateNode={handleCreateNode}
        onNodePress={handleNodePress}
        nextCreationType={getNextCreationType()}
        courseId={course.id}
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

      {/* Selection Modal */}
      <Modal
        visible={selectionModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectionModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 m-6 max-w-sm w-full">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {selectionOptions.title}
            </Text>
            <Text className="text-gray-600 mb-6">
              {selectionOptions.message}
            </Text>
            <ScrollView className="max-h-60">
              {selectionOptions.options.map((option, index) => (
                <Pressable
                  key={index}
                  onPress={option.onPress}
                  className="py-3 px-4 bg-gray-50 rounded-lg mb-2 last:mb-0"
                >
                  <Text className="text-gray-900 font-medium text-center">
                    {option.text}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}