export interface Position {
  x: number;
  y: number;
}

export interface NodeSize {
  width: number;
  height: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  position: Position;
  size: NodeSize;
  color?: string;
}

export interface Sticky {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
  position: Position;
  size: NodeSize;
  color?: string;
  isCollapsed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  stickies: Sticky[];
  createdAt: Date;
  updatedAt: Date;
  position: Position;
  size: NodeSize;
  color?: string;
  isCollapsed?: boolean;
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
  position: Position;
  size: NodeSize;
  color?: string;
  isCollapsed?: boolean;
}

export interface MindMapNode {
  id: string;
  type: 'course' | 'module' | 'sticky' | 'task';
  title: string;
  position: Position;
  size: NodeSize;
  parentId?: string;
  color: string;
  isCollapsed: boolean;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  fromPosition: Position;
  toPosition: Position;
}

export interface CourseStore {
  courses: Course[];
  // Canvas state
  canvasOffset: Position;
  canvasScale: number;
  // CRUD operations
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'position' | 'size'>, position?: Position) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addModule: (courseId: string, module: Omit<Module, 'id' | 'createdAt' | 'updatedAt' | 'position' | 'size'>, position?: Position) => void;
  updateModule: (courseId: string, moduleId: string, updates: Partial<Module>) => void;
  deleteModule: (courseId: string, moduleId: string) => void;
  addSticky: (courseId: string, moduleId: string, sticky: Omit<Sticky, 'id' | 'createdAt' | 'updatedAt' | 'position' | 'size'>, position?: Position) => void;
  updateSticky: (courseId: string, moduleId: string, stickyId: string, updates: Partial<Sticky>) => void;
  deleteSticky: (courseId: string, moduleId: string, stickyId: string) => void;
  addTask: (courseId: string, moduleId: string, stickyId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position' | 'size'>, position?: Position) => void;
  updateTask: (courseId: string, moduleId: string, stickyId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (courseId: string, moduleId: string, stickyId: string, taskId: string) => void;
  // Mind map operations
  updateNodePosition: (nodeType: 'course' | 'module' | 'sticky' | 'task', courseId: string, nodeId: string, position: Position, moduleId?: string, stickyId?: string) => void;
  updateCanvasTransform: (offset: Position, scale: number) => void;
  getAllNodes: () => MindMapNode[];
  getConnections: () => Connection[];
  toggleNodeCollapse: (nodeType: 'course' | 'module' | 'sticky', courseId: string, nodeId: string, moduleId?: string) => void;
  // Single course methods
  getAllNodesForCourse: (courseId: string) => MindMapNode[];
  getConnectionsForCourse: (courseId: string) => Connection[];
}