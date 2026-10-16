/**
 * ============================================================
 * AuraDay Unified API Service Client
 * Connects frontend state directly to Spring Boot backend & PostgreSQL
 * ============================================================
 */

import { ProofPost, PrivacyMode, InteractionType } from '../types';

const API_BASE = '/api';

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  defaultPrivacyMode?: PrivacyMode;
  role: string;
  createdAt?: string;
}

export interface UserStats {
  userId: number;
  username: string;
  totalLockerPosts: number;
  totalFriends: number;
  currentStreakDays: number;
  totalStudyMinutes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ---------------- Helper for Token Management ----------------
export const getStoredToken = (): string | null => {
  return localStorage.getItem('auraday_token');
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem('auraday_token', token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem('auraday_token');
  localStorage.removeItem('auraday_user');
};

const getHeaders = (isMultipart = false): HeadersInit => {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ---------------- Generic fetch wrapper ----------------
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isMultipart = options.body instanceof FormData;
  const config: RequestInit = {
    ...options,
    headers: {
      ...getHeaders(isMultipart),
      ...(options.headers || {})
    }
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    let errorMsg = `Lỗi yêu cầu (${response.status})`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) errorMsg = errorJson.message;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  const result: ApiResponse<T> = await response.json();
  return result.data;
}

// ---------------- 1. Authentication & Bootstrap ----------------
export const authApi = {
  login: async (usernameOrEmail = 'lehongson', password = 'password123') => {
    const data = await request<{ accessToken: string; user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password })
    });
    setStoredToken(data.accessToken);
    localStorage.setItem('auraday_user', JSON.stringify(data.user));
    return data;
  },

  register: async (payload: { username: string; email: string; password: string; avatarUrl?: string }) => {
    const data = await request<{ accessToken: string; user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setStoredToken(data.accessToken);
    localStorage.setItem('auraday_user', JSON.stringify(data.user));
    return data;
  },

  bootstrap: async (): Promise<ApiUser | null> => {
    const token = getStoredToken();
    if (token) {
      try {
        const user = await userApi.getMe();
        return user;
      } catch (e) {
        clearStoredToken();
      }
    }
    return null;
  },

  logout: () => {
    clearStoredToken();
    localStorage.removeItem('auraday_user');
  }
};

// ---------------- 2. User & Profile API ----------------
export const userApi = {
  getMe: () => request<ApiUser>('/users/me'),

  updateProfile: (data: { username?: string; bio?: string; avatarUrl?: string; defaultPrivacyMode?: PrivacyMode }) =>
    request<ApiUser>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  updatePassword: (data: { oldPassword: string; newPassword: string }) =>
    request<string>('/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  uploadAvatar: async (file: File | Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file, 'avatar.jpg');
    return request<string>('/users/me/avatar', {
      method: 'POST',
      body: formData
    });
  },

  getStats: () => request<UserStats>('/users/me/stats')
};

// ---------------- 3. Daily Logs & Check-In API ----------------
export const dailyLogApi = {
  getTodayLog: () => request<any>('/daily-logs/today'),

  checkIn: (payload: {
    logDate?: string;
    ateOnTime: 'ON_TIME' | 'LATE' | 'SKIPPED';
    hadSnacks: boolean;
    studyMinutes: number;
    note?: string;
  }) =>
    request<any>('/daily-logs/check-in', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};

// ---------------- 4. Proofs & Locker API ----------------
export const proofApi = {
  createProof: (payload: {
    imageUrl: string;
    caption?: string;
    privacyMode: PrivacyMode;
    dailyLogId?: number;
  }) =>
    request<ProofPost>('/proofs', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  uploadProofFile: (file: File | Blob, caption?: string, privacyMode: PrivacyMode = 'PUBLIC', dailyLogId?: number) => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    formData.append('privacyMode', privacyMode);
    if (dailyLogId) formData.append('dailyLogId', dailyLogId.toString());

    return request<ProofPost>('/proofs/upload', {
      method: 'POST',
      body: formData
    });
  },

  getLocker: (params?: {
    year?: number;
    month?: number;
    date?: string;
    privacyMode?: string;
    page?: number;
    size?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.year) query.append('year', params.year.toString());
    if (params?.month) query.append('month', params.month.toString());
    if (params?.date) query.append('date', params.date);
    if (params?.privacyMode) query.append('privacyMode', params.privacyMode);
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());

    return request<PageResponse<ProofPost>>(`/proofs/locker?${query.toString()}`);
  }
};

// ---------------- 5. Feed & Interactions API ----------------
export const feedApi = {
  getFeed: (page = 0, size = 20) =>
    request<PageResponse<ProofPost>>(`/feed?page=${page}&size=${size}`),

  interact: (postId: number, type: InteractionType, content?: string) =>
    request<any>(`/posts/${postId}/interactions`, {
      method: 'POST',
      body: JSON.stringify({ type, content })
    }),

  getInteractions: (postId: number) =>
    request<any[]>(`/posts/${postId}/interactions`)
};

// ---------------- 6. Friends & Social API ----------------
export const friendsApi = {
  getFriends: () => request<any[]>('/friends'),

  getSuggestions: () => request<any[]>('/friends/suggestions'),

  getRequests: () => request<any[]>('/friends/requests'),

  sendRequest: (targetUserId: number) =>
    request<any>(`/friends/request/${targetUserId}`, {
      method: 'POST'
    }),

  acceptRequest: (friendshipId: number) =>
    request<any>(`/friends/accept/${friendshipId}`, {
      method: 'PUT'
    }),

  rejectRequest: (friendshipId: number) =>
    request<any>(`/friends/reject/${friendshipId}`, {
      method: 'PUT'
    })
};

// ---------------- 7. Custom Tasks API ----------------
export const taskApi = {
  getTasks: () => request<any[]>('/tasks'),

  createTask: (payload: { title: string; category?: string; targetTime?: string }) =>
    request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  toggleTask: (taskId: number) =>
    request<any>(`/tasks/${taskId}/toggle`, {
      method: 'PUT'
    }),

  deleteTask: (taskId: number) =>
    request<void>(`/tasks/${taskId}`, {
      method: 'DELETE'
    })
};
