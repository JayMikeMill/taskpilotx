export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  displayName?: string;
  avatar?: string;
  dateJoined: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  success: boolean;
  errors?: string[];
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  displayName?: string;
}
