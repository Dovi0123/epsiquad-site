'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type AddToCartButtonProps = {
  productId: string;
  className?: string;
}

export default function AddToCartButton({ productId, className = '' }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        console.error('Ошибка при добавлении в корзину');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || success}
      className={`${className} bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all ${
        loading ? 'opacity-70 cursor-wait' : ''
      } ${success ? 'bg-green-600 hover:bg-green-600' : ''}`}
    >
      {loading ? (
        'Добавление...'
      ) : success ? (
        <span className="flex items-center justify-center">
          <motion.svg 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="w-5 h-5 mr-1" 
            viewBox="0 0 24 24"
          >
            <motion.path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            />
          </motion.svg>
          Добавлено
        </span>
      ) : (
        'В корзину'
      )}
    </button>
  );
}