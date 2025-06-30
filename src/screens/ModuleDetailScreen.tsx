import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCourseStore } from '../state/courseStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Sticky } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ModuleDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'ModuleDetail'>;

export default function ModuleDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { courses, deleteSticky } = useCourseStore();
  
  const { course, module } = route.params;
  
  // Get the latest course and module data from store
  const currentCourse = courses.find(c => c.id === course.id);
  const currentModule = currentCourse?.modules.find(m => m.id === module.id);
  
  if (!currentCourse || !currentModule) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Module not found</Text>
      </View>
    );
  }

  const handleDeleteSticky = (sticky: Sticky) => {
    Alert.alert(
      'Delete Sticky',
      `Are you sure you want to delete "${sticky.title}"? This will remove all tasks within this sticky.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteSticky(currentCourse.id, currentModule.id, sticky.id)
        }
      ]
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTaskCount = (sticky: Sticky) => {
    return sticky.tasks.length;
  };

  const getCompletedTaskCount = (sticky: Sticky) => {
    return sticky.tasks.filter(task => task.isCompleted).length;
  };

  const getProgressPercentage = (sticky: Sticky) => {
    const total = sticky.tasks.length;
    if (total === 0) return 0;
    const completed = getCompletedTaskCount(sticky);
    return Math.round((completed / total) * 100);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        automaticallyAdjustContentInsets
        contentInsetAdjustmentBehavior="automatic"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pb-4">
          {/* Module Info Header */}
          <View className="bg-green-50 rounded-xl p-4 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {currentModule.title}
            </Text>
            <Text className="text-gray-700 mb-3 leading-6">
              {currentModule.description}
            </Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <Ionicons name="document-text-outline" size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-1">
                    {currentModule.stickies.length} stickies
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle-outline" size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-1">
                    {currentModule.stickies.reduce((total, sticky) => total + sticky.tasks.length, 0)} total tasks
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-gray-500">
                Updated {formatDate(currentModule.updatedAt)}
              </Text>
            </View>
          </View>

          {/* Stickies Section */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Stickies ({currentModule.stickies.length})
            </Text>
            <Pressable
              onPress={() => navigation.navigate('CreateSticky', { 
                courseId: currentCourse.id, 
                moduleId: currentModule.id 
              })}
              className="bg-green-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Add Sticky</Text>
            </Pressable>
          </View>

          {currentModule.stickies.length === 0 ? (
            <View className="items-center justify-center py-12 bg-gray-50 rounded-xl">
              <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
              <Text className="text-lg font-semibold text-gray-600 mt-3 mb-2">
                No Stickies Yet
              </Text>
              <Text className="text-gray-500 text-center mb-4 px-8">
                Create your first sticky note to organize tasks within this module.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('CreateSticky', { 
                  courseId: currentCourse.id, 
                  moduleId: currentModule.id 
                })}
                className="bg-green-500 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Create First Sticky</Text>
              </Pressable>
            </View>
          ) : (
            <View className="space-y-3">
              {currentModule.stickies.map((sticky, index) => {
                const progress = getProgressPercentage(sticky);
                const taskCount = getTaskCount(sticky);
                const completedCount = getCompletedTaskCount(sticky);
                
                return (
                  <Pressable
                    key={sticky.id}
                    onPress={() => navigation.navigate('StickyDetail', { 
                      course: currentCourse, 
                      module: currentModule, 
                      sticky 
                    })}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center mb-1">
                          <View className="bg-green-100 w-6 h-6 rounded-full items-center justify-center mr-2">
                            <Text className="text-green-800 text-xs font-bold">
                              {index + 1}
                            </Text>
                          </View>
                          <Text className="text-lg font-semibold text-gray-900">
                            {sticky.title}
                          </Text>
                        </View>
                        <Text className="text-gray-600 text-sm leading-5 ml-8">
                          {sticky.description}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteSticky(sticky)}
                        className="p-2"
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </Pressable>
                    </View>

                    {/* Progress Bar */}
                    {taskCount > 0 && (
                      <View className="ml-8 mb-3">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-xs text-gray-600">
                            {completedCount}/{taskCount} tasks completed
                          </Text>
                          <Text className="text-xs text-gray-600">
                            {progress}%
                          </Text>
                        </View>
                        <View className="bg-gray-200 h-2 rounded-full">
                          <View 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </View>
                      </View>
                    )}

                    <View className="flex-row items-center justify-between ml-8">
                      <View className="flex-row items-center space-x-4">
                        <View className="flex-row items-center">
                          <Ionicons name="checkmark-circle-outline" size={14} color="#6B7280" />
                          <Text className="text-xs text-gray-600 ml-1">
                            {taskCount} tasks
                          </Text>
                        </View>
                        {completedCount > 0 && (
                          <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                            <Text className="text-xs text-green-600 ml-1">
                              {completedCount} done
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-xs text-gray-500">
                        {formatDate(sticky.updatedAt)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}