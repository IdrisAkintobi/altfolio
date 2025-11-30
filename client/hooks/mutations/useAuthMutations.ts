import { useMutation } from '@tanstack/react-query';
import { authService } from '../../services/auth.service';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
  });
}
