import { User } from '../../shared/types';
import { apiClient } from '../lib/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  status: string;
  message: string;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    token: string;
  };
}

export const authService = {
  async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const { token, ...userData } = response.data;
    apiClient.setToken(token);
    return {
      user: userData as User,
      token,
    };
  },

  async register(userData: RegisterRequest): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    const { token, ...userDataResponse } = response.data;
    apiClient.setToken(token);
    return {
      user: userDataResponse as User,
      token,
    };
  },

  logout() {
    apiClient.setToken(null);
  },

  getStoredToken(): string | null {
    return apiClient.getToken();
  },
};
