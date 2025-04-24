'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const routes: { [key: string]: string } = {
  '': 'Главная',
  'pricing': 'Тарифы',
  'contact': 'Контакты',
  'faq': 'FAQ',
  'privacy': 'Политика конфиденциальности',
  'terms': 'Условия использования',
  'checkout': 'Оформление заказа',
  'account': 'Личный кабинет'
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  return (
    <nav className="bg-gray-50 dark:bg-gray-800 py-3 px-4 sm:px-6 lg:px-8">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link 
            href="/" 
            className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Главная
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;

          return (
            <li key={path} className="flex items-center">
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {isLast ? (
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {routes[segment] || segment}
                </span>
              ) : (
                <Link
                  href={path}
                  className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {routes[segment] || segment}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 