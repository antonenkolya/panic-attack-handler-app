const CACHE_NAME = 'panic-handler-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/pahandle.png',
  '/script.js',
  '/static/js/bundle.js',
  'index.html',
  '/checkAuth',
  '/cards',
  '/cards/personal',
  '/theoryChapters',
  '/theory/:theory_chapter_id',
  '/user-mood',
  '/mood/statistics/all',
  '/mood/statistics/current_month',
  '/mood/statistics/current_week',
  '/panic-attacks',
  '/pa/statistics/all',
  '/pa/statistics/current_month',
  '/pa/statistics/current_week',
  '/locations',
  '/veg-symps',
  '/psy-symps',
  '/role'
];

self.addEventListener('install', event => {
  console.log('Service Worker: установка...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: кэширование файлов...');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Service Worker: ошибка кэширования: ', err))
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: активация...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: очистка старого кэша...');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  console.log('Service Worker: получение ответа с сервера: ', event.request.url);
  const requestUrl = new URL(event.request.url);
  const isUrlToCache = urlsToCache.includes(requestUrl.pathname);

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (isUrlToCache) {
        // Клонирование результата, так как response может быть прочитан только один раз
          const clonedResponse = response.clone();
        // Кэширование результата запроса для последующего использования
          caches.open(CACHE_NAME)
            .then(cache => {
              console.log('Service Worker: кэширование полученных данных: ', event.request.url);
              cache.put(event.request, clonedResponse);
            })
            .catch(err => console.error('Service Worker: ошибка записи в кэш: ', err));
        }
        // Оригинальный результат (с сервера) возвращается для использования в браузере
        return response;
      })
      .catch(() => {
        // Если запрос к серверу не удался, совершается попытка найти результат в кеше
        return caches.match(event.request)
          .then(response => {
            if (response) {
              console.log('Service Worker: получение данных из кэша: ', event.request.url);
              return response;
            }
            console.log('Service Worker: запрашиваемые данные отсутствуют в кэше: ', event.request.url);
            return new Response('Страница не найдена', { status: 404, statusText: 'Not Found' });
          })
          .catch(error => {
            console.error('Service Worker: ошибка совпадения:', error);
            return new Response('Страница не найдена', { status: 404, statusText: 'Not Found' });
          });
      })
  );
});

self.addEventListener('push', event => {
  // получение данных уведомления из события push
  const data = event.data.json(); 
  event.waitUntil(
    self.registration.showNotification(data.title || 'Новое уведомление', {
      body: data.body || 'Содержание уведомления отсутствует',
      icon: data.icon
    })
  );
});
