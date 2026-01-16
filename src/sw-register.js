// (function registerSW() {
//   if (!('serviceWorker' in navigator)) return
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then(() => {
//         // 활성화 상태 보장 위해 첫 진입 후 한번 새로고침하면 안정적
//         // console.log('[SW] registered')
//       })
//       .catch((e) => {
//         console.error('[SW] register failed:', e)
//       })
//   })
// })()
