import { experiment } from './gtag';

type Variant = 'A' | 'B';

interface Experiment {
  id: string;
  variants: {
    A: unknown;
    B: unknown;
  };
}

// Хранилище для экспериментов
const experiments: { [key: string]: Experiment } = {
  'pricing-layout': {
    id: 'exp_001',
    variants: {
      A: 'grid',
      B: 'list'
    }
  },
  'cta-color': {
    id: 'exp_002',
    variants: {
      A: 'blue',
      B: 'green'
    }
  }
};

// Получение варианта для пользователя
export const getVariant = (experimentName: string): Variant => {
  // Проверяем существование эксперимента
  if (!experiments[experimentName]) {
    console.warn(`Experiment ${experimentName} not found`);
    return 'A';
  }

  // Получаем или создаем ID пользователя
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = Math.random().toString(36).substring(2);
    localStorage.setItem('user_id', userId);
  }

  // Определяем вариант на основе userId
  const variant: Variant = (parseInt(userId, 36) % 2 === 0) ? 'A' : 'B';

  // Отправляем событие в GA
  experiment({
    experimentId: experiments[experimentName].id,
    variant: variant
  });

  return variant;
};

// Получение значения варианта
export const getVariantValue = (experimentName: string): unknown => {
  const variant = getVariant(experimentName);
  return experiments[experimentName]?.variants[variant];
}; 