'use client';

import { motion } from 'framer-motion';
import FeedbackForm from '@/components/FeedbackForm';
import { CONTACTS } from '@/lib/config';

export default function Contact() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Свяжитесь с нами
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Мы всегда рады помочь вам с любыми вопросами
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Контактная информация
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-500 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-gray-600 dark:text-gray-300">Email</p>
                    <a href="mailto:support@epsiquad.com" className="text-blue-600 hover:text-blue-700">
                      support@epsiquad.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Мы на других площадках
              </h2>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-6">
                  <a 
                    href={CONTACTS.telegram} 
                    className="group flex flex-col items-center"
                    title="Наш Telegram канал"
                  >
                    <div className="p-3 rounded-full transition-all duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-500 dark:text-gray-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.293c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.566-4.458c.534-.196 1.001.128.832.941z"/>
                      </svg>
                    </div>
                    <span className="mt-1 text-sm text-gray-600 dark:text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                      Telegram
                    </span>
                  </a>

                  <a 
                    href={CONTACTS.platiMarket} 
                    className="group flex flex-col items-center"
                    title="Наш магазин на Plati.market"
                  >
                    <div className="p-3 rounded-full transition-all duration-300 group-hover:bg-green-100 dark:group-hover:bg-green-900">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-green-500 dark:text-gray-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21.822 7.431A1 1 0 0 0 21 7H7.333L6.179 4.23A1.994 1.994 0 0 0 4.333 3H2v2h2.333l4.744 11.385A1 1 0 0 0 10 17h8c.417 0 .79-.259.937-.648l3-8a1 1 0 0 0-.115-.921zM17.307 15h-6.64l-2.5-6h11.39l-2.25 6z"/>
                        <path d="M10.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm6 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                      </svg>
                    </div>
                    <span className="mt-1 text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-500 transition-colors duration-300">
                      Plati.market
                    </span>
                  </a>

                  <a 
                    href="https://ggsel.net/sellers/1334141" 
                    className="group flex flex-col items-center"
                    title="Наш магазин на GGSeller"
                  >
                    <div className="p-3 rounded-full transition-all duration-300 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900">
                      <svg className="w-6 h-6 text-gray-600 group-hover:text-yellow-500 dark:text-gray-300 transition-colors duration-300" fill="currentColor" viewBox="0 0 30 30">
                        <path fill="currentColor" d="M 24.710938 13.507812 L 16.582031 13.507812 C 16.300781 13.507812 16.074219 13.734375 16.074219 14.011719 L 16.074219 16.535156 C 16.074219 16.816406 16.300781 17.039062 16.582031 17.039062 L 20.644531 17.039062 L 20.644531 17.417969 C 20.644531 20.195312 18.8125 22.089844 15.566406 22.089844 C 11.777344 22.089844 9.46875 19.289062 9.46875 14.480469 C 9.46875 9.726562 11.722656 6.941406 15.4375 6.941406 C 18.027344 6.941406 19.320312 8.09375 20.257812 10.171875 C 20.34375 10.355469 20.523438 10.476562 20.722656 10.476562 L 24.453125 10.476562 C 24.597656 10.476562 24.710938 10.359375 24.710938 10.222656 C 24.710938 10.203125 24.707031 10.183594 24.703125 10.164062 C 23.640625 5.625 20.125 2.902344 15.34375 2.902344 C 9 2.902344 4.898438 7.457031 4.898438 14.507812 C 4.898438 21.675781 8.921875 26.128906 15.40625 26.128906 C 21.367188 26.128906 25.21875 22.398438 25.21875 16.621094 L 25.21875 14.011719 C 25.21875 13.734375 24.992188 13.507812 24.710938 13.507812 Z M 24.710938 13.507812"/>
                      </svg>
                    </div>
                    <span className="mt-1 text-sm text-gray-600 dark:text-gray-400 group-hover:text-yellow-500 transition-colors duration-300">
                      GGSeller
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FeedbackForm />
          </motion.div>
        </div>
      </div>
    </main>
  );
}