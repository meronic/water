// // Service Worker: /api → /tankmonitoring , /hls → /tankmonitoring/hls
// const ORIGIN = self.location.origin

// self.addEventListener('install', (evt) => {
//   self.skipWaiting()
// })

// self.addEventListener('activate', (evt) => {
//   evt.waitUntil(self.clients.claim())
// })

// self.addEventListener('fetch', (evt) => {
//   const req = evt.request
//   const url = new URL(req.url)

//   // 같은 오리진의 /api/* 만 변환
//   if (url.origin === ORIGIN && url.pathname.startsWith('/api/')) {
//     const rewritten = ORIGIN + '/tankmonitoring' + url.pathname.replace(/^\/api/, '') + url.search
//     const init = {
//       method: req.method,
//       headers: req.headers,
//       body: req.method !== 'GET' && req.method !== 'HEAD' ? req.clone().body : undefined,
//       credentials: 'same-origin',
//       redirect: 'follow',
//     }
//     evt.respondWith(fetch(rewritten, init))
//     return
//   }

//   // HLS 변환: /hls/... -> /tankmonitoring/hls/...
//   if (url.origin === ORIGIN && url.pathname.startsWith('/hls/')) {
//     const rewritten = ORIGIN + '/tankmonitoring' + url.pathname + url.search
//     evt.respondWith(fetch(rewritten, { credentials: 'same-origin', redirect: 'follow' }))
//     return
//   }
// })
