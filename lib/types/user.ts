export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  defaultCurrency: string;
  customContextPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  image?: string;
  defaultCurrency?: string;
  customContextPrompt?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
