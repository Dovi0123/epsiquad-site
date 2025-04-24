'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type CartItem = string;
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  link: string;
  location: string;
  duration: number;
};

export default function ShoppingCart() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Получение товаров из корзины
  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Ошибка при получении корзины:', error);
    }
  };

  // Получение информации о продуктах
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Ошибка при получении продуктов:', error);
    }
  };

  // Загрузка данных при первом рендере
  useEffect(() => {
    fetchProducts();
  }, []);

  // Обновление корзины при открытии
  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  // Удаление товара из корзины
  const removeFromCart = async (productId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/cart/remove?productId=${productId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Ошибка при удалении из корзины:', error);
    } finally {
      setLoading(false);
    }
  };

  // Находим информацию о товаре по ID
  const getProductInfo = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  // Подсчет общей суммы
  const totalPrice = cartItems.reduce((sum, itemId) => {
    const product = getProductInfo(itemId);
    return sum + (product?.price || 0);
  }, 0);

  // Получить локализованное название локации
  const getLocationName = (location: string) => {
    return location === 'germany' ? 'Германия' : 'Россия';
  };

  // Форматирование длительности
  const formatDuration = (duration: number) => {
    if (duration === 1) return '1 месяц';
    if (duration < 5) return `${duration} месяца`;
    return `${duration} месяцев`;
  };

  return (
    <div className="relative">
      {/* Кнопка корзины */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-black hover:text-blue-600 transition-colors"
        aria-label="Корзина"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          className="w-6 h-6"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        
        {/* Индикатор количества товаров */}
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Выпадающая панель корзины */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200"
        >
          <div className="p-4">
            <h3 className="text-black font-semibold mb-2 flex justify-between">
              Корзина
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </h3>
            
            {cartItems.length === 0 ? (
              <p className="text-black">Ваша корзина пуста</p>
            ) : (
              <div>
                <ul className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((itemId) => {
                    const product = getProductInfo(itemId);
                    return product ? (
                      <li 
                        key={itemId}
                        className="flex text-black justify-between items-start border-b pb-2"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-gray-500">
                            Локация: {getLocationName(product.location)}<br />
                            Период: {formatDuration(product.duration)}
                          </p>
                          <p className="text-sm font-semibold text-gray-700 mt-1">{product.price} ₽</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(itemId)}
                          className="text-red-500 hover:text-red-700 text-sm ml-2" 
                          disabled={loading}
                        >
                          Удалить
                        </button>
                      </li>
                    ) : null;
                  })}
                </ul>
                
                <div className="pt-2">
                  <div className="flex text-black justify-between font-semibold">
                    <span>Итого:</span>
                    <span>{totalPrice} ₽</span>
                  </div>
                  
                  <Link href="/checkout"
                    className="mt-3 block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Оформить заказ
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}