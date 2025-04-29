'use client';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Схема для неавторизованного пользователя
const guestSchema = yup.object().shape({
  name: yup.string().required('Имя обязательно'),
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  subject: yup.string().required('Тема обязательна'),
  message: yup.string().required('Сообщение обязательно'),
});

// Схема для авторизованного пользователя (без поля email и имени)
const authSchema = yup.object().shape({
  subject: yup.string().required('Тема обязательна'),
  message: yup.string().required('Сообщение обязательно'),
});

type GuestFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type AuthFormData = {
  subject: string;
  message: string;
};

type FeedbackFormProps = {
  isAuthenticated?: boolean;
  username?: string;
  userEmail?: string;
  onSuccess?: () => void;
};

const FeedbackForm: React.FC<FeedbackFormProps> = ({ 
  isAuthenticated = false, 
  username = '', 
  userEmail = '',
  onSuccess
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Выбираем схему в зависимости от статуса авторизации
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(isAuthenticated ? authSchema : guestSchema),
    defaultValues: isAuthenticated ? {
      subject: '',
      message: ''
    } : {
      name: username,
      email: userEmail,
      subject: '',
      message: ''
    }
  });

  const onSubmit = async (data: GuestFormData | AuthFormData) => {
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      // Единый API эндпоинт для обоих типов обращений
      const requestData = isAuthenticated 
        ? { 
            subject: (data as AuthFormData).subject,
            message: (data as AuthFormData).message,
            isAnonymous: false
          }
        : {
            name: (data as GuestFormData).name,
            email: (data as GuestFormData).email,
            subject: (data as GuestFormData).subject,
            message: (data as GuestFormData).message,
            isAnonymous: true
          };
      
      const response = await fetch('/api/support/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при отправке обращения');
      }
      
      setSubmitStatus('success');
      reset();
      
      // Если задан обработчик успешной отправки
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error('Ошибка при отправке формы:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка при отправке');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {isAuthenticated ? 'Обращение в поддержку' : 'Обратная связь'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isAuthenticated && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя</label>
              <input
                {...register('name')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Тема</label>
          <input
            {...register('subject')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
          {errors.subject && <span className="text-red-500 text-sm">{errors.subject.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Сообщение</label>
          <textarea
            {...register('message')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            required
          />
          {errors.message && <span className="text-red-500 text-sm">{errors.message.message}</span>}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Отправка...' : 'Отправить'}
        </motion.button>
        {submitStatus === 'success' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-green-500 text-center">
            {isAuthenticated 
              ? 'Обращение успешно создано! Мы ответим вам в ближайшее время.'
              : 'Сообщение успешно отправлено! Мы ответим вам на указанный email.'}
          </motion.div>
        )}
        {submitStatus === 'error' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-center">
            {errorMessage || 'Произошла ошибка при отправке. Пожалуйста, попробуйте позже.'}
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default FeedbackForm;