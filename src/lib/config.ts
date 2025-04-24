// Файл конфигурации для хранения названий сервиса, контактов, серверов и других данных

export const SERVICE_NAME = "Epsiquad VPN";

export const CONTACTS = {
  email: "support@epsiquad.com",
  telegram: "https://t.me/dovi_t",
  platiMarket: "https://plati.market/asp/list_seller.asp?ID_S=1334141"
};

// Настройки для платежной системы Lava
export const PAYMENT_CONFIG = {
  lava: {
    apiUrl: process.env.LAVA_API_URL || 'https://api.lava.ru/business',
    merchantId: process.env.LAVA_MERCHANT_ID || '',
    secretKey: process.env.LAVA_SECRET_KEY || '',
    // Проверка наличия ключей. Вернет true если оба ключа заданы
    isConfigured: () => !!process.env.LAVA_MERCHANT_ID && !!process.env.LAVA_SECRET_KEY
  }
};

export const SERVERS = [
  {
    id: "germany",
    name: "Германия",
    description: "Высокоскоростной сервер в Европе",
    coordinates: { x: 50, y: 45 },
    color: "#4ADE80",
    shadowColor: "rgba(74, 222, 128, 0.2)",
    status: "Онлайн"
  },
  {
    id: "russia",
    name: "Россия",
    description: "Оптимизированный сервер для российских пользователей",
    coordinates: { x: 58, y: 41 },
    color: "#60A5FA",
    shadowColor: "rgba(96, 165, 250, 0.2)",
    status: "Онлайн"
  }
];

export const FAQ = [
  {
    question: "Как отменить подписку?",
    answer: "Вы можете отменить подписку в любой момент через личный кабинет. При отмене до окончания оплаченного периода средства не возвращаются."
  },
  {
    question: "Храните ли вы логи?",
    answer: "Нет, мы не храним логи вашей интернет-активности. Мы собираем только минимально необходимую информацию для работы сервиса."
  },
  {
    question: "Какие серверы доступны?",
    answer: "Мы предоставляем серверы в двух локациях: Германия и Россия. При покупке тарифа вы выбираете одну из этих локаций."
  }
];

export const EXTERNAL_LINKS = {
  v2rayApp: "http://github.com/2dust/v2rayN/releases/latest"
};