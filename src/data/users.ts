export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'employee';
  departmentNumber: string;
  departmentName: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export const users: User[] = [
  {
    id: '1',
    email: 'admin@xpress.com',
    password: 'admin123', // In production, use hashed passwords
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    departmentNumber: 'ADMIN-01',
    departmentName: 'Administration',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'manager@xpress.com',
    password: 'manager123',
    firstName: 'Manager',
    lastName: 'User',
    role: 'manager',
    departmentNumber: 'IT-01',
    departmentName: 'Information Technology',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    email: 'employee@xpress.com',
    password: 'employee123',
    firstName: 'Employee',
    lastName: 'User',
    role: 'employee',
    departmentNumber: 'IT-02',
    departmentName: 'Information Technology',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];