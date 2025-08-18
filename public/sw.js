// Service Worker for ducklylist PWA
const CACHE_NAME = 'ducklylist-v1';
const OFFLINE_URL = '/offline.html';

// 캐시할 핵심 파일들
const CORE_CACHE_FILES = [
  '/',
  '/manifest.json',
  '/pavicon.png',
  '/logo_main.png',
  '/offline.html'
];

// 설치 이벤트 - 핵심 파일들을 캐시
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching core files');
        return cache.addAll(CORE_CACHE_FILES);
      })
      .then(() => {
        // 새 서비스 워커를 즉시 활성화
        return self.skipWaiting();
      })
  );
});

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 모든 클라이언트에서 새 서비스 워커 사용
        return self.clients.claim();
      })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  // Firebase, Google Analytics 등 외부 요청은 캐시하지 않음
  if (
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('firebase') ||
    event.request.url.includes('google') ||
    event.request.url.includes('googleapis.com') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // 캐시된 응답이 있으면 반환
        if (cachedResponse) {
          return cachedResponse;
        }

        // 네트워크에서 가져오기 시도
        return fetch(event.request)
          .then((response) => {
            // 응답이 유효하지 않으면 그대로 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 응답을 복제하여 캐시에 저장
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                // 특정 파일 형식만 캐시 (JS, CSS, 이미지 등)
                if (
                  event.request.url.includes('.js') ||
                  event.request.url.includes('.css') ||
                  event.request.url.includes('.png') ||
                  event.request.url.includes('.jpg') ||
                  event.request.url.includes('.svg') ||
                  event.request.url.endsWith('/')
                ) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // 네트워크 실패 시 오프라인 페이지 반환
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
          });
      })
  );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync');
    // 여기에 백그라운드에서 동기화할 로직 추가
  }
});

// 푸시 알림 (선택사항)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo_main.png',
      badge: '/pavicon.png',
      vibrate: [100, 50, 100],
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});