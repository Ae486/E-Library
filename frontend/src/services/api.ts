import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  BooksResponse,
  BorrowingsResponse,
  Book,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  resetPassword: async (username: string, phone: string, new_password: string) => {
    const response = await api.post('/auth/reset-password', {
      username,
      phone,
      new_password,
    });
    return response.data;
  },

  updateProfile: async (user_id: number, data: any) => {
    const response = await api.put('/auth/update-profile', {
      user_id,
      ...data,
    });
    return response.data;
  },
};

// Books API
export const booksApi = {
  search: async (query: string): Promise<BooksResponse> => {
    const response = await api.get(`/books/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  list: async (): Promise<BooksResponse> => {
    const response = await api.get('/books/list');
    return response.data;
  },

  getDetail: async (id: number): Promise<{ success: boolean; book: Book }> => {
    const response = await api.get(`/books/detail/${id}`);
    return response.data;
  },

  borrow: async (user_id: number, book_id: number) => {
    const response = await api.post('/books/borrow', { user_id, book_id });
    return response.data;
  },

  return: async (record_id: number) => {
    const response = await api.post('/books/return', { record_id });
    return response.data;
  },

  renew: async (record_id: number) => {
    const response = await api.post('/books/renew', { record_id });
    return response.data;
  },

  getMyBorrowings: async (user_id: number): Promise<BorrowingsResponse> => {
    const response = await api.get(`/books/my-borrowings/${user_id}`);
    return response.data;
  },

  getCategories: async (): Promise<{ success: boolean; categories: string[] }> => {
    const response = await api.get('/books/categories');
    return response.data;
  },

  rateBook: async (record_id: number, rating: number) => {
    const response = await api.post('/books/rate', { record_id, rating });
    return response.data;
  },

  submitFeedback: async (data: { user_id: number; type: string; content: string }) => {
    const response = await api.post('/books/feedback/submit', data);
    return response.data;
  },

  getMyFeedbacks: async (user_id: number) => {
    const response = await api.get(`/books/feedback/my/${user_id}`);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  addBook: async (data: Partial<Book>) => {
    const response = await api.post('/admin/books/add', data);
    return response.data;
  },

  updateBook: async (id: number, data: Partial<Book>) => {
    const response = await api.put(`/admin/books/update/${id}`, data);
    return response.data;
  },

  deleteBook: async (id: number) => {
    const response = await api.delete(`/admin/books/delete/${id}`);
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/admin/users/list');
    return response.data;
  },

  getUserStatistics: async (): Promise<any> => {
    const response = await api.get('/admin/users/statistics');
    return response.data;
  },

  getBorrowingStatistics: async (): Promise<any> => {
    const response = await api.get('/admin/borrowings/statistics');
    return response.data;
  },

  getFeedbacks: async () => {
    const response = await api.get('/admin/feedback/list');
    return response.data;
  },

  replyFeedback: async (feedback_id: number, admin_reply: string) => {
    const response = await api.put(`/admin/feedback/reply/${feedback_id}`, { admin_reply });
    return response.data;
  },
};

export default api;
