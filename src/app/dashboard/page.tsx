'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import api from '@/lib/api';
import { io } from 'socket.io-client';

interface Product {
  _id: string;
  name: string;
  quantity: number;
  criticalThreshold: number;
  imageUrl?: string;
  description?: string;
  logs: any[];
}

const DashboardPage: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchQueryRef = useRef('');
  const userRef = useRef(user);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetchProducts = async (query: string) => {
    if (!userRef.current) return;
    try {
      const res = await api.get('/products/search', { params: { search: query } });
      const sorted = [...res.data].sort((a, b) => {
        const aCrit = a.quantity <= a.criticalThreshold;
        const bCrit = b.quantity <= b.criticalThreshold;
        if (aCrit && !bCrit) return -1;
        if (!aCrit && bCrit) return 1;
        return a.quantity - b.quantity;
      });
      setProducts(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchProducts('');
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    const query = searchQuery.trim();
    debounceTimeoutRef.current = setTimeout(() => {
      fetchProducts(query);
    }, 400);
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [user, searchQuery]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

    socket.on('product:created', (product: Product) => {
      if (searchQueryRef.current.trim()) {
        fetchProducts(searchQueryRef.current.trim());
        return;
      }
      setProducts(prev => {
        const newList = [...prev, product];
        return newList.sort((a, b) => {
          const aCrit = a.quantity <= a.criticalThreshold;
          const bCrit = b.quantity <= b.criticalThreshold;
          if (aCrit && !bCrit) return -1;
          if (!aCrit && bCrit) return 1;
          return a.quantity - b.quantity;
        });
      });
    });

    socket.on('product:updated', (updatedProduct: Product) => {
      if (searchQueryRef.current.trim()) {
        fetchProducts(searchQueryRef.current.trim());
        return;
      }
      setProducts(prev => {
        const newList = prev.map(p => p._id === updatedProduct._id ? updatedProduct : p);
        return newList.sort((a, b) => {
          const aCrit = a.quantity <= a.criticalThreshold;
          const bCrit = b.quantity <= b.criticalThreshold;
          if (aCrit && !bCrit) return -1;
          if (!aCrit && bCrit) return 1;
          return a.quantity - b.quantity;
        });
      });
    });

    socket.on('product:deleted', (productId: string) => {
      if (searchQueryRef.current.trim()) {
        fetchProducts(searchQueryRef.current.trim());
        return;
      }
      setProducts(prev => prev.filter(p => p._id !== productId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-blue-600">جاري التحميل...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl px-4 py-3 sm:px-8 sm:py-5 flex justify-between items-center relative">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-lg">🧾 إدارة مخزن المصنع</h1>
        <div className="hidden sm:flex items-center gap-3 sm:gap-6">
          {user.role === 'owner' && (
            <button onClick={() => router.push('/products-management')} className="bg-white text-blue-600 px-4 py-2 rounded-2xl font-bold text-base sm:px-6 sm:py-3 sm:text-xl hover:bg-gray-100 transition-all">
              🛠️ إدارة المنتجات
            </button>
          )}
          <span className="text-base sm:text-2xl text-white font-semibold">{user.username} ({user.role === 'owner' ? 'مالك المصنع' : 'أمين المخزن'})</span>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-2xl font-bold text-base sm:px-6 sm:py-3 sm:text-xl hover:bg-red-600 transform hover:scale-105 transition-all shadow-lg">
            تسجيل الخروج
          </button>
        </div>
        <button className="sm:hidden text-white text-3xl focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          ☰
        </button>
        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg py-2 z-10">
            {user.role === 'owner' && (
              <button onClick={() => { router.push('/products-management'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white px-4 py-2 text-lg hover:bg-blue-700">
                🛠️ إدارة المنتجات
              </button>
            )}
            <span className="block w-full text-left text-white px-4 py-2 text-lg font-semibold">{user.username} ({user.role === 'owner' ? 'مالك المصنع' : 'أمين المخزن'})</span>
            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white px-4 py-2 text-lg hover:bg-red-700">
              تسجيل الخروج
            </button>
          </div>
        )}
      </nav>
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
                <ProductCard key={p._id} product={p} onUpdate={() => fetchProducts(searchQuery.trim())} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
