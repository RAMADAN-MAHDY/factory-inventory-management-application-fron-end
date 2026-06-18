'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  title: string;
  showProductsManagement?: boolean;
  showDashboard?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  showProductsManagement = false,
  showDashboard = false,
}) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl px-4 py-3 sm:px-8 sm:py-5 flex justify-between items-center relative">
      <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-lg">{title}</h1>
      <div className="hidden sm:flex items-center gap-3 sm:gap-6">
        {showProductsManagement && user?.role === 'owner' && (
          <button
            onClick={() => router.push('/products-management')}
            className="bg-white text-blue-600 px-4 py-2 rounded-2xl font-bold text-base sm:px-6 sm:py-3 sm:text-xl hover:bg-gray-100 transition-all"
          >
            🛠️ إدارة المنتجات
          </button>
        )}
        {showDashboard && (
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white text-blue-600 px-4 py-2 rounded-2xl font-bold text-base sm:px-6 sm:py-3 sm:text-xl hover:bg-gray-100 transition-all"
          >
            رجوع للوحة التحكم
          </button>
        )}
        {user && (
          <span className="text-base sm:text-2xl text-white font-semibold">
            {user.username} ({user.role === 'owner' ? 'مالك المصنع' : 'أمين المخزن'})
          </span>
        )}
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-2xl font-bold text-base sm:px-6 sm:py-3 sm:text-xl hover:bg-red-600 transform hover:scale-105 transition-all shadow-lg"
        >
          تسجيل الخروج
        </button>
      </div>
      <button
        className="sm:hidden text-white text-3xl focus:outline-none"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        ☰
      </button>
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg py-2 z-10">
          {showProductsManagement && user?.role === 'owner' && (
            <button
              onClick={() => {
                router.push('/products-management');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left text-white px-4 py-2 text-lg hover:bg-blue-700"
            >
              🛠️ إدارة المنتجات
            </button>
          )}
          {showDashboard && (
            <button
              onClick={() => {
                router.push('/dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left text-white px-4 py-2 text-lg hover:bg-blue-700"
            >
              رجوع للوحة التحكم
            </button>
          )}
          {user && (
            <span className="block w-full text-left text-white px-4 py-2 text-lg font-semibold">
              {user.username} ({user.role === 'owner' ? 'مالك المصنع' : 'أمين المخزن'})
            </span>
          )}
          <button
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-left text-white px-4 py-2 text-lg hover:bg-red-700"
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
