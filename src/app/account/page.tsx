/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, ChangeEvent, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FeedbackForm from '@/components/FeedbackForm';

const TABS = [
  { key: 'profile', label: 'Профиль' },
  { key: 'purchases', label: 'Мои покупки' },
  { key: 'support', label: 'Поддержка' }, // Добавлена новая вкладка
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

// Типы для обращений в поддержку
type SupportTicket = {
  id: number;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  response_count: number;
};

type TicketResponse = {
  id: number;
  ticket_id: number;
  responder_id: number;
  responder_name: string;
  is_staff: boolean;
  message: string;
  created_at: string;
};

function AccountPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState<LoginForm>({ email: '', password: '', name: '' });
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'purchases' | 'support'>('profile');
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
  
  // Состояния для обращений в поддержку
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResponses, setTicketResponses] = useState<TicketResponse[]>([]);
  const [responseText, setResponseText] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  
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

  // Получение списка обращений при переключении на вкладку "Поддержка"
  useEffect(() => {
    if (activeTab === 'support' && user && !showNewTicketForm) {
      const fetchTickets = async () => {
        setLoadingTickets(true);
        try {
          const response = await fetch('/api/support/tickets');
          if (response.ok) {
            const data = await response.json();
            setSupportTickets(data.tickets || []);
            // Сбрасываем выбранный тикет при загрузке списка
            setSelectedTicket(null);
            setTicketResponses([]);
          }
        } catch (error) {
          console.error('Ошибка при загрузке обращений:', error);
        } finally {
          setLoadingTickets(false);
        }
      };

      fetchTickets();
    }
  }, [activeTab, user, showNewTicketForm]);

  // Загрузка детальной информации о тикете
  const loadTicketDetails = async (ticketId: number) => {
    try {
      setLoadingTickets(true);
      const res = await fetch(`/api/support/tickets?ticketId=${ticketId}`);
      
      if (!res.ok) {
        throw new Error('Ошибка загрузки деталей обращения');
      }
      
      const data = await res.json();
      setSelectedTicket(data.ticket);
      setTicketResponses(data.responses);
    } catch (err) {
      console.error('Ошибка при загрузке деталей обращения:', err);
      setError('Не удалось загрузить детали обращения');
    } finally {
      setLoadingTickets(false);
    }
  };
  
  // Обработчик отправки ответа на тикет
  const handleSendResponse = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!selectedTicket) return;
    
    if (!responseText.trim()) {
      setError('Введите текст ответа');
      return;
    }
    
    try {
      setLoading(true);
      
      const res = await fetch('/api/support/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: responseText
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Ошибка отправки ответа');
      }
      
      setSuccess('Ответ успешно отправлен');
      setResponseText('');
      
      // Обновляем информацию о тикете
      loadTicketDetails(selectedTicket.id);
    } catch (err) {
      console.error('Ошибка при отправке ответа:', err);
      setError(err instanceof Error ? err.message : 'Не удалось отправить ответ');
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для возврата к списку тикетов
  const handleBackToTickets = () => {
    setSelectedTicket(null);
    setTicketResponses([]);
    setError('');
    setSuccess('');
  };
  
  // Функция для показа формы нового обращения
  const handleNewTicketClick = () => {
    setShowNewTicketForm(true);
    setSelectedTicket(null);
    setTicketResponses([]);
    setError('');
    setSuccess('');
  };
  
  // Обработчик успешного создания тикета
  const handleTicketCreated = () => {
    setShowNewTicketForm(false);
  };
  
  // Получить класс для статуса тикета
  const getTicketStatusClass = (status: string) => {
    switch (status) {
      case 'new': 
        return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'in_progress': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'waiting_user': 
        return 'bg-purple-100 text-purple-800 border-purple-500';
      case 'resolved': 
        return 'bg-green-100 text-green-800 border-green-500';
      case 'closed': 
        return 'bg-gray-100 text-gray-800 border-gray-500';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };
  
  // Получить текстовое представление статуса тикета
  const getTicketStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новое';
      case 'in_progress': return 'В обработке';
      case 'waiting_user': return 'Ожидает ответа';
      case 'resolved': return 'Решено';
      case 'closed': return 'Закрыто';
      default: return 'Неизвестно';
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

  const handleTabChange = (tabKey: 'profile' | 'purchases' | 'support') => {
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
                onClick={() => handleTabChange(tab.key as 'profile' | 'purchases' | 'support')}
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
              {!user.isAdmin ? (
                  <button 
                    onClick={() => router.push('/admin')} 
                    className="bg-blue-500 text-white px-4 py-2 rounded mb-4 w-full"
                  >
                  Панель администратора
                  </button>
                  ): (<div></div>)}
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
          {activeTab === 'support' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Техническая поддержка</h3>
                {!showNewTicketForm && !selectedTicket && (
                  <button
                    onClick={handleNewTicketClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm transition-colors"
                  >
                    Новое обращение
                  </button>
                )}
                {(showNewTicketForm || selectedTicket) && (
                  <button
                    onClick={() => {
                      setShowNewTicketForm(false);
                      handleBackToTickets();
                    }}
                    className="text-blue-500 hover:text-blue-600 flex items-center text-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Назад к списку
                  </button>
                )}
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
                  {success}
                </div>
              )}

              {showNewTicketForm ? (
                <FeedbackForm 
                  isAuthenticated={true} 
                  username={user.name} 
                  userEmail={user.email}
                  onSuccess={handleTicketCreated}
                />
              ) : selectedTicket ? (
                // Детальный просмотр тикета
                <div className="mt-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 shadow-sm">
                    <div className="flex justify-between">
                      <h4 className="text-lg font-medium">{selectedTicket.subject}</h4>
                      <span className={`px-2 py-1 text-xs rounded border-l-4 ${getTicketStatusClass(selectedTicket.status)}`}>
                        {getTicketStatusText(selectedTicket.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Создано: {formatDate(selectedTicket.created_at)}
                    </p>
                    <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                      <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                    </div>
                  </div>

                  <h5 className="font-medium mb-2">История сообщений:</h5>
                  
                  {ticketResponses.length === 0 ? (
                    <p className="text-center py-3 text-gray-500">Пока нет ответов на это обращение.</p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {ticketResponses.map((response) => (
                        <div key={response.id} className={`p-3 rounded-lg ${
                          response.is_staff 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                        }`}>
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <span className="font-medium">{response.responder_name}</span>
                              {response.is_staff && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 rounded-full">
                                  Специалист
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(response.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Форма ответа, если статус не "решено" или "закрыто" */}
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <form onSubmit={handleSendResponse} className="mt-4">
                      <label htmlFor="response" className="block font-medium mb-2">
                        Ответить:
                      </label>
                      <textarea
                        id="response"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={4}
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Введите ваш ответ..."
                        required
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Отправка...' : 'Отправить'}
                      </button>
                    </form>
                  )}
                </div>
              ) : loadingTickets ? (
                <div className="flex justify-center my-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : supportTickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="mb-4">У вас пока нет обращений в службу поддержки.</p>
                  <button
                    onClick={handleNewTicketClick}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded transition-colors"
                  >
                    Создать первое обращение
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
                        <th className="px-6 py-3">#</th>
                        <th className="px-6 py-3">Тема</th>
                        <th className="px-6 py-3">Дата</th>
                        <th className="px-6 py-3">Статус</th>
                        <th className="px-6 py-3">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {supportTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                            {ticket.id}
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                            {ticket.subject}
                            {ticket.response_count > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-blue-100 text-blue-800">
                                {ticket.response_count}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                            {formatDate(ticket.updated_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded border-l-4 ${getTicketStatusClass(ticket.status)}`}>
                              {getTicketStatusText(ticket.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => loadTicketDetails(ticket.id)}
                              className="text-blue-500 hover:text-blue-600"
                            >
                              Просмотреть
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default function AccountPageWrapper() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <AccountPage />
    </Suspense>
  );
}
