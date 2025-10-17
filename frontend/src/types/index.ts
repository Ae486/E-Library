// User Types
export interface User {
  id: number;
  username: string;
  email: string | null;
  phone: string | null;
  role: 'reader' | 'admin';
  special_reader_type: string | null;
  created_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}

// Book Types
export interface Book {
  id: number;
  title: string;
  author: string | null;
  isbn: string | null;
  category: string | null;
  publisher: string | null;
  total_quantity: number;
  available_quantity: number;
  description: string | null;
  created_at: string;
}

export interface BorrowingRecord {
  id: number;
  user_id: number;
  book_id: number;
  title: string;
  author: string;
  isbn: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  status: 'borrowed' | 'returned';
  rating: number | null;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface BooksResponse {
  success: boolean;
  books: Book[];
}

export interface BorrowingsResponse {
  success: boolean;
  records: BorrowingRecord[];
}

// Statistics Types
export interface Statistics {
  total_users: number;
  total_books: number;
  total_borrowings: number;
  current_borrowings: number;
  popular_books?: Array<{
    title: string;
    author: string;
    borrow_count: number;
  }>;
}
