'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Ссылки на приложения v2rayng
const V2RAY_LINKS = {
  windows: 'https://github.com/2dust/v2rayN/releases/latest',
  macos: 'https://github.com/2dust/v2rayN/releases/latest',
  ios: 'https://apps.apple.com/ru/app/v2box-v2ray-client/id6446814690',
  android: 'https://play.google.com/store/apps/details?id=com.v2ray.ang'
};

export default function Setup() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [subscriptionLink, setSubscriptionLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!orderId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/configs?orderId=${orderId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Не удалось получить данные подписки');
        }
        
        const data = await response.json();
        setSubscriptionLink(data.subscriptionLink);
        setProductId(data.productId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [orderId]);
  
  const handleCopyLink = () => {
    if (subscriptionLink) {
      navigator.clipboard.writeText(subscriptionLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12 text-white">Подписка на VPN</h1>
        
        {/* Секция подписки */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Ваша подписка на VPN</h2>
            
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
                {!orderId && (
                  <p className="mt-2">
                    Для получения подписки перейдите на страницу через ссылку в вашем заказе.
                  </p>
                )}
              </div>
            ) : subscriptionLink ? (
              <>
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Используйте эту ссылку для подписки на VPN в приложении v2rayng:
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <button
                      onClick={handleCopyLink}
                      className={`flex items-center px-4 py-2 rounded ${copied ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'} transition-colors`}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                      </svg>
                      {copied ? 'Скопировано!' : 'Скопировать ссылку'}
                    </button>
                  </div>
                  
                  <div className="bg-gray-100 dark:bg-gray-700 rounded p-4">
                    <code className="text-sm break-all text-gray-800 dark:text-gray-200 font-mono">
                      {subscriptionLink}
                    </code>
                  </div>
                </div>
                
                {productId && (
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200">
                      Информация о подписке
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Локация: {productId.includes('germany') ? 'Германия' : 'Россия'}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Срок действия: {extractDuration(productId)} {getDurationText(extractDuration(productId))}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-gray-600 dark:text-gray-300">
                <p>Для получения доступа к VPN выберите заказ в разделе &quot;Мои покупки&quot;</p>
                <a href="/account" className="text-blue-500 hover:underline mt-2 inline-block">
                  Перейти в личный кабинет
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {/* Инструкции по использованию v2rayng */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Как подключить VPN через v2rayng</h2>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <ol className="list-decimal list-inside space-y-4">
                <li className="text-black">
                  Скачайте и установите приложение v2rayng для вашей платформы:
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <a href={V2RAY_LINKS.windows} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50">
                      <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0V0z" fill="none"/>
                        <path d="M3 5v14h18V5H3zm16 12H5V7h14v10z"/>
                      </svg>
                      <span>Windows</span>
                    </a>
                    <a href={V2RAY_LINKS.macos} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50">
                      <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.22.07-.64.22-.92.35-.28.13-.57.25-.87.36zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <span>macOS</span>
                    </a>
                    <a href={V2RAY_LINKS.ios} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50">
                      <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.71-.61-2.69-.66-4.07-.12-1.38.54-2.12.5-3.28-.05-1.16-.55-1.99-1.5-3.28-1.45-1.29.05-2.48.85-3.18 2.14-2.75 4.5-.28 11.08 3.18 13.58 1.73 1.25 3.73 1.68 5.78 1.68 2.05 0 4.05-.43 5.78-1.68 3.46-2.5 5.93-9.08 3.18-13.58-.7-1.29-1.89-2.09-3.18-2.14-1.29-.05-2.12.9-3.28 1.45-1.16.55-1.9.59-3.28.05-1.38-.54-2.36-.49-4.07.12-1.03.45-2.1.6-3.08-.35-1.16-1.12-1.5-2.5-1.5-3.8 0-1.3.34-2.68 1.5-3.8 1.16-1.12 2.5-1.5 3.8-1.5 1.3 0 2.68.38 3.8 1.5 1.12 1.12 1.5 2.5 1.5 3.8 0 1.3-.34 2.68-1.5 3.8z"/>
                      </svg>
                      <span>iOS</span>
                    </a>
                    <a href={V2RAY_LINKS.android} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-3 border rounded-lg hover:bg-gray-50">
                      <svg className="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-2.86-1.21-6.08-1.21-8.94 0L5.65 5.67c-.19-.29-.58-.38-.87-.2-.28.18-.37.54-.22.83L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
                      </svg>
                      <span>Android</span>
                    </a>
                  </div>
                </li>
                <li className="text-black">Откройте приложение v2rayng</li>
                <li className="text-black">Нажмите на кнопку &quot;+&quot; для добавления новой подписки</li>
                <li className="text-black">Выберите опцию &quot;Добавить из буфера обмена&quot; или &quot;Добавить подписку&quot;</li>
                <li className="text-black">Вставьте скопированную ссылку</li>
                <li className="text-black">Нажмите &quot;Сохранить&quot; или &quot;Добавить&quot;</li>
                <li className="text-black">После добавления конфигурации, выберите её и нажмите на кнопку подключения</li>
              </ol>
            </div>
          </div>

          {/* Инструкции для разных платформ */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-white">Особенности настройки на разных платформах</h2>
            
            {/* Windows */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-white">Windows</h3>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <ol className="list-decimal list-inside space-y-3">
                  <li className="text-black">Скачайте v2rayN для Windows с <a href={V2RAY_LINKS.windows} className="text-blue-500 hover:text-blue-700 underline">GitHub</a></li>
                  <li className="text-black">Распакуйте архив и запустите v2rayN.exe</li>
                  <li className="text-black">Нажмите на значок &quot;+&quot; в верхней панели</li>
                  <li className="text-black">Выберите &quot;Добавить конфигурацию сервера из буфера обмена&quot;</li>
                  <li className="text-black">Предварительно скопировав ссылку кнопкой выше, нажмите OK</li>
                  <li className="text-black">В трее Windows выберите добавленный сервер и нажмите &quot;Включить V2Ray&quot;</li>
                </ol>
              </div>
            </div>
            
            {/* Android */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-white">Android</h3>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <ol className="list-decimal list-inside space-y-3">
                  <li className="text-black">Установите <a href={V2RAY_LINKS.android} className="text-blue-500 hover:text-blue-700 underline">v2rayNG из Google Play</a></li>
                  <li className="text-black">Запустите приложение</li>
                  <li className="text-black">Нажмите на кнопку &quot;+&quot; в правом нижнем углу</li>
                  <li className="text-black">Выберите &quot;Добавить из буфера обмена&quot;</li>
                  <li className="text-black">Предварительно скопировав ссылку кнопкой выше, подтвердите добавление</li>
                  <li className="text-black">Нажмите на кнопку &quot;V&quot; внизу экрана для подключения</li>
                </ol>
              </div>
            </div>
            
            {/* iOS */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-white">iOS</h3>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <ol className="list-decimal list-inside space-y-3">
                  <li className="text-black">Установите <a href={V2RAY_LINKS.ios} className="text-blue-500 hover:text-blue-700 underline">V2Box из App Store</a></li>
                  <li className="text-black">Запустите приложение</li>
                  <li className="text-black">Нажмите на кнопку &quot;+&quot; в верхнем правом углу</li>
                  <li className="text-black">Выберите &quot;Импорт из буфера обмена&quot;</li>
                  <li className="text-black">Предварительно скопировав ссылку кнопкой выше, подтвердите добавление</li>
                  <li className="text-black">Нажмите на переключатель возле добавленной конфигурации для подключения</li>
                </ol>
              </div>
            </div>
            
            {/* macOS */}
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-white">macOS</h3>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <ol className="list-decimal list-inside space-y-3">
                  <li className="text-black">Для macOS рекомендуем использовать <a href="https://github.com/yanue/V2rayU/releases" className="text-blue-500 hover:text-blue-700 underline">V2rayU</a></li>
                  <li className="text-black">Скачайте и установите приложение</li>
                  <li className="text-black">Запустите V2rayU</li>
                  <li className="text-black">Нажмите на значок в строке меню и выберите &quot;Импорт конфигурации&quot; → &quot;Из буфера обмена&quot;</li>
                  <li className="text-black">Предварительно скопировав ссылку кнопкой выше, подтвердите импорт</li>
                  <li className="text-black">Выберите профиль и нажмите &quot;Включить V2Ray&quot;</li>
                </ol>
              </div>
            </div>
          </div>
          
          {/* Поддержка */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Нужна помощь?</h3>
            <p className="text-gray-700 mb-3">
              Если у вас возникли сложности при настройке VPN, обратитесь в нашу службу поддержки.
            </p>
            <a href="/contact" className="inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
              Связаться с поддержкой
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

// Извлекает число месяцев из ID продукта
function extractDuration(productId: string): number {
  const match = productId.match(/(\d+)m$/);
  return match ? parseInt(match[1]) : 1;
}

// Возвращает склонение слова "месяц" в зависимости от числа
function getDurationText(months: number): string {
  if (months === 1) return 'месяц';
  if (months >= 2 && months <= 4) return 'месяца';
  return 'месяцев';
}