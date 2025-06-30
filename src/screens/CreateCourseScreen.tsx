import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCourseStore } from '../state/courseStore';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateCourse'>;

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const CATEGORY_OPTIONS = [
  'Programming', 'Design', 'Business', 'Marketing', 'Health', 'Fitness', 
  'Photography', 'Music', 'Language', 'Academic', 'Personal Development', 'Other'
];

export default function CreateCourseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { addCourse } = useCourseStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | ''>('');
  const [category, setCategory] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a course title');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a course description');
      return;
    }

    addCourse({
      title: title.trim(),
      description: description.trim(),
      estimatedDuration: estimatedDuration.trim() || undefined,
      difficulty: difficulty || undefined,
      category: category || undefined,
    });

    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1 px-4"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="py-6 space-y-6">
          {/* Title */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Course Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter course title..."
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
              placeholder="Describe what students will learn in this course..."
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Estimated Duration */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Estimated Duration
            </Text>
            <TextInput
              value={estimatedDuration}
              onChangeText={setEstimatedDuration}
              placeholder="e.g., 2 hours, 1 week, 3 days..."
              className="border border-gray-300 rounded-lg px-4 py-3 text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Difficulty */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Difficulty Level
            </Text>
            <View className="flex-row space-x-3">
              {DIFFICULTY_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setDifficulty(difficulty === option ? '' : option)}
                  className={`flex-1 py-3 px-4 rounded-lg border ${
                    difficulty === option 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text className={`text-center font-medium ${
                    difficulty === option ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Category */}
          <View>
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setCategory(category === option ? '' : option)}
                  className={`py-2 px-3 rounded-full border ${
                    category === option 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    category === option ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 py-4 border-t border-gray-200 space-y-3">
        <Pressable
          onPress={handleSave}
          className="bg-blue-500 py-4 rounded-lg"
        >
          <Text className="text-white text-center font-semibold text-base">
            Create Course
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