import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCourseStore } from '../state/courseStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateTask'>;
type RouteProps = RouteProp<RootStackParamList, 'CreateTask'>;

export default function CreateTaskScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { addTask, courses } = useCourseStore();

  const { courseId, moduleId, stickyId } = route.params;
  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);
  const sticky = module?.stickies.find(s => s.id === stickyId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a task description');
      return;
    }

    addTask(courseId, moduleId, stickyId, {
      title: title.trim(),
      description: description.trim(),
      isCompleted: false,
    });

    navigation.goBack();
  };

  if (!course || !module || !sticky) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Sticky not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-4"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="py-6 space-y-6">
          {/* Context */}
          <View className="bg-purple-50 rounded-lg p-4">
            <Text className="text-sm text-purple-600 font-medium mb-1">
              Adding task to:
            </Text>
            <Text className="text-lg font-semibold text-purple-900">
              {sticky.title}
            </Text>
            <Text className="text-sm text-purple-700 mt-1">
              in {module.title} • {course.title}
            </Text>
          </View>

          {/* Title */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Task Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task title..."
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe what needs to be done..."
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Tips */}
          <View className="bg-gray-50 rounded-lg p-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              ✅ Task Tips:
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              • Make tasks specific and actionable{"\n"}
              • Break down complex work into smaller tasks{"\n"}
              • Use clear, descriptive titles that explain the outcome
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 py-4 border-t border-gray-200 space-y-3">
        <Pressable
          onPress={handleSave}
          className="bg-purple-500 py-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold text-base">
            Create Task
          </Text>
        </Pressable>
        
        <Pressable
          onPress={() => navigation.goBack()}
          className="py-4 rounded-lg"
        >
          <Text className="text-gray-600 text-center font-medium text-base">
            Cancel
          </Text>
        </Pressable>
      </View>
    </View>
  );
}