/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Типы для данных
type User = {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  notifications: boolean;
  language: string;
  theme: string;
};

type Order = {
  id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  order_data: string;
  status: string;
  created_at: string;
};

type SupportTicket = {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
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

// Типы для обратной связи от неавторизованных пользователей
type FeedbackMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  response_count: number;
};

type FeedbackResponse = {
  id: number;
  feedback_id: number;
  responder_id: number;
  responder_name: string;
  is_staff: boolean;
  message: string;
  created_at: string;
};

type AdminPanelSection = 'users' | 'orders' | 'support' | 'feedback' | 'create';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Данные секций
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);
  const [activeSection, setActiveSection] = useState<AdminPanelSection>('users');
  
  // Данные для детальной информации о тикете
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResponses, setTicketResponses] = useState<TicketResponse[]>([]);
  const [responseText, setResponseText] = useState('');
  
  // Данные для детальной информации о сообщении обратной связи
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackMessage | null>(null);
  const [feedbackResponses, setFeedbackResponses] = useState<FeedbackResponse[]>([]);
  const [feedbackResponseText, setFeedbackResponseText] = useState('');
  
  // Форма для создания администратора
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Проверка прав администратора
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/check');
        const data = await res.json();
        
        if (!data.isAdmin) {
          // Редирект на главную, если нет прав администратора
          router.replace('/');
          return;
        }
        
        setIsAdmin(true);
      } catch (err) {
        console.error('Ошибка проверки статуса администратора:', err);
        setError('Не удалось проверить права администратора');
        router.replace('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [router]);
  
  // Загрузка списка пользователей
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      
      if (!res.ok) {
        throw new Error('Ошибка загрузки пользователей');
      }
      
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      console.error('Ошибка при загрузке пользователей:', err);
      setError('Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка списка заказов
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      
      if (!res.ok) {
        throw new Error('Ошибка загрузки заказов');
      }
      
      const data = await res.json();
      setOrders(data.orders);
    } catch (err) {
      console.error('Ошибка при загрузке заказов:', err);
      setError('Не удалось загрузить список заказов');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка списка обращений в поддержку
  const loadSupportTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/support');
      
      if (!res.ok) {
        throw new Error('Ошибка загрузки обращений');
      }
      
      const data = await res.json();
      setSupportTickets(data.tickets);
      
      // Сбрасываем выбранный тикет при загрузке списка
      setSelectedTicket(null);
      setTicketResponses([]);
    } catch (err) {
      console.error('Ошибка при загрузке обращений:', err);
      setError('Не удалось загрузить список обращений');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка детальной информации о тикете
  const loadTicketDetails = async (ticketId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/support?ticketId=${ticketId}`);
      
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
      setLoading(false);
    }
  };
  
  // Загрузка списка сообщений обратной связи
  const loadFeedbackMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/feedback');
      
      if (!res.ok) {
        throw new Error('Ошибка загрузки сообщений обратной связи');
      }
      
      const data = await res.json();
      setFeedbackMessages(data.messages || []);
      
      // Сбрасываем выбранное сообщение при загрузке списка
      setSelectedFeedback(null);
      setFeedbackResponses([]);
    } catch (err) {
      console.error('Ошибка при загрузке сообщений:', err);
      setError('Не удалось загрузить список сообщений обратной связи');
    } finally {
      setLoading(false);
    }
  };
  
  // Загрузка детальной информации о сообщении обратной связи
  const loadFeedbackDetails = async (feedbackId: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/feedback?feedbackId=${feedbackId}`);
      
      if (!res.ok) {
        throw new Error('Ошибка загрузки деталей сообщения');
      }
      
      const data = await res.json();
      setSelectedFeedback(data.message);
      setFeedbackResponses(data.responses);
    } catch (err) {
      console.error('Ошибка при загрузке деталей сообщения:', err);
      setError('Не удалось загрузить детали сообщения');
    } finally {
      setLoading(false);
    }
  };
  
  // Загружаем данные при изменении активной секции
  useEffect(() => {
    if (!isAdmin) return;
    
    if (activeSection === 'users') {
      loadUsers();
    } else if (activeSection === 'orders') {
      loadOrders();
    } else if (activeSection === 'support') {
      loadSupportTickets();
    } else if (activeSection === 'feedback') {
      loadFeedbackMessages();
    }
  }, [activeSection, isAdmin]);
  
  // Обработчик изменения статуса заказа
  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      
      if (!res.ok) {
        throw new Error('Ошибка обновления статуса заказа');
      }
      
      // Обновляем список заказов
      loadOrders();
      setNotification({ type: 'success', message: 'Статус заказа успешно обновлен' });
    } catch (err) {
      console.error('Ошибка обновления статуса заказа:', err);
      setNotification({ type: 'error', message: 'Не удалось обновить статус заказа' });
    }
  };
  
  // Обработчик управления пользователями
  const handleUserAction = async (userId: number, action: 'make_admin' | 'remove_admin' | 'delete') => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      });
      
      if (!res.ok) {
        throw new Error('Ошибка выполнения действия с пользователем');
      }
      
      // Обновляем список пользователей
      loadUsers();
      
      let message = '';
      switch (action) {
        case 'make_admin':
          message = 'Пользователю успешно предоставлены права администратора';
          break;
        case 'remove_admin':
          message = 'Права администратора успешно отозваны';
          break;
        case 'delete':
          message = 'Пользователь успешно удален';
          break;
      }
      
      setNotification({ type: 'success', message });
    } catch (err) {
      console.error('Ошибка выполнения действия с пользователем:', err);
      setNotification({ type: 'error', message: 'Не удалось выполнить действие с пользователем' });
    }
  };
  
  // Создание нового администратора
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      setNotification({ type: 'error', message: 'Пароли не совпадают' });
      return;
    }
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdmin.email,
          name: newAdmin.name,
          password: newAdmin.password,
          isAdmin: true
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка создания администратора');
      }
      
      // Устанавливаем права администратора для нового пользователя
      const userId = data.userId;
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action: 'make_admin' }),
      });
      
      setNotification({ type: 'success', message: 'Новый администратор успешно создан' });
      
      // Сбрасываем форму
      setNewAdmin({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Обновляем список пользователей
      loadUsers();
    } catch (err) {
      console.error('Ошибка создания администратора:', err);
      setNotification({ 
        type: 'error', 
        message: err instanceof Error ? err.message : 'Не удалось создать администратора' 
      });
    }
  };
  
  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prev => ({ ...prev, [name]: value }));
  };
  
  // Обработчик отправки ответа на тикет
  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTicket) return;
    
    if (!responseText.trim()) {
      setNotification({ type: 'error', message: 'Введите текст ответа' });
      return;
    }
    
    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'respond',
          ticketId: selectedTicket.id,
          message: responseText
        }),
      });
      
      if (!res.ok) {
        throw new Error('Ошибка отправки ответа');
      }
      
      setNotification({ type: 'success', message: 'Ответ успешно отправлен' });
      setResponseText('');
      
      // Обновляем информацию о тикете
      loadTicketDetails(selectedTicket.id);
    } catch (err) {
      console.error('Ошибка при отправке ответа:', err);
      setNotification({ type: 'error', message: 'Не удалось отправить ответ' });
    }
  };
  
  // Обработчик изменения статуса тикета
  const handleUpdateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const res = await fetch('/api/admin/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          ticketId,
          status
        }),
      });
      
      if (!res.ok) {
        throw new Error('Ошибка обновления статуса');
      }
      
      setNotification({ type: 'success', message: 'Статус успешно обновлен' });
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        // Обновляем информацию о тикете
        loadTicketDetails(ticketId);
      } else {
        // Обновляем список тикетов
        loadSupportTickets();
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
      setNotification({ type: 'error', message: 'Не удалось обновить статус' });
    }
  };
  
  // Обработчик ответа на сообщение обратной связи
  const handleSendFeedbackResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFeedback) return;
    
    if (!feedbackResponseText.trim()) {
      setNotification({ type: 'error', message: 'Введите текст ответа' });
      return;
    }
    
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'respond',
          feedbackId: selectedFeedback.id,
          message: feedbackResponseText
        }),
      });
      
      if (!res.ok) {
        throw new Error('Ошибка отправки ответа');
      }
      
      setNotification({ type: 'success', message: 'Ответ успешно отправлен' });
      setFeedbackResponseText('');
      
      // Обновляем информацию о сообщении
      loadFeedbackDetails(selectedFeedback.id);
    } catch (err) {
      console.error('Ошибка при отправке ответа:', err);
      setNotification({ type: 'error', message: 'Не удалось отправить ответ' });
    }
  };
  
  // Обработчик изменения статуса сообщения обратной связи
  const handleUpdateFeedbackStatus = async (feedbackId: number, status: string) => {
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_status',
          feedbackId,
          status
        }),
      });
      
      if (!res.ok) {
        throw new Error('Ошибка обновления статуса');
      }
      
      setNotification({ type: 'success', message: 'Статус успешно обновлен' });
      
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        // Обновляем информацию о сообщении
        loadFeedbackDetails(feedbackId);
      } else {
        // Обновляем список сообщений
        loadFeedbackMessages();
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса:', err);
      setNotification({ type: 'error', message: 'Не удалось обновить статус' });
    }
  };
  
  // Функция для возврата к списку сообщений обратной связи
  const handleBackToFeedbacks = () => {
    setSelectedFeedback(null);
    setFeedbackResponses([]);
    loadFeedbackMessages();
  };
  
  // Функция для возврата к списку тикетов
  const handleBackToTickets = () => {
    setSelectedTicket(null);
    setTicketResponses([]);
    loadSupportTickets();
  };
  
  // Получить класс для статуса тикета или обратной связи
  const getStatusClass = (status: string) => {
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
      case 'completed': 
        return 'bg-green-100 text-green-800 border-green-500';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'cancelled': 
        return 'bg-red-100 text-red-800 border-red-500';
      case 'simulated': 
        return 'bg-blue-100 text-blue-800 border-blue-500';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };
  
  // Получить текстовое представление статуса
  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новое';
      case 'in_progress': return 'В обработке';
      case 'waiting_user': return 'Ожидает ответа';
      case 'resolved': return 'Решено';
      case 'closed': return 'Закрыто';
      case 'completed': return 'Выполнен';
      case 'pending': return 'В обработке';
      case 'cancelled': return 'Отменен';
      case 'simulated': return 'Симуляция';
      default: return 'Неизвестно';
    }
  };
  
  // Форматирование даты
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Недоступно';
    }
  };
  
  if (loading && !isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Будет перенаправлено через useEffect
  }
  
  return (
    <main className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Панель администратора</h1>
        
        {/* Уведомления */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notification.message}
            <button 
              className="float-right text-gray-600" 
              onClick={() => setNotification(null)}
            >
              &times;
            </button>
          </div>
        )}
        
        {/* Навигация */}
        <div className="flex mb-6 border-b dark:border-gray-700">
          {[
            { key: 'users', label: 'Пользователи' },
            { key: 'orders', label: 'Заказы' },
            { key: 'support', label: 'Поддержка' },
            { key: 'feedback', label: 'Обратная связь' },
            { key: 'create', label: 'Создать администратора' }
          ].map(section => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key as AdminPanelSection)}
              className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeSection === section.key 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 dark:text-gray-300'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
        
        {/* Секция управления пользователями */}
        {activeSection === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Управление пользователями</h2>
            
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800">
                {error}
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Имя</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Администратор</th>
                    <th className="px-6 py-3">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {user.is_admin ? 
                          <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Да</span> : 
                          <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">Нет</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!user.is_admin ? (
                            <button 
                              onClick={() => handleUserAction(user.id, 'make_admin')}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Сделать админом
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUserAction(user.id, 'remove_admin')}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                            >
                              Удалить права
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
                                handleUserAction(user.id, 'delete');
                              }
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {users.length === 0 && !loading && (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">Пользователи не найдены</p>
              )}
              
              {loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Секция управления заказами */}
        {activeSection === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Управление заказами</h2>
            
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800">
                {error}
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Пользователь</th>
                    <th className="px-6 py-3">Дата</th>
                    <th className="px-6 py-3">Товары</th>
                    <th className="px-6 py-3">Статус</th>
                    <th className="px-6 py-3">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="font-medium">{order.user_name}</div>
                          <div className="text-xs text-gray-500">{order.user_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {(() => {
                          try {
                            const items = JSON.parse(order.order_data);
                            return Array.isArray(items) ? 
                              <span>ID товаров: {items.join(', ')}</span> : 
                              <span>Нет данных</span>;
                          } catch (e) {
                            return <span>Ошибка данных</span>;
                          }
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded border-l-4 ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select 
                          className="border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-white"
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">В обработке</option>
                          <option value="completed">Выполнен</option>
                          <option value="cancelled">Отменен</option>
                          <option value="simulated">Симуляция</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {orders.length === 0 && !loading && (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">Заказы не найдены</p>
              )}
              
              {loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Секция поддержки */}
        {activeSection === 'support' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {!selectedTicket ? (
              <>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Обращения в поддержку</h2>
                
                {error && (
                  <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800">
                    {error}
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Тема</th>
                        <th className="px-6 py-3">Пользователь</th>
                        <th className="px-6 py-3">Дата</th>
                        <th className="px-6 py-3">Статус</th>
                        <th className="px-6 py-3">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {supportTickets.map(ticket => (
                        <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{ticket.id}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                            {ticket.subject}
                            {ticket.response_count > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-blue-100 text-blue-800">
                                {ticket.response_count}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                            <div>
                              <div className="font-medium">{ticket.user_name}</div>
                              <div className="text-xs text-gray-500">{ticket.user_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                            {formatDate(ticket.updated_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded border-l-4 ${getStatusClass(ticket.status)}`}>
                              {getStatusText(ticket.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => loadTicketDetails(ticket.id)}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                Просмотр
                              </button>
                              <select
                                value={ticket.status}
                                onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-white"
                              >
                                <option value="new">Новое</option>
                                <option value="in_progress">В обработке</option>
                                <option value="waiting_user">Ожидает ответа</option>
                                <option value="resolved">Решено</option>
                                <option value="closed">Закрыто</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {supportTickets.length === 0 && !loading && (
                    <p className="text-center py-4 text-gray-500 dark:text-gray-400">Обращения в поддержку не найдены</p>
                  )}
                  
                  {loading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Детальный просмотр тикета
              <div>
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBackToTickets}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    &larr; Назад к списку
                  </button>
                  
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-700 dark:text-gray-300">Статус:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded p-2 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="new">Новое</option>
                      <option value="in_progress">В обработке</option>
                      <option value="waiting_user">Ожидает ответа</option>
                      <option value="resolved">Решено</option>
                      <option value="closed">Закрыто</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-6 border dark:border-gray-700 rounded-lg mb-6">
                  <div className="flex justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                      {selectedTicket.subject}
                    </h2>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusClass(selectedTicket.status)}`}>
                      {getStatusText(selectedTicket.status)}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Отправитель: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedTicket.user_name} ({selectedTicket.user_email})</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Дата создания: <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(selectedTicket.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t dark:border-gray-700 pt-4 mt-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {selectedTicket.message}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">История переписки</h3>
                
                <div className="space-y-4 mb-6">
                  {ticketResponses.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Пока нет ответов</p>
                  ) : (
                    ticketResponses.map(response => (
                      <div 
                        key={response.id} 
                        className={`p-4 border rounded-lg ${
                          response.is_staff 
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                            : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between mb-2">
                          <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                            {response.responder_name}
                            {response.is_staff && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900 dark:text-blue-200">
                                Поддержка
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(response.created_at)}
                          </div>
                        </div>
                        <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {response.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <form onSubmit={handleSendResponse} className="border dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Ответить</h3>
                  
                  <div className="mb-4">
                    <textarea 
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={5}
                      placeholder="Введите ваш ответ..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Отправить ответ
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
        
        {/* Секция обратной связи от неавторизованных пользователей */}
        {activeSection === 'feedback' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            {!selectedFeedback ? (
              <>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
                  Сообщения обратной связи
                </h2>
                
                {error && (
                  <div className="mb-4 p-4 rounded-lg bg-red-100 text-red-800">
                    {error}
                  </div>
                )}
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-700">
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Тема</th>
                        <th className="px-6 py-3">Отправитель</th>
                        <th className="px-6 py-3">Дата</th>
                        <th className="px-6 py-3">Статус</th>
                        <th className="px-6 py-3">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {feedbackMessages.map(message => (
                        <tr key={message.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                            {message.id}
                          </td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                            {message.subject}
                            {message.response_count > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full bg-blue-100 text-blue-800">
                                {message.response_count}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                            <div>
                              <div className="font-medium">{message.name}</div>
                              <div className="text-xs text-gray-500">{message.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                            {formatDate(message.updated_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded border-l-4 ${getStatusClass(message.status)}`}>
                              {getStatusText(message.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => loadFeedbackDetails(message.id)}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                Просмотр
                              </button>
                              <select
                                value={message.status}
                                onChange={(e) => handleUpdateFeedbackStatus(message.id, e.target.value)}
                                className="border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-700 dark:text-white"
                              >
                                <option value="new">Новое</option>
                                <option value="in_progress">В обработке</option>
                                <option value="resolved">Решено</option>
                                <option value="closed">Закрыто</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {feedbackMessages.length === 0 && !loading && (
                    <p className="text-center py-4 text-gray-500 dark:text-gray-400">Сообщения обратной связи не найдены</p>
                  )}
                  
                  {loading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Детальный просмотр сообщения обратной связи
              <div>
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBackToFeedbacks}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    &larr; Назад к списку
                  </button>
                  
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-700 dark:text-gray-300">Статус:</span>
                    <select
                      value={selectedFeedback.status}
                      onChange={(e) => handleUpdateFeedbackStatus(selectedFeedback.id, e.target.value)}
                      className="border border-gray-300 dark:border-gray-600 rounded p-2 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="new">Новое</option>
                      <option value="in_progress">В обработке</option>
                      <option value="resolved">Решено</option>
                      <option value="closed">Закрыто</option>
                    </select>
                  </div>
                </div>
                
                <div className="p-6 border dark:border-gray-700 rounded-lg mb-6">
                  <div className="flex justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                      {selectedFeedback.subject}
                    </h2>
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusClass(selectedFeedback.status)}`}>
                      {getStatusText(selectedFeedback.status)}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Отправитель: <span className="font-medium text-gray-700 dark:text-gray-300">
                        {selectedFeedback.name} ({selectedFeedback.email})
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Дата создания: <span className="font-medium text-gray-700 dark:text-gray-300">
                        {formatDate(selectedFeedback.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t dark:border-gray-700 pt-4 mt-4 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {selectedFeedback.message}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">История переписки</h3>
                
                <div className="space-y-4 mb-6">
                  {feedbackResponses.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Пока нет ответов</p>
                  ) : (
                    feedbackResponses.map(response => (
                      <div 
                        key={response.id} 
                        className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex justify-between mb-2">
                          <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                            {response.responder_name}
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded dark:bg-blue-900 dark:text-blue-200">
                              Администратор
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(response.created_at)}
                          </div>
                        </div>
                        <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {response.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {selectedFeedback.status !== 'resolved' && selectedFeedback.status !== 'closed' && (
                  <form onSubmit={handleSendFeedbackResponse} className="border dark:border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Ответить</h3>
                    
                    <div className="mb-4">
                      <textarea 
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows={5}
                        placeholder="Введите ваш ответ..."
                        value={feedbackResponseText}
                        onChange={(e) => setFeedbackResponseText(e.target.value)}
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Отправить ответ
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Секция создания нового администратора */}
        {activeSection === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Создание нового администратора</h2>
            
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  name="name"
                  value={newAdmin.name}
                  onChange={handleNewAdminChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newAdmin.email}
                  onChange={handleNewAdminChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Пароль
                </label>
                <input
                  type="password"
                  name="password"
                  value={newAdmin.password}
                  onChange={handleNewAdminChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Подтверждение пароля
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={newAdmin.confirmPassword}
                  onChange={handleNewAdminChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
              >
                Создать администратора
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}