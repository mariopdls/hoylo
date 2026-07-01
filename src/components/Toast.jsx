import { useEffect } from 'react'

function Toast({ mensaje, onClose }) {
  useEffect(() => {
    if (!mensaje) return
    const timer = setTimeout(onClose, 2500)
    return () => clearTimeout(timer)
  }, [mensaje])

  if (!mensaje) return null

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: 'var(--bg-card)',
      border: `1px solid ${mensaje.tipo === 'ok' ? '#3B6D11' : '#E24B4A'}`,
      borderRadius: '999px',
      padding: '10px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: '600',
      color: mensaje.tipo === 'ok' ? '#3B6D11' : '#E24B4A',
      whiteSpace: 'nowrap',
      animation: 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      fontFamily: 'var(--font-base)'
    }}>
      <i className={`ti ${mensaje.tipo === 'ok' ? 'ti-circle-check' : 'ti-circle-x'}`}></i>
      {mensaje.texto}
    </div>
  )
}

export default Toast