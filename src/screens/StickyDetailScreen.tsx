import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCourseStore } from '../state/courseStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Task } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'StickyDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'StickyDetail'>;

export default function StickyDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { courses, deleteTask, updateTask } = useCourseStore();
  
  const { course, module, sticky } = route.params;
  
  // Get the latest data from store
  const currentCourse = courses.find(c => c.id === course.id);
  const currentModule = currentCourse?.modules.find(m => m.id === module.id);
  const currentSticky = currentModule?.stickies.find(s => s.id === sticky.id);
  
  if (!currentCourse || !currentModule || !currentSticky) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Sticky not found</Text>
      </View>
    );
  }

  const handleDeleteTask = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteTask(currentCourse.id, currentModule.id, currentSticky.id, task.id)
        }
      ]
    );
  };

  const handleToggleTask = (task: Task) => {
    updateTask(currentCourse.id, currentModule.id, currentSticky.id, task.id, {
      isCompleted: !task.isCompleted
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCompletedTaskCount = () => {
    return currentSticky.tasks.filter(task => task.isCompleted).length;
  };

  const getProgressPercentage = () => {
    const total = currentSticky.tasks.length;
    if (total === 0) return 0;
    const completed = getCompletedTaskCount();
    return Math.round((completed / total) * 100);
  };

  const progress = getProgressPercentage();
  const completedCount = getCompletedTaskCount();
  const totalCount = currentSticky.tasks.length;

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        automaticallyAdjustContentInsets
        contentInsetAdjustmentBehavior="automatic"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pb-4">
          {/* Sticky Info Header */}
          <View className="bg-yellow-50 rounded-xl p-4 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {currentSticky.title}
            </Text>
            <Text className="text-gray-700 mb-3 leading-6">
              {currentSticky.description}
            </Text>
            
            {/* Progress */}
            {totalCount > 0 && (
              <View className="mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm text-gray-600">
                    {completedCount}/{totalCount} tasks completed
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {progress}%
                  </Text>
                </View>
                <View className="bg-gray-200 h-2 rounded-full">
                  <View 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </View>
              </View>
            )}
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle-outline" size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-1">
                    {totalCount} tasks
                  </Text>
                </View>
                {completedCount > 0 && (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={16} color="#EAB308" />
                    <Text className="text-sm text-yellow-600 ml-1">
                      {completedCount} done
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-sm text-gray-500">
                Updated {formatDate(currentSticky.updatedAt)}
              </Text>
            </View>
          </View>

          {/* Tasks Section */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Tasks ({totalCount})
            </Text>
            <Pressable
              onPress={() => navigation.navigate('CreateTask', { 
                courseId: currentCourse.id, 
                moduleId: currentModule.id,
                stickyId: currentSticky.id
              })}
              className="bg-purple-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Add Task</Text>
            </Pressable>
          </View>

          {currentSticky.tasks.length === 0 ? (
            <View className="items-center justify-center py-12 bg-gray-50 rounded-xl">
              <Ionicons name="checkmark-circle-outline" size={48} color="#9CA3AF" />
              <Text className="text-lg font-semibold text-gray-600 mt-3 mb-2">
                No Tasks Yet
              </Text>
              <Text className="text-gray-500 text-center mb-4 px-8">
                Add your first task to start breaking down the work in this sticky.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('CreateTask', { 
                  courseId: currentCourse.id, 
                  moduleId: currentModule.id,
                  stickyId: currentSticky.id
                })}
                className="bg-purple-500 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Create First Task</Text>
              </Pressable>
            </View>
          ) : (
            <View className="space-y-3">
              {currentSticky.tasks.map((task, index) => (
                <View
                  key={task.id}
                  className={`bg-white border rounded-xl p-4 shadow-sm ${
                    task.isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center mb-2">
                        <Pressable
                          onPress={() => handleToggleTask(task)}
                          className="mr-3"
                        >
                          <Ionicons 
                            name={task.isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'} 
                            size={24} 
                            color={task.isCompleted ? '#10B981' : '#6B7280'} 
                          />
                        </Pressable>
                        <Text className={`text-lg font-semibold ${
                          task.isCompleted ? 'text-green-700 line-through' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </Text>
                      </View>
                      <Text className={`text-sm leading-5 ml-9 ${
                        task.isCompleted ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteTask(task)}
                      className="p-2"
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </Pressable>
                  </View>
                  
                  <View className="flex-row items-center justify-between ml-9 mt-2">
                    <View className="flex-row items-center">
                      <Ionicons 
                        name={task.isCompleted ? 'checkmark-circle' : 'time-outline'} 
                        size={14} 
                        color={task.isCompleted ? '#10B981' : '#6B7280'} 
                      />
                      <Text className={`text-xs ml-1 ${
                        task.isCompleted ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {task.isCompleted ? 'Completed' : 'Pending'}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500">
                      {formatDate(task.updatedAt)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}