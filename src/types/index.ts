export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sticky {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  stickies: Sticky[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  createdAt: Date;
  updatedAt: Date;
  estimatedDuration?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string;
}

export interface CourseStore {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addModule: (courseId: string, module: Omit<Module, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateModule: (courseId: string, moduleId: string, updates: Partial<Module>) => void;
  deleteModule: (courseId: string, moduleId: string) => void;
  addSticky: (courseId: string, moduleId: string, sticky: Omit<Sticky, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSticky: (courseId: string, moduleId: string, stickyId: string, updates: Partial<Sticky>) => void;
  deleteSticky: (courseId: string, moduleId: string, stickyId: string) => void;
  addTask: (courseId: string, moduleId: string, stickyId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (courseId: string, moduleId: string, stickyId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (courseId: string, moduleId: string, stickyId: string, taskId: string) => void;
}