import { TableColumn } from '../ng-table.component';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: Date | null;
  joinDate: Date;
  department: string;
  employeeId: string;
  permissions: Permission[];
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  GUEST = 'guest'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export interface Permission {
  id: string;
  name: string;
}

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    lastLogin: new Date('2023-04-15T08:30:00'),
    joinDate: new Date('2020-01-10'),
    department: 'IT',
    employeeId: 'EMP001',
    permissions: [
      { id: 'p1', name: 'Create Users' },
      { id: 'p2', name: 'Delete Users' },
      { id: 'p3', name: 'Edit Settings' }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: UserRole.MANAGER,
    status: UserStatus.ACTIVE,
    lastLogin: new Date('2023-04-16T09:15:00'),
    joinDate: new Date('2020-02-15'),
    department: 'HR',
    employeeId: 'EMP002',
    permissions: [
      { id: 'p1', name: 'Create Users' },
      { id: 'p4', name: 'View Reports' }
    ]
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    role: UserRole.USER,
    status: UserStatus.INACTIVE,
    lastLogin: new Date('2023-03-20T14:45:00'),
    joinDate: new Date('2021-06-22'),
    department: 'Marketing',
    employeeId: 'EMP003',
    permissions: [
      { id: 'p4', name: 'View Reports' }
    ]
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    lastLogin: new Date('2023-04-16T11:30:00'),
    joinDate: new Date('2022-01-05'),
    department: 'Finance',
    employeeId: 'EMP004',
    permissions: [
      { id: 'p4', name: 'View Reports' },
      { id: 'p5', name: 'Submit Expenses' }
    ]
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    role: UserRole.MANAGER,
    status: UserStatus.SUSPENDED,
    lastLogin: new Date('2023-02-28T16:20:00'),
    joinDate: new Date('2019-11-18'),
    department: 'Operations',
    employeeId: 'EMP005',
    permissions: [
      { id: 'p1', name: 'Create Users' },
      { id: 'p4', name: 'View Reports' },
      { id: 'p6', name: 'Approve Workflows' }
    ]
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    role: UserRole.GUEST,
    status: UserStatus.PENDING,
    lastLogin: null,
    joinDate: new Date('2023-04-01'),
    department: 'External',
    employeeId: 'GUEST001',
    permissions: [
      { id: 'p7', name: 'View Public Content' }
    ]
  }
];

export const USER_TABLE_COLUMNS: TableColumn[] = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    isFilterable: true,
    isSortable: true
  },
  {
    name: 'email',
    label: 'Email',
    type: 'text',
    isFilterable: true,
    isSortable: true
  },
  {
    name: 'role',
    label: 'Role',
    type: 'text',
    isFilterable: true,
    isSortable: true
  },
  {
    name: 'status',
    label: 'Status',
    type: 'text',
    isFilterable: true,
    isSortable: true
  },
  {
    name: 'department',
    label: 'Department',
    type: 'text',
    isFilterable: true,
    isSortable: true
  },
  {
    name: 'lastLogin',
    label: 'Last Login',
    type: 'date',
    isFilterable: false,
    isSortable: true
  },
  {
    name: 'joinDate',
    label: 'Join Date',
    type: 'date',
    isFilterable: true,
    isSortable: true
  }
];

// Example of products data
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isActive: boolean;
  createdAt: Date;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Laptop',
    category: 'Electronics',
    price: 1299.99,
    stock: 45,
    isActive: true,
    createdAt: new Date('2022-10-15')
  },
  {
    id: 'p2',
    name: 'Smartphone',
    category: 'Electronics',
    price: 799.99,
    stock: 120,
    isActive: true,
    createdAt: new Date('2022-11-20')
  },
  {
    id: 'p3',
    name: 'Headphones',
    category: 'Audio',
    price: 199.99,
    stock: 78,
    isActive: true,
    createdAt: new Date('2023-01-05')
  },
  {
    id: 'p4',
    name: 'Desk Chair',
    category: 'Furniture',
    price: 249.99,
    stock: 32,
    isActive: true,
    createdAt: new Date('2023-02-18')
  },
  {
    id: 'p5',
    name: 'Coffee Maker',
    category: 'Kitchen',
    price: 89.99,
    stock: 15,
    isActive: false,
    createdAt: new Date('2022-08-30')
  }
];

export const PRODUCT_TABLE_COLUMNS: TableColumn[] = [
  {
    name: 'name',
    label: 'Product Name',
    type: 'text',
    isFilterable: true,
    isSortable: true
  },
  {
    name: 'category',
    label: 'Category',
    type: 'text',
    isFilterable: true,
    isSortable: true
  },
  {
    name: 'price',
    label: 'Price',
    type: 'currency',
    isFilterable: true,
    isSortable: true
  },
  {
    name: 'stock',
    label: 'Stock',
    type: 'number',
    isFilterable: true,
    isSortable: true
  },
  {
    name: 'isActive',
    label: 'Active',
    type: 'boolean',
    isFilterable: true,
    isSortable: true
  },
  {
    name: 'createdAt',
    label: 'Created Date',
    type: 'date',
    isFilterable: false,
    isSortable: true
  }
];
