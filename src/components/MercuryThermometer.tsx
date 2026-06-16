'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MercuryThermometerProps {
  current: number;
  max: number;
  critical: number;
}

const MercuryThermometer: React.FC<MercuryThermometerProps> = ({ current, max, critical }) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isCritical = current <= critical;

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative w-6 h-16 bg-gradient-to-b from-gray-100 to-gray-200 rounded-full overflow-hidden border-2 border-gray-400 shadow-inner">
        <div className="absolute bottom-0 left-0 right-0 w-full rounded-b-full bg-gradient-to-t from-gray-600 to-gray-300" style={{ height: '10px' }} />
        <motion.div
          animate={{ height: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`absolute bottom-2 left-1 right-1 rounded-b-md ${isCritical ? 'bg-gradient-to-t from-red-700 to-red-500' : 'bg-gradient-to-t from-blue-700 to-blue-400'}`}
        />
        {isCritical && (
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="absolute inset-0 bg-red-400"
          />
        )}
      </div>
    </div>
  );
};

export default MercuryThermometer;
