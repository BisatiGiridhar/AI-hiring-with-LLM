/**
 * Axios API service with JWT interceptors, auto-refresh, and error handling.
 * All API calls go through this service — never use raw fetch in components.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { TokenResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s for AI pipeline evaluation
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach JWT ────────────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response Interceptor: Auto-refresh on 401 ─────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string) => void; reject: (reason: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        // No refresh token: clear auth and redirect to login
        authService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post<TokenResponse>(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const { access_token, refresh_token } = response.data;
        authService.setTokens(access_token, refresh_token, response.data.user);
        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth Service ───────────────────────────────────────────────────────────
export const authService = {
  setTokens: (accessToken: string, refreshToken: string, user: object) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
  },
  clearTokens: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  getStoredUser: () => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  },
  isAuthenticated: () => !!localStorage.getItem('access_token'),
};

// ── API Methods ────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: object) => api.post('/api/auth/register', data),
  login:    (data: object) => api.post('/api/auth/login', data),
  me:       ()             => api.get('/api/auth/me'),
  logout:   ()             => api.post('/api/auth/logout'),
  updateMe: (data: object) => api.put('/api/auth/me', data),
};

export const hiringAPI = {
  evaluate:      (formData: FormData) => api.post('/api/hiring/evaluate-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getEvals:      (page = 1, size = 10) => api.get(`/api/hiring/evaluations?page=${page}&page_size=${size}`),
  getEval:       (id: number) => api.get(`/api/hiring/evaluations/${id}`),
  deleteEval:    (id: number) => api.delete(`/api/hiring/evaluations/${id}`),
  dashboardStats: () => api.get('/api/hiring/dashboard/stats'),
  uploadRagDoc:  (formData: FormData) => api.post('/api/hiring/rag/upload-document', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const jobsAPI = {
  create: (data: object) => api.post('/api/jobs/', data),
  list:   (activeOnly = true) => api.get(`/api/jobs/?active_only=${activeOnly}`),
  get:    (id: number) => api.get(`/api/jobs/${id}`),
  update: (id: number, data: object) => api.put(`/api/jobs/${id}`, data),
  delete: (id: number) => api.delete(`/api/jobs/${id}`),
  mine:   () => api.get('/api/jobs/my/postings'),
};

export const adminAPI = {
  stats:        () => api.get('/api/admin/stats'),
  users:        (role?: string) => api.get(`/api/admin/users${role ? `?role=${role}` : ''}`),
  getUser:      (id: number) => api.get(`/api/admin/users/${id}`),
  updateUser:   (id: number, data: object) => api.patch(`/api/admin/users/${id}`, data),
  deleteUser:   (id: number) => api.delete(`/api/admin/users/${id}`),
  auditLogs:    () => api.get('/api/admin/audit-logs'),
  allEvals:     () => api.get('/api/admin/evaluations'),
};

export const experimentsAPI = {
  benchmarks: () => api.get('/api/experiments/benchmarks'),
  ablation:   () => api.get('/api/experiments/ablation'),
};

export default api;
