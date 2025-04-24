'use client';

import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import "./globals.css";
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Script from 'next/script';
import * as gtag from '@/lib/gtag';
import Breadcrumbs from '@/components/Breadcrumbs';
import ScrollToTop from '@/components/ScrollToTop';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  useEffect(() => {
    const handleStart = () => {
      NProgress.start();
    };
    const handleStop = () => {
      NProgress.done();
    };

    window.addEventListener('routeChangeStart', handleStart);
    window.addEventListener('routeChangeComplete', handleStop);
    window.addEventListener('routeChangeError', handleStop);

    return () => {
      window.removeEventListener('routeChangeStart', handleStart);
      window.removeEventListener('routeChangeComplete', handleStop);
      window.removeEventListener('routeChangeError', handleStop);
    };
  }, []);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url);
    };

    handleRouteChange(pathname);
  }, [pathname]);

  return (
    <html lang="ru">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gtag.GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <style>{`
          #nprogress .bar {
            background: #2563eb !important;
            height: 3px !important;
          }
          #nprogress .peg {
            box-shadow: 0 0 10px #2563eb, 0 0 5px #2563eb !important;
          }
          #nprogress .spinner-icon {
            border-top-color: #2563eb !important;
            border-left-color: #2563eb !important;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold text-blue-600">Epsiquad VPN</Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-center space-x-4">
                  <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Главная</Link>
                  <Link href="/pricing" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Тарифы</Link>
                  <Link href="/setup" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Установка</Link>
                  <Link href="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Контакты</Link>
                  <Link href="/account" className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">Аккаунт</Link>
                </div>
              </div>
              <div className="md:hidden">
                <button className="text-gray-700 hover:text-blue-600" aria-label="Открыть меню">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <Link href="/account" className="ml-4 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm font-medium">Аккаунт</Link>
              </div>
            </div>
          </div>
        </nav>
        <Breadcrumbs />
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
        <ScrollToTop />
        <Analytics />
      </body>
    </html>
  );
}
