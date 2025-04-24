'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const TABS = [
  { key: 'profile', label: 'Профиль' },
  { key: 'purchases', label: 'Мои покупки' },
];

// Типы для заказов и продуктов
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  link: string;
  location?: string;
  duration?: number;
};

type Order = {
  id: string;
  date: string;
  items: string[];
  status: 'pending' | 'completed' | 'cancelled';
  total: number;
};

// Типы для данных пользователя и форм
type User = {
  name: string;
  email: string;
  id: string;
};

type LoginForm = {
  email: string;
  password: string;
  name: string;
};

type ProfileForm = {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function AccountPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState<LoginForm>({ email: '', password: '', name: '' });
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'purchases'>('profile');
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  // Состояния для заказов и продуктов
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Состояния для редактирования профиля
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Состояние для отображения формы редактирования профиля
  const [editingProfile, setEditingProfile] = useState(false);
  
  // При получении данных пользователя, обновить настройки из полученных данных
  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setUser(data);
          setProfileForm({
            name: data.name || '',
            email: data.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }
      });
  }, []);

  // Получение продуктов при монтировании
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
      }
    };

    fetchProducts();
  }, []);

  // Получение заказов при переключении на вкладку "Мои покупки"
  useEffect(() => {
    if (activeTab === 'purchases' && user) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const response = await fetch('/api/orders');
          if (response.ok) {
            const data = await response.json();
            setOrders(data.orders || []);
          }
        } catch (error) {
          console.error('Ошибка при загрузке заказов:', error);
        } finally {
          setLoadingOrders(false);
        }
      };

      fetchOrders();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (user && returnTo === 'checkout') {
      // Если пользователь залогинен и был returnTo=checkout, редиректим на /checkout
      const plan = typeof window !== 'undefined' ? localStorage.getItem('selectedPlan') : null;
      if (plan) {
        const planName = JSON.parse(plan).name;
        router.replace(`/checkout?plan=${encodeURIComponent(planName)}`);
      } else {
        router.replace('/checkout');
      }
    }
  }, [user, returnTo, router]);

  // Получение информации о продукте по ID
  const getProductInfo = (productId: string) => {
    return products.find(product => product.id === productId);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Проверка на валидность даты
      if (isNaN(date.getTime())) {
        return 'Недоступно';
      }
      
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return 'Недоступно';
    }
  };
  
  // Получить локализованное название локации
  const getLocationName = (location?: string) => {
    if (!location) return 'Неизвестно';
    return location === 'germany' ? 'Германия' : 'Россия';
  };

  // Форматирование длительности
  const formatDuration = (duration?: number) => {
    if (!duration) return 'Не указано';
    if (duration === 1) return '1 месяц';
    if (duration < 5) return `${duration} месяца`;
    return `${duration} месяцев`;
  };

  // Получить статус заказа в виде текста
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Выполнен';
      case 'pending': return 'В обработке';
      case 'cancelled': return 'Отменен';
      default: return 'Неизвестен';
    }
  };

  // Получить класс для статуса заказа
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-500';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleProfileFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value,
    });
  };

  // Функция для обновления профиля пользователя
  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Проверяем совпадение паролей
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }
    
    // Если меняем пароль, проверяем что текущий пароль указан
    if (profileForm.newPassword && !profileForm.currentPassword) {
      setError('Для смены пароля укажите текущий пароль');
      setLoading(false);
      return;
    }
    
    try {
      // Создаем новый объект с нужными полями для отправки
      const dataToSend = {
        name: profileForm.name,
        email: profileForm.email,
        currentPassword: profileForm.newPassword ? profileForm.currentPassword : '',
        newPassword: profileForm.newPassword ? profileForm.newPassword : ''
      };
      
      const res = await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка при обновлении профиля');
      }
      
      setSuccess('Профиль успешно обновлен');
      
      // Обновляем пользователя в state (только имя и email)
      if (user) {
        const updatedUser = { ...user, name: profileForm.name, email: profileForm.email };
        setUser(updatedUser);
      }
      
      // Очищаем поля паролей
      setProfileForm({
        ...profileForm,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Закрываем режим редактирования
      setEditingProfile(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      if (mode === 'register') setMode('login');
      else {
        // после логина получить профиль
        const me = await fetch('/api/me');
        if (me.ok) setUser(await me.json());
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    router.replace('/');
  };

  const handleTabChange = (tabKey: 'profile' | 'purchases') => {
    setActiveTab(tabKey);
    setError(''); // Очищаем ошибки при смене вкладок
    setSuccess('');
  };

  // Расчет общей суммы заказа
  const calculateOrderTotal = (order: Order) => {
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return 0;
    }
    
    return order.items.reduce((sum: number, productId: string) => {
      const product = getProductInfo(productId);
      return sum + (product ? product.price : 0);
    }, 0);
  };

  if (user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <h2 className="text-2xl font-bold mb-4">Личный кабинет</h2>
          <div className="flex mb-6 border-b">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key as 'profile' | 'purchases')}
                className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 dark:text-gray-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === 'profile' && (
            <div>
              {!editingProfile ? (
                <div>
                  <p className="mb-2">Имя: <b>{user.name}</b></p>
                  <p className="mb-4">Email: <b>{user.email}</b></p>
                  <button 
                    onClick={() => setEditingProfile(true)} 
                    className="bg-blue-500 text-white px-4 py-2 rounded mb-4 w-full"
                  >
                    Редактировать профиль
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Имя
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={profileForm.name}
                      onChange={handleProfileFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={profileForm.email}
                      onChange={handleProfileFormChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  
                  <div className="border-t pt-4 mt-4 border-gray-200 dark:border-gray-700">
                    <h4 className="font-medium mb-2">Сменить пароль (необязательно)</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Текущий пароль
                        </label>
                        <input
                          name="currentPassword"
                          type="password"
                          value={profileForm.currentPassword}
                          onChange={handleProfileFormChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Новый пароль
                        </label>
                        <input
                          name="newPassword"
                          type="password"
                          value={profileForm.newPassword}
                          onChange={handleProfileFormChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Подтвердите новый пароль
                        </label>
                        <input
                          name="confirmPassword"
                          type="password"
                          value={profileForm.confirmPassword}
                          onChange={handleProfileFormChange}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  {success && <div className="text-green-500 text-sm">{success}</div>}
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProfile(false);
                        setError('');
                        setSuccess('');
                        // Восстанавливаем исходные данные
                        setProfileForm({
                          name: user.name || '',
                          email: user.email || '',
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          {activeTab === 'purchases' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Мои покупки</h3>
              
              {loadingOrders ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="mb-2">У вас пока нет заказов</p>
                  <a href="/pricing" className="text-blue-500 hover:underline">
                    Перейти к выбору тарифа
                  </a>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    // Расчет итоговой суммы заказа, если она не была установлена на сервере
                    const orderTotal = order.total > 0 ? order.total : calculateOrderTotal(order);
                    
                    return (
                      <div key={order.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Заказ №{order.id}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              от {formatDate(order.date)}
                            </p>
                          </div>
                          <div className={`px-2 py-1 text-xs rounded border-l-4 ${getStatusClass(order.status)}`}>
                            {getStatusText(order.status)}
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-3">
                          <h4 className="font-medium mb-2">Список услуг:</h4>
                          <ul className="space-y-3">
                            {order.items?.map((productId) => { // Добавлена проверка order.items
                              const product = getProductInfo(productId);
                              return product ? (
                                <li key={productId} className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    {product.location && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Локация: {getLocationName(product.location)}<br />
                                        Период: {formatDuration(product.duration)}
                                      </p>
                                    )}
                                  </div>
                                  <span className="font-semibold">{product.price} ₽</span>
                                </li>
                              ) : (
                                <li key={productId} className="text-gray-500">
                                  Продукт недоступен
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <span className="font-medium">Итого:</span>
                          <span className="font-bold text-lg">{orderTotal} ₽</span>
                        </div>
                        
                        {order.status === 'completed' && (
                          <div className="mt-3">
                            <a
                              href={`/setup?orderId=${order.id}`}
                              className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
                            >
                              Настроить VPN
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <button onClick={handleLogout} className="mt-8 bg-blue-500 text-white px-4 py-2 rounded w-full">Выйти</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex mb-4">
          <button onClick={() => setMode('login')} className={`flex-1 px-4 py-2 rounded-l ${mode==='login' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>Вход</button>
          <button onClick={() => setMode('register')} className={`flex-1 px-4 py-2 rounded-r ${mode==='register' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>Регистрация</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <input name="name" placeholder="Имя" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
            </div>
          )}
          <div>
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          </div>
          <div>
            <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} required className="w-full px-4 py-2 border rounded" />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded">{loading ? 'Загрузка...' : (mode === 'login' ? 'Войти' : 'Зарегистрироваться')}</button>
        </form>
      </div>
    </main>
  );
}
