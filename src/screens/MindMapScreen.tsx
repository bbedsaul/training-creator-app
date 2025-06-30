import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
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
  const { courses, addCourse, addModule, addSticky, addTask } = useCourseStore();
  
  // Add sample data on first load
  React.useEffect(() => {
    if (courses.length === 0) {
      // Add sample course
      addCourse({
        title: 'React Native Mastery',
        description: 'Complete course to master React Native development',
        category: 'Programming',
        difficulty: 'Intermediate',
        estimatedDuration: '8 weeks',
        modules: []
      });
      
      // We'll add modules after the course is created
      setTimeout(() => {
        const newCourses = useCourseStore.getState().courses;
        if (newCourses.length > 0) {
          const courseId = newCourses[0].id;
          
          // Add sample modules
          addModule(courseId, {
            title: 'Getting Started',
            description: 'Setting up your development environment',
            stickies: []
          });
          
          addModule(courseId, {
            title: 'Navigation',
            description: 'Learn React Navigation',
            stickies: []
          });
          
          // Add stickies and tasks
          setTimeout(() => {
            const updatedCourses = useCourseStore.getState().courses;
            const course = updatedCourses.find(c => c.id === courseId);
            if (course && course.modules.length > 0) {
              const moduleId = course.modules[0].id;
              
              addSticky(courseId, moduleId, {
                title: 'Environment Setup',
                description: 'Install tools and dependencies',
                tasks: []
              });
              
              // Add a task
              setTimeout(() => {
                const latestCourses = useCourseStore.getState().courses;
                const latestCourse = latestCourses.find(c => c.id === courseId);
                const latestModule = latestCourse?.modules.find(m => m.id === moduleId);
                if (latestModule && latestModule.stickies.length > 0) {
                  const stickyId = latestModule.stickies[0].id;
                  
                  addTask(courseId, moduleId, stickyId, {
                    title: 'Install Expo CLI',
                    description: 'Install the Expo CLI globally',
                    isCompleted: false,
                    tasks: []
                  });
                }
              }, 100);
            }
          }, 100);
        }
      }, 100);
    }
  }, []);
  
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
      // For other types, we need to select parents
      await selectParentForNode(type);
    }
  };

  const showSelectionModal = (title: string, message: string, options: { text: string; onPress: () => void }[]) => {
    setSelectionOptions({ title, message, options });
    setSelectionModalVisible(true);
  };

  const selectParentForNode = async (type: 'module' | 'sticky' | 'task') => {
    if (courses.length === 0) {
      showSelectionModal('No Courses', 'Please create a course first', [
        { text: 'OK', onPress: () => setSelectionModalVisible(false) }
      ]);
      return;
    }

    if (type === 'module') {
      // Select course for module
      const courseOptions = courses.map(course => ({
        text: course.title,
        onPress: () => {
          setSelectedParentIds({ courseId: course.id });
          setSelectionModalVisible(false);
          setCreateModalVisible(true);
        }
      }));
      
      showSelectionModal(
        'Select Course',
        'Which course should this module belong to?',
        [
          { text: 'Cancel', onPress: () => setSelectionModalVisible(false) },
          ...courseOptions,
        ]
      );
    } else if (type === 'sticky') {
      // Select course and module for sticky
      const courseOptions = courses
        .filter(course => course.modules.length > 0)
        .map(course => ({
          text: course.title,
          onPress: () => {
            setSelectionModalVisible(false);
            selectModuleForSticky(course.id);
          }
        }));
      
      if (courseOptions.length === 0) {
        showSelectionModal('No Modules', 'Please create a module first', [
          { text: 'OK', onPress: () => setSelectionModalVisible(false) }
        ]);
        return;
      }
      
      showSelectionModal(
        'Select Course',
        'Which course should this sticky belong to?',
        [
          { text: 'Cancel', onPress: () => setSelectionModalVisible(false) },
          ...courseOptions,
        ]
      );
    } else if (type === 'task') {
      // Select course, module, and sticky for task
      const courseOptions = courses
        .filter(course => course.modules.some(m => m.stickies.length > 0))
        .map(course => ({
          text: course.title,
          onPress: () => {
            setSelectionModalVisible(false);
            selectModuleForTask(course.id);
          }
        }));
      
      if (courseOptions.length === 0) {
        showSelectionModal('No Stickies', 'Please create a sticky first', [
          { text: 'OK', onPress: () => setSelectionModalVisible(false) }
        ]);
        return;
      }
      
      showSelectionModal(
        'Select Course',
        'Which course should this task belong to?',
        [
          { text: 'Cancel', onPress: () => setSelectionModalVisible(false) },
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
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
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
    const course = courses.find(c => c.id === courseId);
    const module = course?.modules.find(m => m.id === moduleId);
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