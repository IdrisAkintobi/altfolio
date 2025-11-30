// API client configuration and utilities
// Using relative paths since frontend is served by the backend
const API_PREFIX = '/api/v1';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

class ApiClient {
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setUnauthorizedCallback(callback: () => void) {
    this.onUnauthorized = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_PREFIX}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - trigger logout
      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }

      const errorMessage = data.message || 'An error occurred';
      const validationErrors = data.error?.errors
        ?.map((err: any) => err.msg || err.message)
        .join(', ');
      
      throw new ApiClientError(
        validationErrors ? `${errorMessage}: ${validationErrors}` : errorMessage,
        response.status,
        data.error
      );
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
