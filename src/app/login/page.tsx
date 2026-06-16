'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError('الاسم أو كلمة السر غلط');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg border-t-8 border-blue-500">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">تسجيل الدخول</h1>
        {error && <p className="text-red-600 text-center font-semibold mb-6 bg-red-50 py-3 px-4 rounded-xl">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xl font-extrabold text-gray-800 mb-3">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-5 text-2xl text-gray-900 font-semibold border-4 border-gray-300 rounded-3xl focus:outline-none focus:ring-6 focus:ring-blue-300 focus:border-blue-700 transition-all bg-gray-50"
              placeholder="مثال: owner أو manager"
              required
            />
          </div>
          <div>
            <label className="block text-xl font-extrabold text-gray-800 mb-3">كلمة السر</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-5 text-2xl text-gray-900 font-semibold border-4 border-gray-300 rounded-3xl focus:outline-none focus:ring-6 focus:ring-blue-300 focus:border-blue-700 transition-all bg-gray-50"
              placeholder="مثال: owner123 أو manager123"
              required
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all shadow-lg">
            دخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
