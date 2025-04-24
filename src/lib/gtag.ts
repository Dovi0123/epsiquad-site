export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Типы событий для отслеживания
export const pageview = (url: string) => {
  if (!GA_TRACKING_ID) return;
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// Отслеживание конверсий и событий
export const event = ({ action, category, label, value }: {
  action: string;
  category: string;
  label: string;
  value?: number;
}) => {
  if (!GA_TRACKING_ID) return;
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Отслеживание экспериментов A/B тестирования
export const experiment = ({ experimentId, variant }: {
  experimentId: string;
  variant: string;
}) => {
  if (!GA_TRACKING_ID) return;
  window.gtag('event', 'experiment_impression', {
    experiment_id: experimentId,
    variant_id: variant,
  });
};

// Отслеживание конверсий покупок
export const purchase = ({ 
  transactionId, 
  value, 
  currency = 'RUB',
  items 
}: {
  transactionId: string;
  value: number;
  currency?: string;
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
  }>;
}) => {
  if (!GA_TRACKING_ID) return;
  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: items,
  });
}; 