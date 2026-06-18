import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '@/lib/api';
import { PaginatedProductsResponse, Product } from '@/types';

type ProductsQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastQueryRef = useRef<Required<ProductsQuery>>({ search: '', page: 1, limit: 10 });

  const fetchProducts = useCallback(async (query: ProductsQuery = {}) => {
    const nextQuery: Required<ProductsQuery> = {
      search: query.search ?? lastQueryRef.current.search ?? '',
      page: query.page ?? lastQueryRef.current.page ?? 1,
      limit: query.limit ?? lastQueryRef.current.limit ?? 10,
    };

    lastQueryRef.current = nextQuery;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get<PaginatedProductsResponse>('/products/query', {
        params: {
          search: nextQuery.search,
          page: nextQuery.page,
          limit: nextQuery.limit,
        },
      });

      setProducts(res.data.products);
      setPage(res.data.page);
      setLimit(res.data.limit);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
      setHasNextPage(res.data.hasNextPage);
      setHasPrevPage(res.data.hasPrevPage);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء تحميل المنتجات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      await api.delete(`/products/${productId}`);
    } catch (err) {
      console.error(err);
      setError('تعذر حذف المنتج');
    }
  }, []);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

    const refetch = () => {
      fetchProducts(lastQueryRef.current);
    };

    socket.on('product:created', refetch);
    socket.on('product:updated', refetch);
    socket.on('product:deleted', refetch);

    return () => {
      socket.disconnect();
    };
  }, [fetchProducts]);

  return {
    products,
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    fetchProducts,
    deleteProduct,
    setProducts,
    setPage,
    setLimit,
  };
};
