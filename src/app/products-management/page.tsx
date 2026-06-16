'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
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

const ProductsManagementPage: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchName, setSearchName] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    criticalThreshold: 1,
    description: '',
    imageUrl: ''
  });
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'owner') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const fetchProducts = async () => {
    if (!user) return;
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(product =>
  product.name.includes(searchName)
);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);

    socket.on('product:created', (product: Product) => {
      setProducts(prev => [...prev, product]);
    });

    socket.on('product:updated', (updatedProduct: Product) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    });

    socket.on('product:deleted', (productId: string) => {
      setProducts(prev => prev.filter(p => p._id !== productId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch (err) {
      console.error(err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error('Camera access denied or error:', err);
      alert('لم نتمكن من الوصول للكاميرا، من فضلك اسمح بالوصول');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append('image', blob, 'photo.jpg');
            try {
              const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
              stopCamera();
            } catch (err) {
              console.error(err);
            }
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', quantity: 0, criticalThreshold: 1, description: '', imageUrl: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      quantity: product.quantity,
      criticalThreshold: product.criticalThreshold,
      description: product.description || '',
      imageUrl: product.imageUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('متأكد عاوز تحذف هذا المنتج؟')) {
      try {
        await api.delete(`/products/${productId}`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading || !user || user.role !== 'owner') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl px-4 py-3 sm:px-8 sm:py-5 flex justify-between items-center relative">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white drop-shadow-lg">🛠️ إدارة المنتجات</h1>
        <div className="hidden sm:flex items-center gap-3 sm:gap-6">
          <button onClick={() => router.push('/dashboard')} className="bg-white text-blue-600 px-4 py-2 rounded-2xl font-bold text-base sm:px-6 sm:py-3 sm:text-xl hover:bg-gray-100 transition-all">
            رجوع للوحة التحكم
          </button>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-2xl font-bold text-base sm:px-6 sm:py-3 sm:text-xl hover:bg-red-600 transform hover:scale-105 transition-all shadow-lg">
            تسجيل الخروج
          </button>
        </div>
        <button className="sm:hidden text-white text-3xl focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          ☰
        </button>
        {isMobileMenuOpen && (
          <div className="sm:hidden absolute top-full left-0 w-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg py-2 z-10">
            <button onClick={() => { router.push('/dashboard'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white px-4 py-2 text-lg hover:bg-blue-700">
              رجوع للوحة التحكم
            </button>
            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="block w-full text-left text-white px-4 py-2 text-lg hover:bg-red-700">
              تسجيل الخروج
            </button>
          </div>
        )}
      </nav>
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
              setFormData({ name: '', quantity: 0, criticalThreshold: 1, description: '', imageUrl: '' });
            }
          }} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-xl">
            {showForm ? 'إلغاء' : '+ إضافة منتج جديد'}
          </button>
        </div>

        {showForm && (
          <div className="sm:bg-white bg-white sm:p-4 p-2 rounded-3xl shadow-2xl mb-8 max-w-3xl border-t-8 border-green-500">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xl font-extrabold text-gray-800 mb-3">📦 اسم المنتج</label>
                <input
                  type="text"
                  placeholder="مثال: زرار ميتال"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-7 py-3 text-2xl text-gray-900 font-bold border-4 border-gray-300 rounded-3xl focus:outline-none focus:ring-6 focus:ring-green-300 focus:border-green-700 transition-all bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xl font-extrabold text-gray-800 mb-3">📊 الكمية المتوفرة</label>
                <p className="text-lg text-gray-600 mb-3">ده هو عدد القطع اللي عندك في المخزن الحين</p>
                <input
                  type="number"
                  placeholder="مثال: 50"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  className="w-full px-7 py-3 text-2xl text-gray-900 font-bold border-4 border-gray-300 rounded-3xl focus:outline-none focus:ring-6 focus:ring-green-300 focus:border-green-700 transition-all bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xl font-extrabold text-red-700 mb-3">⚠️ الحد الحرج</label>
                <p className="text-lg text-gray-600 mb-3">لو الكمية وصلت لرقم ده يبان بسرعة أن المنتج خلاص ويلزمك تردده</p>
                <input
                  type="number"
                  placeholder="مثال: 10"
                  required
                  min="1"
                  value={formData.criticalThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, criticalThreshold: Number(e.target.value) }))}
                  className="w-full px-7 py-3 text-2xl text-gray-900 font-bold border-4 border-red-300 rounded-3xl focus:outline-none focus:ring-6 focus:ring-red-300 focus:border-red-700 transition-all bg-red-50"
                />
              </div>
              <div>
                <label className="block text-xl font-extrabold text-gray-800 mb-3">📝 وصف المنتج</label>
                <textarea
                  placeholder="مثال: زرار ميتال أبيض مقاس 1 سم"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-7 py-3 text-2xl text-gray-900 font-bold border-4 border-gray-300 rounded-3xl focus:outline-none focus:ring-6 focus:ring-green-300 focus:border-green-700 transition-all bg-gray-50"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-xl font-extrabold text-gray-800 mb-4">🖼️ صورة المنتج</label>
                <div className="flex gap-3 mb-4">
                  <label className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-bold text-xl text-center cursor-pointer hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-xl">
                    📁 رفع صورة من الجهاز
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button type="button" onClick={isCameraActive ? stopCamera : startCamera} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-2xl font-bold text-xl hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-xl">
                    {isCameraActive ? '🔴 إيقاف الكاميرا' : '📷 التصوير من الكاميرا'}
                  </button>
                </div>
                {isCameraActive && (
                  <div className="bg-gray-900 rounded-2xl p-4 mb-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl mb-3" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-3">
                      <button type="button" onClick={capturePhoto} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl font-bold text-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-xl">
                        📸 التقاط الصورة
                      </button>
                    </div>
                  </div>
                )}
                {formData.imageUrl && (
                  <div className="relative inline-block">
                    <img src={formData.imageUrl} alt="Preview" className="w-40 h-40 object-cover rounded-3xl border-6 border-gray-300 shadow-xl" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className="absolute -top-3 -right-3 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold hover:bg-red-600 shadow-lg"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-6 rounded-3xl font-bold text-2xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.03] transition-all shadow-2xl">
                  ✅ {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); }} className="px-10 py-6 bg-gray-500 text-white rounded-3xl font-bold text-2xl hover:bg-gray-600 transition-all shadow-2xl">
                  ❌ إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4 md:gap-8">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-blue-200">
              {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-2xl mb-4" />}
              <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-xl text-gray-600 mb-4">{product.description}</p>
              <p className="text-xl font-bold mb-4">
                الكمية: <span className={product.quantity <= product.criticalThreshold ? 'text-red-600 text-2xl' : 'text-green-600'}>{product.quantity}</span>
              </p>
              <p className="text-lg text-gray-500 mb-4">الحد الحرج: {product.criticalThreshold}</p>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(product)} className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all">
                  ✏️ تعديل
                </button>
                <button onClick={() => handleDelete(product._id)} className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-bold text-lg hover:bg-red-600 transition-all">
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProductsManagementPage;
