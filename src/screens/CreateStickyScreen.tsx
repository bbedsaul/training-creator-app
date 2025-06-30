import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCourseStore } from '../state/courseStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateSticky'>;
type RouteProps = RouteProp<RootStackParamList, 'CreateSticky'>;

export default function CreateStickyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const insets = useSafeAreaInsets();
  const { addSticky, courses } = useCourseStore();

  const { courseId, moduleId } = route.params;
  const course = courses.find(c => c.id === courseId);
  const module = course?.modules.find(m => m.id === moduleId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a sticky title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a sticky description');
      return;
    }

    addSticky(courseId, moduleId, {
      title: title.trim(),
      description: description.trim(),
    });

    navigation.goBack();
  };

  if (!course || !module) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-lg text-gray-600">Module not found</Text>
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
          <View className="bg-green-50 rounded-lg p-4">
            <Text className="text-sm text-green-600 font-medium mb-1">
              Adding sticky to:
            </Text>
            <Text className="text-lg font-semibold text-green-900">
              {module.title}
            </Text>
            <Text className="text-sm text-green-700 mt-1">
              in {course.title}
            </Text>
          </View>

          {/* Title */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Sticky Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter sticky title..."
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
              placeholder="Describe what this sticky contains..."
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
              📝 Sticky Tips:
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              • Use stickies to group related tasks together{"\n"}
              • Each sticky can contain multiple actionable tasks{"\n"}
              • Think of stickies as mini-sections within a module
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 py-4 border-t border-gray-200 space-y-3">
        <Pressable
          onPress={handleSave}
          className="bg-yellow-500 py-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold text-base">
            Create Sticky
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