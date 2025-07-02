import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CourseStore, Course, Module, Sticky, Task, Position, MindMapNode, Connection } from '../types';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Default node sizes
const DEFAULT_SIZES = {
  course: { width: 200, height: 120 },
  module: { width: 160, height: 100 },
  sticky: { width: 140, height: 80 },
  task: { width: 120, height: 60 },
};

// Color scheme for different node types
const NODE_COLORS = {
  course: '#3B82F6',
  module: '#10B981', 
  sticky: '#F59E0B',
  task: '#8B5CF6',
};

// Auto-positioning logic
const getAutoPosition = (parentPosition?: Position, childIndex = 0, nodeType: 'course' | 'module' | 'sticky' | 'task' = 'course'): Position => {
  if (!parentPosition) {
    // Root courses positioned in a grid
    const cols = 3;
    const row = Math.floor(childIndex / cols);
    const col = childIndex % cols;
    return {
      x: 50 + col * 300,
      y: 50 + row * 200,
    };
  }

  // Child nodes positioned in a predictable pattern around parent
  const baseDistance = nodeType === 'module' ? 220 : nodeType === 'sticky' ? 180 : 140;
  
  // Create a spiral pattern instead of pure circle to avoid overlaps
  const spiral = Math.floor(childIndex / 8);
  const angleIndex = childIndex % 8;
  const radius = baseDistance + (spiral * 50);
  const angle = (angleIndex * (2 * Math.PI)) / 8;
  
  return {
    x: parentPosition.x + radius * Math.cos(angle),
    y: parentPosition.y + radius * Math.sin(angle),
  };
};

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: [],
      canvasOffset: { x: 0, y: 0 },
      canvasScale: 1,
      
      addCourse: (courseData, position) => {
        const coursePosition = position || getAutoPosition(undefined, get().courses.length, 'course');
        const newCourse: Course = {
          ...courseData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          modules: [],
          position: coursePosition,
          size: DEFAULT_SIZES.course,
          color: NODE_COLORS.course,
          isCollapsed: false,
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

      addModule: (courseId, moduleData, position) => {
        const course = get().courses.find(c => c.id === courseId);
        const modulePosition = position || getAutoPosition(course?.position, course?.modules.length || 0, 'module');
        
        const newModule: Module = {
          ...moduleData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          stickies: [],
          position: modulePosition,
          size: DEFAULT_SIZES.module,
          color: NODE_COLORS.module,
          isCollapsed: false,
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

      addSticky: (courseId, moduleId, stickyData, position) => {
        const course = get().courses.find(c => c.id === courseId);
        const module = course?.modules.find(m => m.id === moduleId);
        const stickyPosition = position || getAutoPosition(module?.position, module?.stickies.length || 0, 'sticky');
        
        const newSticky: Sticky = {
          ...stickyData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          tasks: [],
          position: stickyPosition,
          size: DEFAULT_SIZES.sticky,
          color: NODE_COLORS.sticky,
          isCollapsed: false,
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

      addTask: (courseId, moduleId, stickyId, taskData, position) => {
        const course = get().courses.find(c => c.id === courseId);
        const module = course?.modules.find(m => m.id === moduleId);
        const sticky = module?.stickies.find(s => s.id === stickyId);
        const taskPosition = position || getAutoPosition(sticky?.position, sticky?.tasks.length || 0, 'task');
        
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          position: taskPosition,
          size: DEFAULT_SIZES.task,
          color: NODE_COLORS.task,
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
      },

      // Mind map specific methods
      updateNodePosition: (nodeType, courseId, nodeId, position, moduleId, stickyId) => {
        set(state => ({
          courses: state.courses.map(course => {
            if (course.id !== courseId) return course;
            
            if (nodeType === 'course' && course.id === nodeId) {
              return { ...course, position };
            }
            
            return {
              ...course,
              modules: course.modules.map(module => {
                if (nodeType === 'module' && module.id === nodeId) {
                  return { ...module, position };
                }
                
                return {
                  ...module,
                  stickies: module.stickies.map(sticky => {
                    if (nodeType === 'sticky' && sticky.id === nodeId) {
                      return { ...sticky, position };
                    }
                    
                    return {
                      ...sticky,
                      tasks: sticky.tasks.map(task => {
                        if (nodeType === 'task' && task.id === nodeId) {
                          return { ...task, position };
                        }
                        return task;
                      })
                    };
                  })
                };
              })
            };
          })
        }));
      },

      updateCanvasTransform: (offset, scale) => {
        set({ canvasOffset: offset, canvasScale: scale });
      },

      getAllNodes: () => {
        const state = get();
        const nodes: MindMapNode[] = [];
        
        state.courses.forEach(course => {
          // Ensure course has position and size
          if (!course.position || !course.size) return;
          
          nodes.push({
            id: course.id,
            type: 'course',
            title: course.title,
            position: course.position,
            size: course.size,
            color: course.color || NODE_COLORS.course,
            isCollapsed: course.isCollapsed || false,
          });
          
          if (!course.isCollapsed) {
            course.modules.forEach(module => {
              // Ensure module has position and size
              if (!module.position || !module.size) return;
              
              nodes.push({
                id: module.id,
                type: 'module',
                title: module.title,
                position: module.position,
                size: module.size,
                parentId: course.id,
                color: module.color || NODE_COLORS.module,
                isCollapsed: module.isCollapsed || false,
              });
              
              if (!module.isCollapsed) {
                module.stickies.forEach(sticky => {
                  // Ensure sticky has position and size
                  if (!sticky.position || !sticky.size) return;
                  
                  nodes.push({
                    id: sticky.id,
                    type: 'sticky',
                    title: sticky.title,
                    position: sticky.position,
                    size: sticky.size,
                    parentId: module.id,
                    color: sticky.color || NODE_COLORS.sticky,
                    isCollapsed: sticky.isCollapsed || false,
                  });
                  
                  if (!sticky.isCollapsed) {
                    sticky.tasks.forEach(task => {
                      // Ensure task has position and size
                      if (!task.position || !task.size) return;
                      
                      nodes.push({
                        id: task.id,
                        type: 'task',
                        title: task.title,
                        position: task.position,
                        size: task.size,
                        parentId: sticky.id,
                        color: task.color || NODE_COLORS.task,
                        isCollapsed: false,
                      });
                    });
                  }
                });
              }
            });
          }
        });
        
        return nodes;
      },

      getConnections: () => {
        const state = get();
        const connections: Connection[] = [];
        
        state.courses.forEach(course => {
          // Ensure course has position and size
          if (!course.position || !course.size) return;
          
          // Only show connections to modules if course is not collapsed
          if (!course.isCollapsed) {
            course.modules.forEach(module => {
              // Ensure module has position and size
              if (!module.position || !module.size) return;
              
              connections.push({
                id: `${course.id}-${module.id}`,
                fromNodeId: course.id,
                toNodeId: module.id,
                fromPosition: {
                  x: course.position.x + course.size.width / 2,
                  y: course.position.y + course.size.height / 2,
                },
                toPosition: {
                  x: module.position.x + module.size.width / 2,
                  y: module.position.y + module.size.height / 2,
                },
              });
              
              // Only show connections to stickies if module is not collapsed
              if (!module.isCollapsed) {
                module.stickies.forEach(sticky => {
                  // Ensure sticky has position and size
                  if (!sticky.position || !sticky.size) return;
                  
                  connections.push({
                    id: `${module.id}-${sticky.id}`,
                    fromNodeId: module.id,
                    toNodeId: sticky.id,
                    fromPosition: {
                      x: module.position.x + module.size.width / 2,
                      y: module.position.y + module.size.height / 2,
                    },
                    toPosition: {
                      x: sticky.position.x + sticky.size.width / 2,
                      y: sticky.position.y + sticky.size.height / 2,
                    },
                  });
                  
                  // Only show connections to tasks if sticky is not collapsed
                  if (!sticky.isCollapsed) {
                    sticky.tasks.forEach(task => {
                      // Ensure task has position and size
                      if (!task.position || !task.size) return;
                      
                      connections.push({
                        id: `${sticky.id}-${task.id}`,
                        fromNodeId: sticky.id,
                        toNodeId: task.id,
                        fromPosition: {
                          x: sticky.position.x + sticky.size.width / 2,
                          y: sticky.position.y + sticky.size.height / 2,
                        },
                        toPosition: {
                          x: task.position.x + task.size.width / 2,
                          y: task.position.y + task.size.height / 2,
                        },
                      });
                    });
                  }
                });
              }
            });
          }
        });
        
        return connections;
      },

      toggleNodeCollapse: (nodeType, courseId, nodeId, moduleId) => {
        set(state => ({
          courses: state.courses.map(course => {
            if (course.id !== courseId) return course;
            
            if (nodeType === 'course' && course.id === nodeId) {
              return { ...course, isCollapsed: !course.isCollapsed };
            }
            
            return {
              ...course,
              modules: course.modules.map(module => {
                if (nodeType === 'module' && module.id === nodeId) {
                  return { ...module, isCollapsed: !module.isCollapsed };
                }
                
                return {
                  ...module,
                  stickies: module.stickies.map(sticky => {
                    if (nodeType === 'sticky' && sticky.id === nodeId) {
                      return { ...sticky, isCollapsed: !sticky.isCollapsed };
                    }
                    return sticky;
                  })
                };
              })
            };
          })
        }));
      },

      // Single course methods
      getAllNodesForCourse: (courseId: string) => {
        const state = get();
        const course = state.courses.find(c => c.id === courseId);
        if (!course) {
          console.log('Course not found:', courseId);
          return [];
        }

        const nodes: MindMapNode[] = [];
        
        // Ensure course has position and size
        if (!course.position || !course.size) {
          console.log('Course missing position/size - fixing...');
          // Fix missing course position/size
          const fixedCourse = {
            ...course,
            position: course.position || { x: 200, y: 150 },
            size: course.size || DEFAULT_SIZES.course,
            color: course.color || NODE_COLORS.course,
          };
          // Update the course in the store
          set(state => ({
            courses: state.courses.map(c => c.id === courseId ? fixedCourse : c)
          }));
          // Use the fixed values
          course.position = fixedCourse.position;
          course.size = fixedCourse.size;
          course.color = fixedCourse.color;
        }
        
        nodes.push({
          id: course.id,
          type: 'course',
          title: course.title,
          position: course.position,
          size: course.size,
          color: course.color || NODE_COLORS.course,
          isCollapsed: course.isCollapsed || false,
        });
        
        if (!course.isCollapsed) {
          course.modules.forEach((module, moduleIndex) => {
            // Ensure module has position and size
            if (!module.position || !module.size) {
              console.log('Module missing position/size, skipping:', module.title);
              return;
            }
            
            nodes.push({
              id: module.id,
              type: 'module',
              title: module.title,
              position: module.position,
              size: module.size,
              parentId: course.id,
              color: module.color || NODE_COLORS.module,
              isCollapsed: module.isCollapsed || false,
            });
            
            if (!module.isCollapsed) {
              module.stickies.forEach((sticky, stickyIndex) => {
                // Ensure sticky has position and size
                if (!sticky.position || !sticky.size) {
                  console.log('Sticky missing position/size, skipping:', sticky.title);
                  return;
                }
                
                nodes.push({
                  id: sticky.id,
                  type: 'sticky',
                  title: sticky.title,
                  position: sticky.position,
                  size: sticky.size,
                  parentId: module.id,
                  color: sticky.color || NODE_COLORS.sticky,
                  isCollapsed: sticky.isCollapsed || false,
                });
                
                if (!sticky.isCollapsed) {
                  sticky.tasks.forEach((task, taskIndex) => {
                    // Ensure task has position and size
                    if (!task.position || !task.size) {
                      console.log('Task missing position/size, skipping:', task.title);
                      return;
                    }
                    
                    nodes.push({
                      id: task.id,
                      type: 'task',
                      title: task.title,
                      position: task.position,
                      size: task.size,
                      parentId: sticky.id,
                      color: task.color || NODE_COLORS.task,
                      isCollapsed: false,
                    });
                  });
                }
              });
            }
          });
        }
        
        console.log(`Found ${nodes.length} nodes for course: ${course.title}`);
        return nodes;
      },

      getConnectionsForCourse: (courseId: string) => {
        const state = get();
        const course = state.courses.find(c => c.id === courseId);
        if (!course) return [];

        const connections: Connection[] = [];
        
        // Ensure course has position and size
        if (!course.position || !course.size) return [];
        
        course.modules.forEach(module => {
          // Ensure module has position and size
          if (!module.position || !module.size) return;
          
          connections.push({
            id: `${course.id}-${module.id}`,
            fromNodeId: course.id,
            toNodeId: module.id,
            fromPosition: {
              x: course.position.x + course.size.width / 2,
              y: course.position.y + course.size.height / 2,
            },
            toPosition: {
              x: module.position.x + module.size.width / 2,
              y: module.position.y + module.size.height / 2,
            },
          });
          
          module.stickies.forEach(sticky => {
            // Ensure sticky has position and size
            if (!sticky.position || !sticky.size) return;
            
            connections.push({
              id: `${module.id}-${sticky.id}`,
              fromNodeId: module.id,
              toNodeId: sticky.id,
              fromPosition: {
                x: module.position.x + module.size.width / 2,
                y: module.position.y + module.size.height / 2,
              },
              toPosition: {
                x: sticky.position.x + sticky.size.width / 2,
                y: sticky.position.y + sticky.size.height / 2,
              },
            });
            
            sticky.tasks.forEach(task => {
              // Ensure task has position and size
              if (!task.position || !task.size) return;
              
              connections.push({
                id: `${sticky.id}-${task.id}`,
                fromNodeId: sticky.id,
                toNodeId: task.id,
                fromPosition: {
                  x: sticky.position.x + sticky.size.width / 2,
                  y: sticky.position.y + sticky.size.height / 2,
                },
                toPosition: {
                  x: task.position.x + task.size.width / 2,
                  y: task.position.y + task.size.height / 2,
                },
              });
            });
          });
        });
        
        return connections;
      },
    }),
    {
      name: 'course-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);