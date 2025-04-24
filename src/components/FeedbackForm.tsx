'use client';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { motion } from 'framer-motion';
import { useState } from 'react';

const schema = yup.object().shape({
  name: yup.string().required('Имя обязательно'),
  email: yup.string().email('Некорректный email').required('Email обязателен'),
  subject: yup.string().required('Тема обязательна'),
  message: yup.string().required('Сообщение обязательно'),
});

type FeedbackFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const FeedbackForm: React.FC = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FeedbackFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async () => {
    setSubmitStatus('idle');
    try {
      // ...отправка данных...
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      reset();
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Обратная связь</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            Сообщение успешно отправлено!
          </motion.div>
        )}
        {submitStatus === 'error' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-center">
            Произошла ошибка при отправке. Пожалуйста, попробуйте позже.
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default FeedbackForm;