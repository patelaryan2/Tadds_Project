export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating?: number;
  reviews_count?: number;
  stock?: number;
  discount?: number;
  featured?: boolean;
  is_trending?: boolean;
  is_new?: boolean;
  brand?: string;
  created_at?: string;
}

export interface CartItem {
  id: number;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface User {
  email: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AdminSession {
  token: string;
  username: string;
  expires_at: string;
}

export type Category = string;
