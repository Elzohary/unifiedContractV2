export interface Task {
  id: number;
  workOrderId: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string[];
  createdBy: string;
  createdDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  completionPercentage: number;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: number[]; // IDs of tasks that this task depends on
  attachments?: TaskAttachment[];
  subtasks?: SubTask[];
}

export interface SubTask {
  id: number;
  title: string;
  isCompleted: boolean;
  assignedTo?: string;
}

export interface TaskAttachment {
  id: number;
  name: string;
  url: string;
  type: string;
  size?: number;
  uploadedBy: string;
  uploadedDate: Date;
}

export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked' | 'deferred';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskComment {
  id: number;
  taskId: number;
  content: string;
  createdBy: string;
  createdDate: Date;
}

export interface TaskUpdate {
  id?: number;
  workOrderId?: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string[];
  dueDate?: Date;
  completedDate?: Date;
  completionPercentage?: number;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: number[];
} 