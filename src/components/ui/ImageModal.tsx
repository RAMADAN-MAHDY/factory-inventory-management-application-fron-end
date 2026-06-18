'use client';

import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, imageUrl, alt }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-2 rounded-lg max-w-full max-h-full overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold"
          onClick={onClose}
        >
          ✕
        </button>
        <img src={imageUrl} alt={alt} className="max-w-full max-h-[80vh] object-contain" />
      </div>
    </div>
  );
};

export default ImageModal;
