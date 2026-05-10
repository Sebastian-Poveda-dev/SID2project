import type { UserRole } from './user';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  institutionalStudentId: string;
  institutionalEmail: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: UserRole;
}

export interface JwtPayload {
  sub: string;
  userId: number;
  role: UserRole;
  iat: number;
  exp: number;
}
