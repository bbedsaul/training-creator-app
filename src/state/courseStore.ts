import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseStore, Course, Module, Sticky, Task } from '../types';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: [],
      
      addCourse: (courseData) => {
        const newCourse: Course = {
          ...courseData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          modules: []
        };
        set(state => ({
          courses: [...state.courses, newCourse]
        }));
      },

      updateCourse: (id, updates) => {
        set(state => ({
          courses: state.courses.map(course => 
            course.id === id 
              ? { ...course, ...updates, updatedAt: new Date() }
              : course
          )
        }));
      },

      deleteCourse: (id) => {
        set(state => ({
          courses: state.courses.filter(course => course.id !== id)
        }));
      },

      addModule: (courseId, moduleData) => {
        const newModule: Module = {
          ...moduleData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          stickies: []
        };
        
        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? { 
                  ...course, 
                  modules: [...course.modules, newModule],
                  updatedAt: new Date()
                }
              : course
          )
        }));
      },

      updateModule: (courseId, moduleId, updates) => {
        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map(module =>
                    module.id === moduleId
                      ? { ...module, ...updates, updatedAt: new Date() }
                      : module
                  ),
                  updatedAt: new Date()
                }
              : course
          )
        }));
      },

      deleteModule: (courseId, moduleId) => {
        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.filter(module => module.id !== moduleId),
                  updatedAt: new Date()
                }
              : course
          )
        }));
      },

      addSticky: (courseId, moduleId, stickyData) => {
        const newSticky: Sticky = {
          ...stickyData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          tasks: []
        };

        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map(module =>
                    module.id === moduleId
                      ? {
                          ...module,
                          stickies: [...module.stickies, newSticky],
                          updatedAt: new Date()
                        }
                      : module
                  ),
                  updatedAt: new Date()
                }
              : course
          )
        }));
      },

      updateSticky: (courseId, moduleId, stickyId, updates) => {
        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map(module =>
                    module.id === moduleId
                      ? {
                          ...module,
                          stickies: module.stickies.map(sticky =>
                            sticky.id === stickyId
                              ? { ...sticky, ...updates, updatedAt: new Date() }
                              : sticky
                          ),
                          updatedAt: new Date()
                        }
                      : module
                  ),
                  updatedAt: new Date()
                }
              : course
          )
        }));
      },

      deleteSticky: (courseId, moduleId, stickyId) => {
        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map(module =>
                    module.id === moduleId
                      ? {
                          ...module,
                          stickies: module.stickies.filter(sticky => sticky.id !== stickyId),
                          updatedAt: new Date()
                        }
                      : module
                  ),
                  updatedAt: new Date()
                }
              : course
          )
        }));
      },

      addTask: (courseId, moduleId, stickyId, taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map(module =>
                    module.id === moduleId
                      ? {
                          ...module,
                          stickies: module.stickies.map(sticky =>
                            sticky.id === stickyId
                              ? {
                                  ...sticky,
                                  tasks: [...sticky.tasks, newTask],
                                  updatedAt: new Date()
                                }
                              : sticky
                          ),
                          updatedAt: new Date()
                        }
                      : module
                  ),
                  updatedAt: new Date()
                }
              : course
          )
        }));
      },

      updateTask: (courseId, moduleId, stickyId, taskId, updates) => {
        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map(module =>
                    module.id === moduleId
                      ? {
                          ...module,
                          stickies: module.stickies.map(sticky =>
                            sticky.id === stickyId
                              ? {
                                  ...sticky,
                                  tasks: sticky.tasks.map(task =>
                                    task.id === taskId
                                      ? { ...task, ...updates, updatedAt: new Date() }
                                      : task
                                  ),
                                  updatedAt: new Date()
                                }
                              : sticky
                          ),
                          updatedAt: new Date()
                        }
                      : module
                  ),
                  updatedAt: new Date()
                }
              : course
          )
        }));
      },

      deleteTask: (courseId, moduleId, stickyId, taskId) => {
        set(state => ({
          courses: state.courses.map(course =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map(module =>
                    module.id === moduleId
                      ? {
                          ...module,
                          stickies: module.stickies.map(sticky =>
                            sticky.id === stickyId
                              ? {
                                  ...sticky,
                                  tasks: sticky.tasks.filter(task => task.id !== taskId),
                                  updatedAt: new Date()
                                }
                              : sticky
                          ),
                          updatedAt: new Date()
                        }
                      : module
                  ),
                  updatedAt: new Date()
                }
              : course
          )
        }));
      }
    }),
    {
      name: 'course-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);