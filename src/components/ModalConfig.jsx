import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'

function ModalConfig({ onCerrar, idioma, onToggleIdioma, darkMode, onToggleDark }) {
  const { t } = useTranslation()
  const [confirmEliminar, setConfirmEliminar] = useState(false)
  const [horaRecordatorio, setHoraRecordatorio] = useState('09:00')
  const [notificaciones, setNotificaciones] = useState(false)
  const [perfilPublico, setPerfilPublico] = useState(true)
  const [mostrarInstrucciones, setMostrarInstrucciones] = useState(false)

  useEffect(() => { cargarConfig() }, [])

  const cargarConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('perfiles').select('perfil_publico').eq('id', user.id).maybeSingle()
    if (data) setPerfilPublico(data.perfil_publico ?? true)
  }

  const togglePerfilPublico = async () => {
    const nuevo = !perfilPublico
    setPerfilPublico(nuevo)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('perfiles').update({ perfil_publico: nuevo }).eq('id', user.id)
  }

  const handleEliminarCuenta = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('perfiles').delete().eq('id', user.id)
    await supabase.from('retos').delete().eq('usuario_id', user.id)
    await supabase.auth.signOut()
  }

  const programarRecordatorio = (hora) => {
    const [horas, minutos] = hora.split(':').map(Number)
    const ahora = new Date()
    const objetivo = new Date()
    objetivo.setHours(horas, minutos, 0, 0)
    if (objetivo <= ahora) objetivo.setDate(objetivo.getDate() + 1)
    const diff = objetivo - ahora
    setTimeout(() => {
      new Notification('Hoylo 🌞', { body: '¡No olvides completar tus retos de hoy!', icon: '/icon-192.png' })
      programarRecordatorio(hora)
    }, diff)
  }

  const handleNotificaciones = () => {
    if (!notificaciones) {
      Notification.requestPermission().then(permiso => {
        if (permiso === 'granted') {
          setNotificaciones(true)
          programarRecordatorio(horaRecordatorio)
        } else {
          setMostrarInstrucciones(true)
        }
      })
    } else {
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
            <div className="config-fila">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <i className="ti ti-clock" style={{ fontSize: '20px', color: 'var(--accent)' }}></i>
                <p className="reto-titulo">{t('config.horaRecordatorio')}</p>
              </div>
              <input
                type="time"
                value={horaRecordatorio}
                onChange={e => { setHoraRecordatorio(e.target.value); programarRecordatorio(e.target.value) }}
                style={{ border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--font-base)' }}
              />
            </div>
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

          {confirmEliminar && (
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid #E24B4A', borderRadius: '12px', padding: '14px', marginTop: '4px' }}>
              <p className="guia-texto" style={{ fontSize: '13px', marginBottom: '10px' }}>{t('config.confirmarEliminar')}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-principal" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'none' }} onClick={() => setConfirmEliminar(false)}>
                  {t('config.cancelar')}
                </button>
                <button className="btn-principal" style={{ background: '#E24B4A', boxShadow: 'none' }} onClick={handleEliminarCuenta}>
                  {t('config.eliminar')}
                </button>
              </div>
            </div>
          )}

          <p className="detalle-seccion-titulo" style={{ marginTop: '12px' }}>{t('config.sobre')}</p>

          <div className="config-fila">
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