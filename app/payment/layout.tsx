'use client';

import { ReactNode } from 'react';

export default function PaymentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="payment-layout">
      {children}
    </div>
  );
}
