interface Window {
  gtag: (
    command: 'config' | 'event',
    targetId: string,
    config?: {
      page_path?: string;
      event_category?: string;
      event_label?: string;
      value?: number;
      experiment_id?: string;
      variant_id?: string;
      transaction_id?: string;
      currency?: string;
      items?: Array<{
        item_id: string;
        item_name: string;
        price: number;
      }>;
      [key: string]: unknown;
    }
  ) => void;
} 