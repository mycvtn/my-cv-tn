export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended";
export type SubscriptionTier = "none" | "semi_annual" | "annual";
export type SubscriptionStatus = "inactive" | "active" | "expired";

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
  subscriptionTier?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionExpiresAt?: string;
  monthlyDownloadsUsed?: number;
  downloadsResetDate?: string;
}

export interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
