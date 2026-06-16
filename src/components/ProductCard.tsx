'use client';

import React, { useState } from 'react';
import MercuryThermometer from './MercuryThermometer';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Product {
  _id: string;
  name: string;
  quantity: number;
  criticalThreshold: number;
  imageUrl?: string;
  description?: string;
  logs: any[];
}

interface ProductCardProps {
  product: Product;
  onUpdate: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onUpdate }) => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<'in' | 'out'>('in');
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  const handleAddLog = async () => {
    try {
      await api.post(`/products/${product._id}/log`, { type, quantity: qty, notes });
      setIsAdding(false);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const isCritical = product.quantity <= product.criticalThreshold;
  const maxQty = Math.max(product.quantity, product.criticalThreshold * 3, 10); // Keep maxQty for thermometer scaling

  return (
    <>
      <tr className={`border-b-2 border-gray-300 transition-all duration-200 transform hover:scale-[1.01] hover:shadow-lg ${isCritical ? 'bg-red-50 hover:bg-red-100' : 'bg-white hover:bg-gray-50'}`}>
        <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap border-r border-gray-200">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-12 object-cover rounded-md shadow-md cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowImageModal(true)}
            />
          )}
        </td>
        <td className="py-3 px-4 text-sm font-medium text-gray-900 whitespace-nowrap border-r border-gray-200">{product.name}</td>
        <td className={`py-3 px-4 text-sm whitespace-nowrap border-r border-gray-200 ${isCritical ? 'text-red-600 font-bold' : 'text-green-600'}`}>
          {product.quantity}
        </td>
        <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap border-r border-gray-200">{product.criticalThreshold}</td>
        <td className="py-3 px-4 text-sm text-gray-500 border-r border-gray-200">
          <MercuryThermometer current={product.quantity} max={maxQty} critical={product.criticalThreshold} />
        </td>
        <td className="py-3 px-4 text-sm text-gray-500">
          {(user?.role === 'manager' || user?.role === 'owner') && (
            <div className="flex items-center gap-2">
              {!isAdding ? (
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-600 transition-all shadow-sm"
                >
                  تعديل
                </button>
              ) : (
                <div className="flex flex-col gap-1 p-1 bg-gray-100 rounded-md shadow-inner">
                  <div className="flex gap-1">
                    <select value={type} onChange={(e) => setType(e.target.value as 'in' | 'out')} className="border border-gray-300 rounded-md px-1 py-0.5 text-xs bg-white focus:ring-blue-500 focus:border-blue-500">
                      <option value="in">➕</option>
                      <option value="out">➖</option>
                    </select>
                    <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="border border-gray-300 rounded-md px-1 py-0.5 text-xs w-16 bg-white focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <input type="text" placeholder="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} className="border border-gray-300 rounded-md px-1 py-0.5 text-xs bg-white focus:ring-blue-500 focus:border-blue-500" />
                  <div className="flex gap-1">
                    <button onClick={handleAddLog} className="bg-green-500 text-white px-2 py-1 rounded-md text-xs hover:bg-green-600 shadow-sm">
                      ✅
                    </button>
                    <button onClick={() => setIsAdding(false)} className="bg-gray-500 text-white px-2 py-1 rounded-md text-xs hover:bg-gray-600 shadow-sm">
                      ❌
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </td>
      </tr>

      {showImageModal && product.imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative bg-white p-2 rounded-lg max-w-full max-h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold"
              onClick={() => setShowImageModal(false)}
            >
              ✕
            </button>
            <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
