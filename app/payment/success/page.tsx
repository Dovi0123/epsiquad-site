'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Создаем отдельный компонент для использования useSearchParams
function PaymentSuccess() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const searchParams = useSearchParams();
  // ...existing code...
  
  return (
    // Ваш существующий JSX для компонента успешной оплаты
    <div>
      {/* ...existing code... */}
    </div>
  );
}

// Основной компонент страницы
export default function PaymentSuccessWrapper() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <PaymentSuccess />
    </Suspense>
  );
}