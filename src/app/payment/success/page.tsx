'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  // Получаем orderId из параметров URL (если есть)
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Запускаем обратный отсчет для автоматического перенаправления
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Перенаправляем на страницу настройки, если есть orderId
          if (orderId) {
            router.push(`/setup?orderId=${orderId}`);
          } else {
            router.push('/account');
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, orderId]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mx-4"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Оплата успешно выполнена!
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Спасибо за ваш платёж. Ваш заказ успешно оформлен и находится в обработке.
          </p>
          
          {orderId && (
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Номер заказа: <span className="font-semibold">{orderId}</span>
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push(orderId ? `/setup?orderId=${orderId}` : '/account')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {orderId ? 'Настроить VPN' : 'Личный кабинет'}
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              На главную
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            Автоматический переход через {countdown} {countdown === 1 ? 'секунду' : countdown < 5 ? 'секунды' : 'секунд'}...
          </p>
        </div>
      </motion.div>
    </main>
  );
}