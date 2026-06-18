export interface User {
  _id: string;
  username: string;
  role: 'owner' | 'manager';
  token?: string;
}

export interface Product {
  _id: string;
  name: string;
  quantity: number;
  criticalThreshold: number;
  imageUrl?: string;
  description?: string;
  logs: any[];
}

export interface ProductFormData {
  name: string;
  quantity: number;
  criticalThreshold: number;
  description: string;
  imageUrl: string;
}

export interface PaginatedProductsResponse {
  products: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
