'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Head from 'next/head';
import FeedbackForm from '@/components/FeedbackForm';

import NotificationSystem from '@/components/NotificationSystem';
import OptimizedImage from '@/components/OptimizedImage';
import { event } from '@/lib/gtag';
import { SERVERS } from '@/lib/config';

// Предварительно загруженные изображения
import heroBg from '@/public/hero-bg.jpg';
import shieldIcon from '@/public/icons/shield.svg';
import lightningIcon from '@/public/icons/lightning.svg';
import checkIcon from '@/public/icons/check.svg';
import worldMap from '@/public/maps/world.svg';

const servers = SERVERS;

const features = [
  {
    icon: shieldIcon,
    title: 'Безопасность',
    description: 'Надежное шифрование данных',
    color: '#4ADE80'
  },
  {
    icon: lightningIcon,
    title: 'Скорость',
    description: 'Высокая скорость соединения',
    color: '#60A5FA'
  },
  {
    icon: checkIcon,
    title: 'Устройства',
    description: 'До 5 устройств одновременно',
    color: '#F472B6'
  }
];

export default function Home() {
  const [userCount, setUserCount] = useState(1000);
  const [userCountRef, isUserCountVisible] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 100], [1, 0]);

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    if (scrollPosition > 100) {
      event({
        action: 'scroll_past_hero',
        category: 'engagement',
        label: 'user_scrolled'
      });
    }
  }, []);

  useEffect(() => {
    event({
      action: 'view_home',
      category: 'engagement',
      label: 'home_page_view'
    });

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isUserCountVisible) {
      const timer = setInterval(() => {
        setUserCount(prev => Math.min(prev + 1, 49));
      }, 100);
      return () => clearInterval(timer);
    }
  }, [isUserCountVisible]);

  return (
    <>
      <Head>
        <title>Epsiquad VPN - Безопасный и быстрый VPN сервис</title>
        <meta name="description" content="Защитите свою конфиденциальность с Epsiquad VPN. Высокоскоростные серверы в Германии и России. Неограниченный трафик и до 5 устройств." />
        <meta name="keywords" content="VPN, безопасность, конфиденциальность, Германия, Россия, серверы" />
        <meta property="og:title" content="Epsiquad VPN - Безопасный и быстрый VPN сервис" />
        <meta property="og:description" content="Защитите свою конфиденциальность с Epsiquad VPN. Высокоскоростные серверы в Германии и России." />
        <meta property="og:image" content="/og-image.jpg" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <NotificationSystem />

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden" aria-label="Главный баннер">
          <div className="absolute inset-0 z-0">
            <OptimizedImage
              src={heroBg}
              alt="Фоновое изображение"
              width={1920}
              height={1080}
              className="object-cover w-full h-full"
              priority={true}
              quality={90}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
          </div>
          
          <motion.div 
            className="relative z-10 text-center px-4 sm:px-6 lg:px-8"
            style={{ opacity }}
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
            >
              Безопасный и быстрый VPN
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
            >
              Защитите свою конфиденциальность и получите доступ к контенту без ограничений
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link 
                href="/pricing" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 transform hover:scale-105"
                onClick={() => {
                  event({
                    action: 'click_cta',
                    category: 'engagement',
                    label: 'hero_cta'
                  });
                }}
                aria-label="Перейти к тарифам"
              >
                Начать бесплатно
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              id="features-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"
            >
              Почему выбирают нас
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="relative overflow-hidden rounded-2xl bg-gray-900/50 backdrop-blur-sm p-8 border border-gray-800 transition-all duration-300 hover:border-gray-700 hover:transform hover:scale-105"
                  style={{
                    boxShadow: `0 8px 32px ${feature.color}20`
                  }}
                >
                  <OptimizedImage
                    src={feature.icon}
                    alt={feature.title}
                    width={48}
                    height={48}
                    className="w-12 h-12 mb-6"
                    style={{
                      filter: `drop-shadow(0 4px 12px ${feature.color}40)`,
                      fill: feature.color
                    }}
                  />
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-2 text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Server Map Section */}
        <section className="py-20 bg-gray-100 dark:bg-gray-900" aria-labelledby="servers-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              id="servers-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"
            >
              Наши серверы
            </motion.h2>
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl bg-gray-900/50 backdrop-blur-sm p-8 border border-gray-800">
                <OptimizedImage
                  src={worldMap}
                  alt="Карта мира"
                  width={1200}
                  height={600}
                  className="w-full h-auto"
                  style={{
                    filter: 'drop-shadow(0 4px 12px rgba(148, 163, 184, 0.2))',
                    fill: '#475569'
                  }}
                />
                {servers.map((server) => (
                  <div
                    key={server.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{
                      left: `${server.coordinates.x}%`,
                      top: `${server.coordinates.y}%`
                    }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full animate-pulse"
                      style={{ backgroundColor: server.color }}
                    />
                    <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-48 bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg border border-gray-700 pointer-events-none">
                      <h3 className="text-lg font-bold text-white">{server.name}</h3>
                      <p className="text-sm text-gray-400">{server.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-400 text-sm">{server.status}</span>
                      </div>
                    </div>
                    <div 
                      className="absolute w-12 h-12 rounded-full -inset-4 animate-ping opacity-20"
                      style={{ backgroundColor: server.color }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {servers.map((server) => (
                  <div
                    key={server.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800"
                  >
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: server.color }}
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white">{server.name}</h3>
                      <p className="text-sm text-gray-400">{server.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div ref={userCountRef} className="text-center text-gray-600 dark:text-gray-300 mt-12">
              <p className="text-2xl font-bold mb-2">{userCount.toLocaleString()}</p>
              <p>пользователей уже с нами</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600" aria-labelledby="cta-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              id="cta-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-6 text-white"
            >
              Готовы начать?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl mb-8 text-white max-w-2xl mx-auto"
            >
              Присоединяйтесь к миллионам пользователей, которые уже защищают свою конфиденциальность
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <Link 
                href="/pricing" 
                className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105"
                onClick={() => {
                  event({
                    action: 'click_cta',
                    category: 'engagement',
                    label: 'bottom_cta'
                  });
                }}
                aria-label="Перейти к тарифам"
              >
                Выбрать тариф
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="feedback-heading">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              id="feedback-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white"
            >
              Обратная связь
            </motion.h2>
            <FeedbackForm />
          </div>
        </section>
      </main>
    </>
  );
}
