const SW_URL = '/Pocha/sw.js'
const SW_SCOPE = '/Pocha/'
const UPDATE_GRACE_MS = 20000

export function setupServiceWorker(): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  const startedAt = Date.now()
  let userInteracted = false
  const markInteraction = () => {
    userInteracted = true
  }
  window.addEventListener('pointerdown', markInteraction, { capture: true })
  window.addEventListener('keydown', markInteraction, { capture: true })

  let hadController = navigator.serviceWorker.controller !== null
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const isUpdate = hadController
    hadController = true
    if (reloading || !isUpdate) return
    // Solo se recarga en un arranque reciente sin interacción:
    // en plena partida la nueva versión se aplicará cuando se vuelva a abrir.
    if (userInteracted || Date.now() - startedAt > UPDATE_GRACE_MS) return
    reloading = true
    window.location.reload()
  })

  const requestUpdateCheck = (registration: ServiceWorkerRegistration) => {
    registration.update().catch(() => {})
  }

  const register = () => {
    navigator.serviceWorker
      .register(SW_URL, { scope: SW_SCOPE })
      .then((registration) => requestUpdateCheck(registration))
      .catch(() => {})
  }

  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}
