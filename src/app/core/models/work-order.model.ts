export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdDate: Date;
  dueDate?: Date;
  completedDate?: Date;
  assignedTo?: User[];
  createdBy: User;
  category: string;
  location: string;
  workType: string;
  estimatedHours?: number;
  actualHours?: number;
  materials?: Material[];
  equipment?: Equipment[];
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface Equipment {
  id: string;
  name: string;
  quantity: number;
  hours: number;
  rate: number;
}

export interface Comment {
  id: string;
  content: string;
  createdBy: User;
  createdDate: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: User;
  uploadDate: Date;
} 