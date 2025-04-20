export interface User {
  id: string;
  name: string;
  email: string;
  role: 'engineer' | 'administrator' | 'foreman' | 'worker';
  avatar: string;
}
