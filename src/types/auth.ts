export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
}

export type AuthMode = 'login' | 'register' | 'forgot_password' | 'update_password';
