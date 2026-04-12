import { useAuthStore } from '@/stores/authStore';
import type { ApiResponse, ApiError } from '@dragon-dino/shared';

const API_BASE = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = useAuthStore.getState().accessToken;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${useAuthStore.getState().accessToken}`;
        const retryResponse = await fetch(`${this.baseUrl}${path}`, {
          ...options,
          headers,
          credentials: 'include',
        });
        if (!retryResponse.ok) {
          throw await this.parseError(retryResponse);
        }
        return retryResponse.json();
      }
      useAuthStore.getState().logout();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      throw await this.parseError(response);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  private async parseError(response: Response): Promise<ApiError> {
    try {
      return await response.json();
    } catch {
      return {
        error: {
          code: 'UNKNOWN',
          message: response.statusText,
          requestId: '',
        },
      };
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = await res.json();
      useAuthStore.getState().setAccessToken(data.data.accessToken);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(path: string) {
    return this.request<ApiResponse<T>>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<ApiResponse<T>>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<ApiResponse<T>>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string) {
    return this.request<ApiResponse<T>>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE);
