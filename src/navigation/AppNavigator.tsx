import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Course, Module, Sticky } from '../types';

// Import screens
import CourseListScreen from '../screens/CourseListScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import ModuleDetailScreen from '../screens/ModuleDetailScreen';
import StickyDetailScreen from '../screens/StickyDetailScreen';
import CreateCourseScreen from '../screens/CreateCourseScreen';
import CreateModuleScreen from '../screens/CreateModuleScreen';
import CreateStickyScreen from '../screens/CreateStickyScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';

export type RootStackParamList = {
  CourseList: undefined;
  CourseDetail: { course: Course };
  ModuleDetail: { course: Course; module: Module };
  StickyDetail: { course: Course; module: Module; sticky: Sticky };
  CreateCourse: undefined;
  CreateModule: { courseId: string };
  CreateSticky: { courseId: string; moduleId: string };
  CreateTask: { courseId: string; moduleId: string; stickyId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="CourseList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLargeTitle: true,
      }}
    >
      <Stack.Screen 
        name="CourseList" 
        component={CourseListScreen}
        options={{
          title: 'My Courses',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen}
        options={({ route }) => ({
          title: route.params.course.title,
        })}
      />
      <Stack.Screen 
        name="ModuleDetail" 
        component={ModuleDetailScreen}
        options={({ route }) => ({
          title: route.params.module.title,
        })}
      />
      <Stack.Screen 
        name="StickyDetail" 
        component={StickyDetailScreen}
        options={({ route }) => ({
          title: route.params.sticky.title,
        })}
      />
      <Stack.Screen 
        name="CreateCourse" 
        component={CreateCourseScreen}
        options={{
          title: 'New Course',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="CreateModule" 
        component={CreateModuleScreen}
        options={{
          title: 'New Module',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="CreateSticky" 
        component={CreateStickyScreen}
        options={{
          title: 'New Sticky',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="CreateTask" 
        component={CreateTaskScreen}
        options={{
          title: 'New Task',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}