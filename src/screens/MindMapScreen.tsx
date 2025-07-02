import React, { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCourseStore } from '../state/courseStore';
import { MindMapNode, Course } from '../types';
import MindMapCanvas from '../components/MindMapCanvas';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MindMap'>;

interface EditingObject {
  id: string;
  type: 'course' | 'module' | 'sticky' | 'task';
  isNew?: boolean; // Track if this is a newly created object
}

export default function MindMapScreen({ route }: { route: { params: { course: Course } } }) {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { course: routeCourse } = route.params;
  const { 
    courses, 
    updateCourse, 
    addModule, 
    addSticky, 
    addTask, 
    updateModule,
    updateSticky,
    updateTask,
    deleteModule,
    deleteSticky,
    deleteTask,
    getAllNodesForCourse, 
    getConnectionsForCourse 
  } = useCourseStore();
  
  // Get the current course from the store
  const course = courses.find(c => c.id === routeCourse.id) || routeCourse;

  // Modal state for editing objects
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingObject, setEditingObject] = useState<EditingObject | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Initialize course position if needed
  React.useEffect(() => {
    if (!course.position || !course.size) {
      updateCourse(course.id, {
        position: { x: 200, y: 150 },
        size: { width: 200, height: 120 },
        color: '#3B82F6'
      });
    }
  }, [course.id]);

  const handleNodePress = (node: MindMapNode) => {
    if (selectedNodeId === node.id) {
      // Already selected - open for edit
      console.log('Double press on selected node:', node.type, node.title, '- opening for edit');
      
      setEditingObject({
        id: node.id,
        type: node.type as 'course' | 'module' | 'sticky' | 'task',
        isNew: false,
      });
    } else {
      // Not selected - select it
      console.log('Selecting node:', node.type, node.title);
      setSelectedNodeId(node.id);
      return; // Don't open edit modal yet
    }

    // Only open edit modal if we're editing

    // Find and set current values based on node type
    const course = courses.find(c => c.id === routeCourse.id) || routeCourse;
    
    switch (node.type) {
      case 'course':
        setTitle(course.title);
        setDescription(course.description || '');
        break;
        
      case 'module':
        const module = course.modules.find(m => m.id === node.id);
        if (module) {
          setTitle(module.title);
          setDescription(module.description || '');
        }
        break;
        
      case 'sticky':
        let foundSticky = null;
        for (const mod of course.modules) {
          const sticky = mod.stickies.find(s => s.id === node.id);
          if (sticky) {
            foundSticky = sticky;
            break;
          }
        }
        if (foundSticky) {
          setTitle(foundSticky.title);
          setDescription(foundSticky.description || '');
        }
        break;
        
      case 'task':
        let foundTask = null;
        for (const mod of course.modules) {
          for (const sticky of mod.stickies) {
            const task = sticky.tasks.find(t => t.id === node.id);
            if (task) {
              foundTask = task;
              break;
            }
          }
        }
        if (foundTask) {
          setTitle(foundTask.title);
          setDescription(foundTask.description || '');
        }
        break;
    }
    
    setEditModalVisible(true);
  };

  const handleNodeDelete = (node: MindMapNode) => {
    Alert.alert(
      `Delete ${node.type}`,
      `Are you sure you want to delete "${node.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => confirmDeleteNode(node)
        }
      ]
    );
  };

  const confirmDeleteNode = (node: MindMapNode) => {
    try {
      switch (node.type) {
        case 'course':
          // Don't allow deleting the course from within the mind map
          Alert.alert('Cannot Delete', 'Use the course list to delete courses.');
          break;
          
        case 'module':
          deleteModule(course.id, node.id);
          break;
          
        case 'sticky':
          const moduleForSticky = course.modules.find(m => 
            m.stickies.some(s => s.id === node.id)
          );
          if (moduleForSticky) {
            deleteSticky(course.id, moduleForSticky.id, node.id);
          }
          break;
          
        case 'task':
          let taskModuleId = '';
          let taskStickyId = '';
          
          for (const module of course.modules) {
            for (const sticky of module.stickies) {
              if (sticky.tasks.some(t => t.id === node.id)) {
                taskModuleId = module.id;
                taskStickyId = sticky.id;
                break;
              }
            }
          }
          
          if (taskModuleId && taskStickyId) {
            deleteTask(course.id, taskModuleId, taskStickyId, node.id);
          }
          break;
      }
      
      // Clear selection after delete
      setSelectedNodeId(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete object');
    }
  };

  const handleNodeLongPress = (node: MindMapNode) => {
    console.log('Long press detected on:', node.type, node.title);

    let newObjectType: 'module' | 'sticky' | 'task';

    // Create the actual object immediately based on parent type
    // Don't specify position - let the store's auto-positioning handle it
    switch (node.type) {
      case 'course':
        newObjectType = 'module';
        console.log('Creating module for course:', course.id);
        addModule(course.id, {
          title: 'New Module',
          description: '',
          stickies: []
        });
        break;

      case 'module':
        newObjectType = 'sticky';
        console.log('Creating sticky for module:', node.id);
        addSticky(course.id, node.id, {
          title: 'New Sticky',
          description: '',
          tasks: []
        });
        break;

      case 'sticky':
        newObjectType = 'task';
        console.log('Creating task for sticky:', node.id);
        // Find the module this sticky belongs to
        const moduleForSticky = course.modules.find(m => 
          m.stickies.some(s => s.id === node.id)
        );
        if (moduleForSticky) {
          addTask(course.id, moduleForSticky.id, node.id, {
            title: 'New Task',
            description: '',
            isCompleted: false
          });
        }
        break;

      default:
        console.log('Tasks cannot create children');
        return; // Tasks can't create children
    }

    // Wait a moment for the object to be created, then find it and set up editing
    setTimeout(() => {
      const updatedCourse = courses.find(c => c.id === course.id);
      if (!updatedCourse) return;

      let newObjectId = '';

      // Find the newly created object
      switch (newObjectType) {
        case 'module':
          const newestModule = updatedCourse.modules[updatedCourse.modules.length - 1];
          if (newestModule) newObjectId = newestModule.id;
          break;
          
        case 'sticky':
          const targetModule = updatedCourse.modules.find(m => m.id === node.id);
          if (targetModule) {
            const newestSticky = targetModule.stickies[targetModule.stickies.length - 1];
            if (newestSticky) newObjectId = newestSticky.id;
          }
          break;
          
        case 'task':
          const moduleForSticky = updatedCourse.modules.find(m => 
            m.stickies.some(s => s.id === node.id)
          );
          if (moduleForSticky) {
            const targetSticky = moduleForSticky.stickies.find(s => s.id === node.id);
            if (targetSticky) {
              const newestTask = targetSticky.tasks[targetSticky.tasks.length - 1];
              if (newestTask) newObjectId = newestTask.id;
            }
          }
          break;
      }

      if (newObjectId) {
        console.log('Found newly created object with ID:', newObjectId);
        // Set up editing state
        setEditingObject({
          id: newObjectId,
          type: newObjectType,
          isNew: true, // This is a newly created object
        });

        setTitle(`New ${newObjectType.charAt(0).toUpperCase() + newObjectType.slice(1)}`);
        setDescription('');
        setEditModalVisible(true);
      } else {
        console.error('Could not find newly created object');
      }
    }, 100); // Small delay to ensure state update
  };

  const handleSaveObject = () => {
    if (!editingObject || !title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    try {
      // Find the object and update it
      const updatedTitle = title.trim();
      const updatedDescription = description.trim();

      switch (editingObject.type) {
        case 'course':
          updateCourse(editingObject.id, {
            title: updatedTitle,
            description: updatedDescription
          });
          break;
          
        case 'module':
          updateModule(course.id, editingObject.id, {
            title: updatedTitle,
            description: updatedDescription
          });
          break;
          
        case 'sticky':
          // Find the module this sticky belongs to
          const moduleForSticky = course.modules.find(m => 
            m.stickies.some(s => s.id === editingObject.id)
          );
          if (moduleForSticky) {
            updateSticky(course.id, moduleForSticky.id, editingObject.id, {
              title: updatedTitle,
              description: updatedDescription
            });
          }
          break;
          
        case 'task':
          // Find the module and sticky this task belongs to
          let taskModuleId = '';
          let taskStickyId = '';
          
          for (const module of course.modules) {
            for (const sticky of module.stickies) {
              if (sticky.tasks.some(t => t.id === editingObject.id)) {
                taskModuleId = module.id;
                taskStickyId = sticky.id;
                break;
              }
            }
          }
          
          if (taskModuleId && taskStickyId) {
            updateTask(course.id, taskModuleId, taskStickyId, editingObject.id, {
              title: updatedTitle,
              description: updatedDescription
            });
          }
          break;
      }

      // Close modal and reset state
      setEditModalVisible(false);
      setEditingObject(null);
      setTitle('');
      setDescription('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save object');
    }
  };

  const handleCancelEdit = () => {
    if (!editingObject) return;

    // Only delete the object if it's newly created (not when editing existing objects)
    if (editingObject.isNew) {
      try {
        switch (editingObject.type) {
          case 'module':
            deleteModule(course.id, editingObject.id);
            break;
            
          case 'sticky':
            const moduleForSticky = course.modules.find(m => 
              m.stickies.some(s => s.id === editingObject.id)
            );
            if (moduleForSticky) {
              deleteSticky(course.id, moduleForSticky.id, editingObject.id);
            }
            break;
            
          case 'task':
            let taskModuleId = '';
            let taskStickyId = '';
            
            for (const module of course.modules) {
              for (const sticky of module.stickies) {
                if (sticky.tasks.some(t => t.id === editingObject.id)) {
                  taskModuleId = module.id;
                  taskStickyId = sticky.id;
                  break;
                }
              }
            }
            
            if (taskModuleId && taskStickyId) {
              deleteTask(course.id, taskModuleId, taskStickyId, editingObject.id);
            }
            break;
        }
      } catch (error) {
        console.error('Error deleting newly created object:', error);
      }
    }

    setEditModalVisible(false);
    setEditingObject(null);
    setTitle('');
    setDescription('');
  };

  const getObjectTypeIcon = (type: string) => {
    switch (type) {
      case 'module': return 'library-outline';
      case 'sticky': return 'document-text-outline';
      case 'task': return 'checkmark-circle-outline';
      default: return 'add-outline';
    }
  };

  const getObjectTypeColor = (type: string) => {
    switch (type) {
      case 'module': return '#10B981';
      case 'sticky': return '#F59E0B';
      case 'task': return '#8B5CF6';
      default: return '#6B7280';
    }
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
              Tap to select • Tap selected to edit • Long press to create children
            </Text>
            <Text className="text-gray-500 text-xs mt-1">
              {getAllNodesForCourse(course.id).length} nodes • {getConnectionsForCourse(course.id).length} connections
            </Text>
          </View>
          
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-gray-100 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="arrow-back-outline" size={16} color="#374151" />
            <Text className="text-gray-700 font-medium ml-2">Back</Text>
          </Pressable>
        </View>
      </View>

      {/* Mind Map Canvas - onPress for edit, onLongPress for create */}
      <MindMapCanvas
        onNodeLongPress={handleNodeLongPress}
        onNodePress={handleNodePress}
        onNodeDelete={handleNodeDelete}
        onClearSelection={() => setSelectedNodeId(null)}
        courseId={course.id}
        editingObjectId={editingObject?.id}
        selectedNodeId={selectedNodeId}
      />

      {/* Edit Object Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="border-b border-gray-200 px-4 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">
                {editingObject?.isNew ? 'Create' : 'Edit'} {editingObject?.type}
              </Text>
              <View className="flex-row space-x-3">
                <Pressable
                  onPress={handleCancelEdit}
                  className="px-4 py-2 rounded-lg bg-gray-100"
                >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveObject}
                  className="px-4 py-2 rounded-lg bg-blue-500"
                >
                  <Text className="text-white font-medium">Save</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Form */}
          <ScrollView className="flex-1 px-4 py-6">
            <View className="space-y-6">
              {/* Type indicator */}
              <View className="flex-row items-center justify-center p-4 bg-gray-50 rounded-xl">
                <View 
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: getObjectTypeColor(editingObject?.type || '') }}
                >
                  <Ionicons 
                    name={getObjectTypeIcon(editingObject?.type || '') as any} 
                    size={24} 
                    color="white" 
                  />
                </View>
                <Text className="text-lg font-semibold text-gray-900 capitalize">
                  {editingObject?.type}
                </Text>
              </View>

              {/* Title Input */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Title *
                </Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder={`Enter ${editingObject?.type} title...`}
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                  autoFocus={true}
                  selectTextOnFocus={true}
                  returnKeyType="next"
                />
              </View>

              {/* Description Input */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder={`Describe this ${editingObject?.type}...`}
                  className="border border-gray-300 rounded-lg px-3 py-3 text-base"
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Help Text */}
              <View className={`p-4 rounded-lg ${editingObject?.isNew ? 'bg-blue-50' : 'bg-green-50'}`}>
                <Text className={`text-sm ${editingObject?.isNew ? 'text-blue-800' : 'text-green-800'}`}>
                  {editingObject?.isNew 
                    ? `🆕 Creating a new ${editingObject?.type}. You can drag it to reposition while editing.`
                    : `✏️ Editing existing ${editingObject?.type}. You can drag it to reposition while editing.`
                  }
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}