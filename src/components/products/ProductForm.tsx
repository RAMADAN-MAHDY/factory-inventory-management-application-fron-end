'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductFormData } from '@/types';
import { useCamera } from '@/hooks/useCamera';
import api from '@/lib/api';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const { isCameraActive, videoRef, canvasRef, startCamera, stopCamera, capturePhoto, handleImageUpload } = useCamera();
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    quantity: 0,
    criticalThreshold: 1,
    description: '',
    imageUrl: '',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        quantity: product.quantity,
        criticalThreshold: product.criticalThreshold,
        description: product.description || '',
        imageUrl: product.imageUrl || '',
      });
    } else {
      setFormData({
        name: '',
        quantity: 0,
        criticalThreshold: 1,
        description: '',
        imageUrl: '',
      });
    }
  }, [product]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubmitError(null);
    setIsImageLoading(true);
    try {
      const url = await handleImageUpload(e);
      if (url) {
        setFormData(prev => ({ ...prev, imageUrl: url }));
      }
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleCapture = async () => {
    setSubmitError(null);
    setIsImageLoading(true);
    try {
      const url = await capturePhoto();
      if (url) {
        setFormData(prev => ({ ...prev, imageUrl: url }));
        stopCamera();
      }
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      if (product) {
        await api.put(`/products/${product._id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      onClose();
    } catch (err) {
      const status = (err as any)?.response?.status;
      if (status === 403) {
        setSubmitError('غير مصرح لك بتنفيذ هذا الإجراء. يلزم تسجيل الدخول كمالك.');
        return;
      }
      if (status === 401) {
        setSubmitError('انتهت صلاحية الجلسة. أعد تسجيل الدخول.');
        return;
      }
      console.error(err);
      setSubmitError('حدث خطأ أثناء حفظ المنتج.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sm:bg-white bg-white sm:p-4 p-2 rounded-3xl shadow-2xl mb-8 max-w-3xl border-t-8 border-green-500">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        {product ? 'تعديل منتج' : 'إضافة منتج جديد'}
      </h3>
      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 font-semibold">
          {submitError}
        </div>
      )}
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
            <label className={`flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 rounded-2xl font-bold text-xl text-center cursor-pointer hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all shadow-xl ${isImageLoading ? 'opacity-80 pointer-events-none' : ''}`}>
              <span className="inline-flex items-center justify-center gap-2">
                {isImageLoading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                    </svg>
                    جاري رفع الصورة...
                  </>
                ) : (
                  <>📁 رفع صورة من الجهاز</>
                )}
              </span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isImageLoading} />
            </label>
            <button type="button" disabled={isImageLoading} onClick={isCameraActive ? stopCamera : startCamera} className={`flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-2xl font-bold text-xl hover:from-blue-600 hover:to-cyan-600 transform hover:scale-105 transition-all shadow-xl ${isImageLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isCameraActive ? '🔴 إيقاف الكاميرا' : '📷 التصوير من الكاميرا'}
            </button>
          </div>

          {isCameraActive && (
            <div className="bg-gray-900 rounded-2xl p-4 mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-80 object-cover rounded-xl mb-3"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-3">
                <button type="button" disabled={isImageLoading} onClick={handleCapture} className={`flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl font-bold text-xl hover:from-green-600 hover:to-emerald-600 transform hover:scale-105 transition-all shadow-xl ${isImageLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <span className="inline-flex items-center justify-center gap-2">
                    {isImageLoading ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                        </svg>
                        جاري الرفع...
                      </>
                    ) : (
                      <>📸 التقاط الصورة</>
                    )}
                  </span>
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
          <button type="submit" disabled={isSubmitting || isImageLoading} className={`flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-6 rounded-3xl font-bold text-2xl hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.03] transition-all shadow-2xl ${isSubmitting || isImageLoading ? 'opacity-80 cursor-not-allowed' : ''}`}>
            <span className="inline-flex items-center justify-center gap-3">
              {(isSubmitting || isImageLoading) && (
                <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                </svg>
              )}
              {isSubmitting ? 'جاري الحفظ...' : `✅ ${product ? 'تحديث المنتج' : 'إضافة المنتج'}`}
            </span>
          </button>
          <button type="button" disabled={isSubmitting || isImageLoading} onClick={onClose} className={`px-10 py-6 bg-gray-500 text-white rounded-3xl font-bold text-2xl hover:bg-gray-600 transition-all shadow-2xl ${isSubmitting || isImageLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            ❌ إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
