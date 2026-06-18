'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ProductForm from '@/components/products/ProductForm';
import ProductGrid from '@/components/products/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types';

const ProductsManagementPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { products, page, limit, totalPages, hasNextPage, hasPrevPage, isLoading, error, fetchProducts, deleteProduct } = useProducts();
  const [searchName, setSearchName] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || user.role !== 'owner') return;
    fetchProducts({ search: '', page: 1, limit: 9 });
  }, [user, fetchProducts]);

  useEffect(() => {
    if (!user || user.role !== 'owner') return;
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    const query = searchName.trim();
    debounceTimeoutRef.current = setTimeout(() => {
      fetchProducts({ search: query, page: 1, limit });
    }, 400);
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [user, searchName, limit, fetchProducts]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('متأكد عاوز تحذف هذا المنتج؟')) {
      await deleteProduct(productId);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading || !user || user.role !== 'owner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar title="🛠️ إدارة المنتجات" showDashboard />
      <main className="sm:p-8 p-2">
        <div className="flex justify-between items-center mb-8 sm:flex sm:items-center sm:gap-2 gap-4 flex-wrap ">
          <h2 className="text-3xl font-extrabold text-gray-800 ">كل المنتجات</h2>
          <input
            type="text"
            placeholder="بحث عن منتج"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="sm:w-1/2 w-full px-7 py-3 text-2xl text-gray-900  font-bold border-4 border-gray-300 rounded-3xl focus:outline-none focus:ring-6 focus:ring-green-300 focus:border-green-700 transition-all bg-gray-50"
          />
          <button onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditingProduct(null);
            }
          }} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-xl">
            {showForm ? 'إلغاء' : '+ إضافة منتج جديد'}
          </button>
        </div>

        {showForm && (
          <ProductForm product={editingProduct} onClose={handleCloseForm} />
        )}

        <ProductGrid
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 font-semibold">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between bg-white rounded-2xl shadow-lg p-3">
          <button
            disabled={!hasPrevPage || isLoading}
            onClick={() => fetchProducts({ search: searchName.trim(), page: Math.max(page - 1, 1), limit })}
            className={`px-4 py-2 rounded-xl font-bold ${!hasPrevPage || isLoading ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            السابق
          </button>
          <div className="text-gray-800 font-bold">
            صفحة {page} من {totalPages}
          </div>
          <button
            disabled={!hasNextPage || isLoading}
            onClick={() => fetchProducts({ search: searchName.trim(), page: page + 1, limit })}
            className={`px-4 py-2 rounded-xl font-bold ${!hasNextPage || isLoading ? 'bg-gray-200 text-gray-500' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            التالي
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProductsManagementPage;
