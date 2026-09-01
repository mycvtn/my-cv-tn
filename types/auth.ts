export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  credits: number;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
