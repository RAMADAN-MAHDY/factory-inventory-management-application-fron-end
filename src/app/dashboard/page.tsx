'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Navbar from '@/components/layout/Navbar';
import { useProducts } from '@/hooks/useProducts';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { products, page, limit, totalPages, hasNextPage, hasPrevPage, isLoading, error, fetchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    fetchProducts({ search: '', page: 1, limit: 10 });
  }, [user, fetchProducts]);

  useEffect(() => {
    if (!user) return;
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    const query = searchQuery.trim();
    debounceTimeoutRef.current = setTimeout(() => {
      fetchProducts({ search: query, page: 1, limit });
    }, 400);
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [user, searchQuery, limit, fetchProducts]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-blue-600">جاري التحميل...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar title="🧾 إدارة مخزن المصنع" showProductsManagement={user.role === 'owner'} />
      <main className="sm:p-8 p-3">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-800">المنتجات</h2>
          <div className="relative w-72 max-w-full">
            <input
              type="text"
              placeholder="ابحث باسم المنتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 backdrop-blur px-11 py-3 border border-white/60 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all text-gray-900 placeholder:text-gray-500"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto bg-white rounded-3xl shadow-2xl border-t-8 border-blue-500 p-2">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xl rounded-t-2xl">
              <tr>
                <th scope="col" className="py-4 px-4 text-left text-sm font-extrabold uppercase tracking-wider rounded-tl-2xl">صورة</th>
                <th scope="col" className="py-4 px-4 text-left text-sm font-extrabold uppercase tracking-wider">اسم المنتج</th>
                <th scope="col" className="py-4 px-4 text-left text-sm font-extrabold uppercase tracking-wider">الكمية</th>
                <th scope="col" className="py-4 px-4 text-left text-sm font-extrabold uppercase tracking-wider">الحد الحرج</th>
                <th scope="col" className="py-4 px-4 text-left text-sm font-extrabold uppercase tracking-wider">المؤشر</th>
                <th scope="col" className="py-4 px-4 text-left text-sm font-extrabold uppercase tracking-wider rounded-tr-2xl">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 font-semibold">
            {error}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between bg-white rounded-2xl shadow-lg p-3">
          <button
            disabled={!hasPrevPage || isLoading}
            onClick={() => fetchProducts({ search: searchQuery.trim(), page: Math.max(page - 1, 1), limit })}
            className={`px-4 py-2 rounded-xl font-bold ${!hasPrevPage || isLoading ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            السابق
          </button>
          <div className="text-gray-800 font-bold">
            صفحة {page} من {totalPages}
          </div>
          <button
            disabled={!hasNextPage || isLoading}
            onClick={() => fetchProducts({ search: searchQuery.trim(), page: page + 1, limit })}
            className={`px-4 py-2 rounded-xl font-bold ${!hasNextPage || isLoading ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            التالي
          </button>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
