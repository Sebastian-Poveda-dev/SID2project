export type UserRole = 'STUDENT' | 'EMPLOYEE' | 'ADMIN';

export interface UserSummary {
  username: string;
  role: UserRole;
}

export interface UserResponse {
  id: number;
  username: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}
