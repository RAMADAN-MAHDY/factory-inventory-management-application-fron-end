'use client';

import React from 'react';
import { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4 md:gap-8">
      {products.map(product => (
        <div key={product._id} className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-blue-200">
          {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-2xl mb-4" />}
          <h3 className="text-2xl font-extrabold text-gray-800 mb-2">{product.name}</h3>
          <p className="text-xl text-gray-600 mb-4">{product.description}</p>
          <p className="text-xl font-bold mb-4">
            الكمية: <span className={product.quantity <= product.criticalThreshold ? 'text-red-600 text-2xl' : 'text-green-600'}>{product.quantity}</span>
          </p>
          <p className="text-lg text-gray-500 mb-4">الحد الحرج: {product.criticalThreshold}</p>
          <div className="flex gap-3">
            <button onClick={() => onEdit(product)} className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all">
              ✏️ تعديل
            </button>
            <button onClick={() => onDelete(product._id)} className="flex-1 bg-red-500 text-white px-4 py-3 rounded-xl font-bold text-lg hover:bg-red-600 transition-all">
              🗑️ حذف
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
