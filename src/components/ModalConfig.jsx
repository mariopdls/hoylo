import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { supabase } from '../services/supabase'

const esNativo = Capacitor.isNativePlatform()

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - base64.length % 4) % 4)
  const base64Segura = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const bruto = window.atob(base64Segura)
  return Uint8Array.from([...bruto].map(c => c.charCodeAt(0)))
}

async function llamarApiSuscripcion(metodo, body) {
  const { data: { session } } = await supabase.auth.getSession()
  return fetch(`${import.meta.env.VITE_API_URL || ''}/api/suscripcion-push`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(body)
  })
}

function ModalConfig({ onCerrar, idioma, onToggleIdioma, darkMode, onToggleDark, onToast }) {
  const { t } = useTranslation()
  const [confirmEliminar, setConfirmEliminar] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [notificaciones, setNotificaciones] = useState(false)
  const [perfilPublico, setPerfilPublico] = useState(true)
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false)

  useEffect(() => {
    cargarConfig()
    cargarEstadoNotificaciones()
  }, [])

  const cargarConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('perfiles').select('perfil_publico').eq('id', user.id).maybeSingle()
    if (data) setPerfilPublico(data.perfil_publico ?? true)
  }

  const cargarEstadoNotificaciones = async () => {
    if (esNativo) {
      const estado = await PushNotifications.checkPermissions()
      setNotificaciones(estado.receive === 'granted')
      return
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    const registro = await navigator.serviceWorker.ready
    const suscripcion = await registro.pushManager.getSubscription()
    setNotificaciones(!!suscripcion)
  }

  const togglePerfilPublico = async () => {
    const nuevo = !perfilPublico
    setPerfilPublico(nuevo)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('perfiles').update({ perfil_publico: nuevo }).eq('id', user.id)
  }

  const handleEliminarCuenta = async () => {
    setEliminando(true)
    const { data: { session } } = await supabase.auth.getSession()
    const respuesta = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/eliminar-cuenta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    if (respuesta.ok) {
      await supabase.auth.signOut()
    } else {
      setEliminando(false)
      onToast?.(t('config.errorEliminarCuenta'), 'error')
    }
  }

  const activarNotificacionesNativas = async () => {
    let estado = await PushNotifications.checkPermissions()
    if (estado.receive === 'prompt') {
      estado = await PushNotifications.requestPermissions()
    }
    if (estado.receive !== 'granted') {
      setMostrarInstrucciones(true)
      return
    }

    await new Promise((resolve) => {
      PushNotifications.addListener('registration', async (token) => {
        const respuesta = await llamarApiSuscripcion('POST', { tipo: 'fcm', token: token.value })
        if (respuesta.ok) {
          setNotificaciones(true)
        } else {
          onToast?.(t('config.errorNotificaciones'), 'error')
        }
        resolve()
      })
      PushNotifications.addListener('registrationError', () => {
        onToast?.(t('config.errorNotificaciones'), 'error')
        resolve()
      })
      PushNotifications.register()
    })
  }

  const handleNotificaciones = async () => {
    if (esNativo) {
      if (!notificaciones) {
        await activarNotificacionesNativas()
      } else {
        await llamarApiSuscripcion('DELETE', { tipo: 'fcm' })
        setNotificaciones(false)
      }
      return
    }

    if (!notificaciones) {
      const permiso = await Notification.requestPermission()
      if (permiso !== 'granted') {
        setMostrarInstrucciones(true)
        return
      }

      const registro = await navigator.serviceWorker.ready
      const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
      })

      const respuesta = await llamarApiSuscripcion('POST', suscripcion.toJSON())
      if (respuesta.ok) {
        setNotificaciones(true)
      } else {
        await suscripcion.unsubscribe()
        onToast?.(t('config.errorNotificaciones'), 'error')
      }
    } else {
      const registro = await navigator.serviceWorker.ready
      const suscripcion = await registro.pushManager.getSubscription()
      if (suscripcion) {
        await llamarApiSuscripcion('DELETE', { endpoint: suscripcion.endpoint })
        await suscripcion.unsubscribe()
      }
      setNotificaciones(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <p className="guia-intro">{t('config.titulo')}</p>
          <button className="modal-cerrar" onClick={onCerrar}><i className="ti ti-x"></i></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>

          <p className="detalle-seccion-titulo">{t('config.apariencia')}</p>

          <div className="config-fila" onClick={onToggleDark}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className={`ti ${darkMode ? 'ti-sun' : 'ti-moon'}`} style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
              <p className="reto-titulo">{darkMode ? t('config.modoClaro') : t('config.modoOscuro')}</p>
            </div>
            <div className={`toggle ${darkMode ? 'toggle-activo' : ''}`}></div>
          </div>

          <div className="config-fila" onClick={onToggleIdioma}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="ti ti-language" style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
              <p className="reto-titulo">{idioma === 'es' ? 'Español' : 'English'}</p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('config.cambiarIdioma')}</span>
          </div>

          <p className="detalle-seccion-titulo" style={{ marginTop: '12px' }}>{t('config.notificaciones')}</p>

          <div className="config-fila" onClick={handleNotificaciones}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="ti ti-bell" style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
              <p className="reto-titulo">{t('config.recordatorio')}</p>
            </div>
            <div className={`toggle ${notificaciones ? 'toggle-activo' : ''}`}></div>
          </div>

          {notificaciones && (
            <p className="guia-texto" style={{ fontSize: '12px', paddingLeft: '4px' }}>
              {t('config.horaRecordatorioFija')}
            </p>
          )}

          {mostrarInstrucciones && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '16px', marginTop: '4px' }}>
              <p className="reto-titulo" style={{ marginBottom: '10px' }}>{t('config.comoActivar')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p className="guia-texto" style={{ fontSize: '13px' }}>{t('config.notifInstrucciones1')}</p>
                <p className="guia-texto" style={{ fontSize: '13px' }}>{t('config.notifInstrucciones2')}</p>
                <p className="guia-texto" style={{ fontSize: '13px' }}>{t('config.notifInstrucciones3')}</p>
                <p className="guia-texto" style={{ fontSize: '13px' }}>{t('config.notifInstrucciones4')}</p>
              </div>
              <button className="btn-principal" style={{ marginTop: '12px' }} onClick={() => setMostrarInstrucciones(false)}>
                {t('config.entendido')}
              </button>
            </div>
          )}

          <p className="detalle-seccion-titulo" style={{ marginTop: '12px' }}>{t('config.privacidad')}</p>

          <div className="config-fila" onClick={togglePerfilPublico}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="ti ti-lock" style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
              <div>
                <p className="reto-titulo">{t('config.perfilPublico')}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {perfilPublico ? t('config.perfilPublicoTexto') : t('config.perfilPrivadoTexto')}
                </p>
              </div>
            </div>
            <div className={`toggle ${perfilPublico ? 'toggle-activo' : ''}`}></div>
          </div>

          <p className="detalle-seccion-titulo" style={{ marginTop: '12px' }}>{t('config.cuenta')}</p>

          <div className="config-fila" onClick={() => supabase.auth.signOut()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="ti ti-logout" style={{ fontSize: '20px', color: 'var(--text-secondary)' }}></i>
              <p className="reto-titulo">{t('config.cerrarSesion')}</p>
            </div>
            <i className="ti ti-chevron-right" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div className="config-fila" onClick={() => setConfirmEliminar(true)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="ti ti-trash" style={{ fontSize: '20px', color: '#E24B4A' }}></i>
              <p className="reto-titulo" style={{ color: '#E24B4A' }}>{t('config.eliminarCuenta')}</p>
            </div>
            <i className="ti ti-chevron-right" style={{ color: '#E24B4A' }}></i>
          </div>

          <div className="config-fila" onClick={() => window.open('/terminos.html', '_blank')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="ti ti-file-text" style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
              <p className="reto-titulo">Términos y condiciones</p>
            </div>
            <i className="ti ti-external-link" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          <div className="config-fila" onClick={() => window.open('/privacidad.html', '_blank')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="ti ti-shield-lock" style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
              <p className="reto-titulo">Política de privacidad</p>
            </div>
            <i className="ti ti-external-link" style={{ color: 'var(--text-secondary)' }}></i>
          </div>

          {confirmEliminar && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid #E24B4A', borderRadius: '12px', padding: '14px', marginTop: '4px' }}>
              <p className="guia-texto" style={{ fontSize: '13px', marginBottom: '10px' }}>{t('config.confirmarEliminar')}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-principal" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'none' }} onClick={() => setConfirmEliminar(false)}>
                  {t('config.cancelar')}
                </button>
                <button className="btn-principal" style={{ background: '#E24B4A', boxShadow: 'none' }} onClick={handleEliminarCuenta} disabled={eliminando}>
                  {eliminando ? '...' : t('config.eliminar')}
                </button>
              </div>
            </div>
          )}

          <p className="detalle-seccion-titulo" style={{ marginTop: '12px' }}>{t('config.sobre')}</p>

          <div className="config-fila" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="ti ti-info-circle" style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
              <p className="reto-titulo">{t('config.version')}</p>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>0.1.0 beta</span>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ModalConfig