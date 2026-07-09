import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n/i18n.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  // Si un Service Worker nuevo toma el control mientras la pestaña ya está
  // abierta, recargamos una vez para que nunca quede corriendo con una
  // versión vieja del SW a medio actualizar (p.ej. interceptando peticiones
  // que la versión anterior gestionaba mal).
  let yaRecargado = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (yaRecargado) return
    yaRecargado = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registrado:', reg.scope))
      .catch(err => console.error('SW error:', err))
  })
}