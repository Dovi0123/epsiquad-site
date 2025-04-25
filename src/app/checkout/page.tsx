'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

// Определяем тип FormData - все поля опциональные, кроме email
type FormData = {
  email: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  name?: string;
};

// Создаем схему валидации для типа FormData
const schema = yup.object().shape({
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  cardNumber: yup.string().optional(),
  expiryDate: yup.string().optional(),
  cvv: yup.string().optional(),
  name: yup.string().optional(),
});

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  link: string;
  location: string;
  duration: number;
};

export default function Checkout() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Инициализируем форму с правильными типами
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    // @ts-expect-error - игнорируем ошибку типизации для yupResolver, поскольку версии типов могут не совпадать
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  // Получение товаров из корзины при загрузке страницы
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.items || []);
        } else {
          // Если пользователь не авторизован - редирект на страницу входа
          router.push('/account?returnTo=checkout');
        }
      } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
      }
    };

    fetchCart();
    fetchProducts();
  }, [router]);

  // Находим информацию о товаре по ID
  const getProductInfo = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  // Подсчет общей суммы заказа
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

  // Обработка оформления заказа
  const onSubmit = async (data: FormData) => {
    setIsProcessing(true);

    try {
      // Подготавливаем данные для платежа через Lava
      const paymentData = {
        items: cartItems,
        amount: totalPrice,
        email: data.email,
        description: `Оплата VPN подписки (${cartItems.length} товаров)`
      };

      // Отправляем запрос на создание платежа
      const response = await fetch('/api/payments/lava', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.redirectUrl) {
          // Перенаправляем пользователя на страницу оплаты Lava
          window.location.href = data.redirectUrl;
        } else {
          setNotification({
            type: 'error',
            message: 'Не удалось создать платёж. Пожалуйста, попробуйте позже.'
          });
        }
      } else {
        const errorData = await response.json();
        setNotification({
          type: 'error',
          message: errorData.error || 'Ошибка при оформлении заказа'
        });
      }
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      setNotification({
        type: 'error',
        message: 'Произошла ошибка при обработке заказа'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
      {notification && (
        <div 
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg max-w-md w-full 
            ${notification.type === 'success' ? 'bg-green-100 text-green-800 border-green-500' : 'bg-red-100 text-red-800 border-red-500'} 
            border-l-4`}
        >
          {notification.message}
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Оформление заказа
          </h1>
          
          {/* Информация о корзине */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Содержимое вашей корзины
            </h2>
            
            {cartItems.length === 0 ? (
              <div className="text-gray-600 dark:text-gray-300 mb-4">
                Ваша корзина пуста. <a href="/pricing" className="text-blue-600 hover:underline">Выберите тарифный план</a>.
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((itemId) => {
                  const product = getProductInfo(itemId);
                  return product && (
                    <div key={itemId} className="flex justify-between items-start border-b pb-4">
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">{product.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                        {product.location && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Локация: {getLocationName(product.location)}<br />
                            Период: {formatDuration(product.duration)}
                          </p>
                        )}
                      </div>
                      <div className="text-lg font-semibold">{product.price} ₽</div>
                    </div>
                  );
                })}
                <div className="pt-2 flex justify-between font-bold text-lg">
                  <span>Итого:</span>
                  <span>{totalPrice} ₽</span>
                </div>
              </div>
            )}
          </div>

          {/* Форма оплаты - показываем, только если корзина не пуста */}
          {cartItems.length > 0 && (
            <>
              {/* @ts-expect-error - Несоответствие типов между FormData из useForm и handleSubmit */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="example@mail.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Обработка...' : 'Оплатить через Lava'}
                  </button>
                </div>
              </form>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Оплата через сервис Lava</p>
                <p>После нажатия кнопки вы будете перенаправлены на страницу оплаты Lava, где можно выбрать удобный способ оплаты: банковские карты, СБП, электронные кошельки и другие.</p>
              </div>
            </>
          )}

          <div className="mt-8 text-sm text-gray-600 dark:text-gray-300">
            <p>
              Нажимая кнопку выше, вы соглашаетесь с нашими{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                Условиями использования
              </a>{' '}
              и{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Политикой конфиденциальности
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}