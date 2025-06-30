import React from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCourseStore } from '../state/courseStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Module } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CourseDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'CourseDetail'>;

export default function CourseDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { courses, deleteModule } = useCourseStore();
  
  const { course } = route.params;
  
  // Get the latest course data from store
  const currentCourse = courses.find(c => c.id === course.id);
  
  if (!currentCourse) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Course not found</Text>
      </View>
    );
  }

  const handleDeleteModule = (module: Module) => {
    Alert.alert(
      'Delete Module',
      `Are you sure you want to delete "${module.title}"? This will remove all stickies and tasks within this module.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteModule(currentCourse.id, module.id)
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

  const getStickyCount = (module: Module) => {
    return module.stickies.length;
  };

  const getTaskCount = (module: Module) => {
    return module.stickies.reduce((total, sticky) => total + sticky.tasks.length, 0);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          {/* Course Info Header */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-2">
              {currentCourse.title}
            </Text>
            <Text className="text-gray-700 mb-4 leading-6">
              {currentCourse.description}
            </Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-4">
                {currentCourse.difficulty && (
                  <View className={`px-3 py-1 rounded-full ${getDifficultyColor(currentCourse.difficulty)}`}>
                    <Text className="text-sm font-medium">
                      {currentCourse.difficulty}
                    </Text>
                  </View>
                )}
                {currentCourse.category && (
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-sm font-medium text-blue-800">
                      {currentCourse.category}
                    </Text>
                  </View>
                )}
                {currentCourse.estimatedDuration && (
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text className="text-sm text-gray-600 ml-1">
                      {currentCourse.estimatedDuration}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Modules Section */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">
              Modules ({currentCourse.modules.length})
            </Text>
            <Pressable
              onPress={() => navigation.navigate('CreateModule', { courseId: currentCourse.id })}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Add Module</Text>
            </Pressable>
          </View>

          {currentCourse.modules.length === 0 ? (
            <View className="items-center justify-center py-12 bg-gray-50 rounded-xl">
              <Ionicons name="library-outline" size={48} color="#9CA3AF" />
              <Text className="text-lg font-semibold text-gray-600 mt-3 mb-2">
                No Modules Yet
              </Text>
              <Text className="text-gray-500 text-center mb-4 px-8">
                Add your first module to start organizing your course content.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('CreateModule', { courseId: currentCourse.id })}
                className="bg-blue-500 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Create First Module</Text>
              </Pressable>
            </View>
          ) : (
            <View className="space-y-3">
              {currentCourse.modules.map((module, index) => (
                <Pressable
                  key={module.id}
                  onPress={() => navigation.navigate('ModuleDetail', { course: currentCourse, module })}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 pr-3">
                      <View className="flex-row items-center mb-1">
                        <View className="bg-blue-100 w-6 h-6 rounded-full items-center justify-center mr-2">
                          <Text className="text-blue-800 text-xs font-bold">
                            {index + 1}
                          </Text>
                        </View>
                        <Text className="text-lg font-semibold text-gray-900">
                          {module.title}
                        </Text>
                      </View>
                      <Text className="text-gray-600 text-sm leading-5 ml-8">
                        {module.description}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteModule(module)}
                      className="p-2"
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </Pressable>
                  </View>

                  <View className="flex-row items-center justify-between ml-8">
                    <View className="flex-row items-center space-x-4">
                      <View className="flex-row items-center">
                        <Ionicons name="document-text-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1">
                          {getStickyCount(module)} stickies
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1">
                          {getTaskCount(module)} tasks
                        </Text>
                      </View>
                    </View>
                    <Text className="text-xs text-gray-500">
                      {formatDate(module.updatedAt)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}