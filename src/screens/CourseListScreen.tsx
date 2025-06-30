import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCourseStore } from '../state/courseStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Course } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CourseList'>;

export default function CourseListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { courses, deleteCourse, addCourse } = useCourseStore();

  // Add sample courses if none exist
  React.useEffect(() => {
    if (courses.length === 0) {
      addCourse({
        title: 'React Native Fundamentals',
        description: 'Learn the basics of React Native development from scratch',
        category: 'Mobile Development',
        difficulty: 'Beginner',
        estimatedDuration: '6 weeks',
        modules: []
      });
      
      addCourse({
        title: 'Advanced JavaScript Patterns',
        description: 'Master advanced JavaScript concepts and design patterns',
        category: 'Programming',
        difficulty: 'Advanced',
        estimatedDuration: '8 weeks',
        modules: []
      });

      addCourse({
        title: 'UI/UX Design Principles',
        description: 'Create beautiful and intuitive user interfaces',
        category: 'Design',
        difficulty: 'Intermediate',
        estimatedDuration: '4 weeks',
        modules: []
      });
    }
  }, []);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getModuleCount = (course: Course) => {
    return course.modules.length;
  };

  const getTotalStickies = (course: Course) => {
    return course.modules.reduce((total, module) => total + module.stickies.length, 0);
  };

  const getTotalTasks = (course: Course) => {
    return course.modules.reduce((total, module) => 
      total + module.stickies.reduce((stickyTotal, sticky) => stickyTotal + sticky.tasks.length, 0), 0
    );
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
          {courses.length === 0 ? (
            <View className="flex-1 items-center justify-center py-16">
              <Ionicons name="school-outline" size={64} color="#9CA3AF" />
              <Text className="text-xl font-semibold text-gray-600 mt-4 mb-2">
                No Courses Yet
              </Text>
              <Text className="text-gray-500 text-center mb-6 px-8">
                Create your first training course to get started with organizing your content.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('CreateCourse')}
                className="bg-blue-500 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Create First Course</Text>
              </Pressable>
            </View>
          ) : (
            <View className="space-y-4">
              {courses.map((course) => (
                <View
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 pr-3">
                      <Text className="text-lg font-semibold text-gray-900 mb-1">
                        {course.title}
                      </Text>
                      <Text className="text-gray-600 text-sm leading-5">
                        {course.description}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => deleteCourse(course.id)}
                      className="p-2"
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </Pressable>
                  </View>

                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center space-x-4">
                      <View className="flex-row items-center">
                        <Ionicons name="library-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1">
                          {getModuleCount(course)} modules
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="document-text-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1">
                          {getTotalStickies(course)} stickies
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-1">
                          {getTotalTasks(course)} tasks
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center space-x-2">
                      {course.difficulty && (
                        <View className={`px-2 py-1 rounded-full ${getDifficultyColor(course.difficulty)}`}>
                          <Text className="text-xs font-medium">
                            {course.difficulty}
                          </Text>
                        </View>
                      )}
                      {course.category && (
                        <View className="bg-blue-100 px-2 py-1 rounded-full">
                          <Text className="text-xs font-medium text-blue-800">
                            {course.category}
                          </Text>
                        </View>
                      )}
                      {course.estimatedDuration && (
                        <View className="bg-gray-100 px-2 py-1 rounded-full">
                          <Text className="text-xs font-medium text-gray-600">
                            {course.estimatedDuration}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-xs text-gray-500">
                      {formatDate(course.updatedAt)}
                    </Text>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row space-x-3">
                    <Pressable
                      onPress={() => navigation.navigate('MindMap', { course })}
                      className="flex-1 bg-blue-500 py-3 px-4 rounded-lg flex-row items-center justify-center"
                    >
                      <Ionicons name="git-network-outline" size={16} color="white" />
                      <Text className="text-white font-medium ml-2">Mind Map</Text>
                    </Pressable>
                    
                    <Pressable
                      onPress={() => navigation.navigate('CourseDetail', { course })}
                      className="flex-1 bg-gray-100 py-3 px-4 rounded-lg flex-row items-center justify-center"
                    >
                      <Ionicons name="list-outline" size={16} color="#374151" />
                      <Text className="text-gray-700 font-medium ml-2">Details</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {courses.length > 0 && (
        <View className="absolute bottom-6 right-6">
          <Pressable
            onPress={() => navigation.navigate('CreateCourse')}
            className="bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          >
            <Ionicons name="add" size={24} color="white" />
          </Pressable>
        </View>
      )}
    </View>
  );
}