'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import ShoppingCart from '@/components/ShoppingCart';

// Определение типов для продуктов
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  link: string;
  location: string;
  duration: number;
  features?: string[];
  popular?: boolean;
}

export default function Pricing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('germany');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  
  // Получение данных о продуктах при монтировании
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          // Добавляем дополнительные данные к продуктам для отображения
          const enhancedProducts = data.map((product: Product) => ({
            ...product,
            features: [
              'До 5 устройств',
              'Неограниченный трафик',
              'Базовая поддержка',
              `Сервер в ${product.location === 'germany' ? 'Германии' : 'России'}`,
              'Продвинутое шифрование'
            ],
            popular: product.duration === 6 // Делаем популярным тариф на 6 месяцев
          }));
          setProducts(enhancedProducts);
        }
      } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
      } finally {
        setLoading(false);
      }
    };

    // Проверяем авторизацию
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/me');
        setIsAuth(response.ok);
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      }
    };

    fetchProducts();
    checkAuth();
  }, []);

  // Получение тарифа для выбранных параметров
  const getSelectedProduct = () => {
    return products.find(
      (product) => 
        product.location === selectedLocation && 
        product.duration === selectedDuration
    );
  };

  const selectedProduct = getSelectedProduct();

  // Форматирование цены по месяцам
  const formatPricePerMonth = (price: number, duration: number) => {
    return (price / duration).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Корзина в верхнем правом углу */}
        {isAuth && (
          <div className="absolute top-4 right-4">
            <ShoppingCart />
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Выбор тарифного плана
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Выберите локацию сервера и длительность подписки
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="mb-12">
            {/* Выбор локации */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Выберите локацию сервера:</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  className={`px-6 py-3 rounded-lg ${
                    selectedLocation === 'germany' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  } transition-colors`}
                  onClick={() => setSelectedLocation('germany')}
                >
                  Германия
                </button>
                <button
                  className={`px-6 py-3 rounded-lg ${
                    selectedLocation === 'russia' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  } transition-colors`}
                  onClick={() => setSelectedLocation('russia')}
                >
                  Россия
                </button>
              </div>
            </div>

            {/* Выбор длительности */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Выберите длительность подписки:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  className={`px-6 py-3 rounded-lg ${
                    selectedDuration === 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  } transition-colors`}
                  onClick={() => setSelectedDuration(1)}
                >
                  1 месяц
                </button>
                <button
                  className={`px-6 py-3 rounded-lg ${
                    selectedDuration === 3 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  } transition-colors`}
                  onClick={() => setSelectedDuration(3)}
                >
                  3 месяца
                </button>
                <button
                  className={`px-6 py-3 rounded-lg ${
                    selectedDuration === 6 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  } transition-colors`}
                  onClick={() => setSelectedDuration(6)}
                >
                  6 месяцев
                </button>
                <button
                  className={`px-6 py-3 rounded-lg ${
                    selectedDuration === 12 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  } transition-colors`}
                  onClick={() => setSelectedDuration(12)}
                >
                  12 месяцев
                </button>
              </div>
            </div>

            {/* Детали выбранного тарифа */}
            {selectedProduct && (
              <motion.div
                key={`${selectedProduct.id}-${selectedLocation}-${selectedDuration}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedProduct.name}
                </h2>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                      {selectedProduct.price} ₽
                      <span className="text-lg text-gray-500">
                        {selectedProduct.duration > 1 ? ' за весь период' : '/мес'}
                      </span>
                    </div>
                    {selectedProduct.duration > 1 && (
                      <div className="text-gray-600 dark:text-gray-300">
                        {formatPricePerMonth(selectedProduct.price, selectedProduct.duration)} ₽ в месяц
                      </div>
                    )}
                  </div>
                  {selectedProduct.popular && (
                    <div className="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                      Выгодное предложение
                    </div>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {selectedProduct.description}
                </p>
                <ul className="space-y-3 mb-6">
                  {selectedProduct.features?.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg
                        className="h-5 w-5 text-green-500 mr-2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* Если пользователь авторизован - показываем кнопку добавления в корзину */}
                {isAuth ? (
                  <AddToCartButton productId={selectedProduct.id} className="w-full" />
                ) : (
                  <Link href="/account?returnTo=pricing"
                    className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition-colors"
                  >
                    Войти для покупки
                  </Link>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}