import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCourseStore } from '../state/courseStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateModule'>;
type RouteProps = RouteProp<RootStackParamList, 'CreateModule'>;

export default function CreateModuleScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { addModule, courses } = useCourseStore();

  const { courseId } = route.params;
  const course = courses.find(c => c.id === courseId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a module title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a module description');
      return;
    }

    addModule(courseId, {
      title: title.trim(),
      description: description.trim(),
    });

    navigation.goBack();
  };

  if (!course) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Course not found</Text>
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
          {/* Course Context */}
          <View className="bg-blue-50 rounded-lg p-4">
            <Text className="text-sm text-blue-600 font-medium mb-1">
              Adding module to:
            </Text>
            <Text className="text-lg font-semibold text-blue-900">
              {course.title}
            </Text>
          </View>

          {/* Title */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Module Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter module title..."
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
              placeholder="Describe what this module covers..."
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
              💡 Module Tips:
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              • Keep modules focused on specific topics or learning objectives{'\n'}
              • Each module should contain multiple stickies to organize content{'\n'}
              • Consider the logical flow when ordering modules
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 py-4 border-t border-gray-200 space-y-3">
        <Pressable
          onPress={handleSave}
          className="bg-green-500 py-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold text-base">
            Create Module
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