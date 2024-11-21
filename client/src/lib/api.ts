import axios from 'axios';
import { getStoredToken, removeStoredToken } from './utils';
import { Status, Priority, Task } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10 seconds

const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests if needed (fallback for cookie auth)
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/')) {
      removeStoredToken();
      window.location.href = '/login';
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ error: 'Request timeout. Please try again.' });
    }
    return Promise.reject(error);
  }
);

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export const auth = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<{ token: string; user: { id: string; username: string; email: string } }>>('/auth/login', { username, password });
      return response.data;
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Login failed' };
    }
  },
  signup: async (username: string, email: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<{ token: string; user: { id: string; username: string; email: string } }>>('/auth/signup', { username, email, password });
      return response.data;
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Signup failed' };
    }
  },
};

export const tasks = {
  getAll: async () => {
    try {
      const response = await api.get<ApiResponse<{ tasks: Task[] }>>('/tasks');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { data: { tasks: [] } };
      }
      return { error: error.response?.data?.error || 'Failed to fetch tasks', data: { tasks: [] } };
    }
  },
  create: async (data: {
    title: string;
    description?: string;
    priority: Priority;
    isRecurring: boolean;
    recurrencePattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  }) => {
    try {
      const response = await api.post<ApiResponse<{ task: Task }>>('/tasks', data);
      return response.data;
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to create task' };
    }
  },
  update: async (id: string, data: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const response = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data);
      return response.data;
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to update task' };
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete<ApiResponse<{ success: boolean }>>(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to delete task' };
    }
  },
  updatePriority: async (id: string, priority: Priority) => {
    try {
      const response = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}/priority`, { priority });
      return response.data;
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to update task priority' };
    }
  },
  updateStatus: async (id: string, status: Status) => {
    try {
      const response = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to update task status' };
    }
  },
  archive: async (id: string) => {
    try {
      const response = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}/archive`);
      return response.data;
    } catch (error: any) {
      return { error: error.response?.data?.error || 'Failed to archive task' };
    }
  }
};
