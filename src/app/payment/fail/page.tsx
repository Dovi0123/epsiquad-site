'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

function PaymentFail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  
  // Получаем параметры из URL
  const errorReason = searchParams.get('reason');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Запускаем обратный отсчет для автоматического перенаправления
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/checkout');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

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
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Платёж не выполнен
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            К сожалению, при обработке платежа возникла проблема.
          </p>
          
          {errorReason && (
            <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 mb-6 text-left">
              <p className="text-red-800 dark:text-red-200">
                Причина: {decodeURIComponent(errorReason)}
              </p>
            </div>
          )}
          
          {orderId && (
            <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 p-4 mb-6 text-left">
              <p className="text-blue-800 dark:text-blue-200">
                Номер заказа: {orderId}
              </p>
            </div>
          )}
          
          <div className="text-gray-600 dark:text-gray-300 mb-8">
            <p>Вы можете:</p>
            <ul className="list-disc list-inside text-left mt-2 space-y-1">
              <li>Проверить правильность введённых данных карты</li>
              <li>Убедиться в достаточности средств на счёте</li>
              <li>Попробовать другой способ оплаты</li>
              <li>Связаться с поддержкой, если проблема повторяется</li>
            </ul>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push('/checkout')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Повторить оплату
            </button>
            
            <button
              onClick={() => router.push('/contact')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            >
              Связаться с поддержкой
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            Возврат к оформлению заказа через {countdown} {countdown === 1 ? 'секунду' : countdown < 5 ? 'секунды' : 'секунд'}...
          </p>
        </div>
      </motion.div>
    </main>
  );
}

export default function PaymentFailWrapper() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <PaymentFail />
    </Suspense>
  );
}