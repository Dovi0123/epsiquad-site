'use client';

import { ReactNode } from 'react';

export default function SuccessLayout({ children }: { children: ReactNode }) {
  return (
    <div className="payment-success-layout">
      {children}
    </div>
  );
}
