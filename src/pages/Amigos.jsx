import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'
import { createPortal } from 'react-dom'
import {
  cargarInvitacionesPendientes, aceptarInvitacion, rechazarInvitacion,
  enviarSolicitudAmistad, cargarSolicitudesPendientes,
  aceptarSolicitudAmistad, rechazarSolicitudAmistad, cargarAmigos,
  cargarSolicitudesReto, aceptarSolicitudReto, rechazarSolicitudReto,
  buscarUsuarios
} from '../services/social'
import PerfilAmigo from './PerfilAmigo'

function Amigos({ usuario, retosUsuario, onRecargarRetos, onRecargarNotificaciones, onToast }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('solicitudes')
  const [invitacionesRetos, setInvitacionesRetos] = useState([])
  const [solicitudesAmistad, setSolicitudesAmistad] = useState([])
  const [solicitudesReto, setSolicitudesReto] = useState([])
  const [amigos, setAmigos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [usernameSolicitar, setUsernameSolicitar] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState([])
  const [amigoSeleccionado, setAmigoSeleccionado] = useState(null)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const { data } = await supabase
      .from('perfiles').select('username, nombre').eq('id', usuario.id).maybeSingle()
    setPerfil(data)
    if (data?.username) {
      const invs = await cargarInvitacionesPendientes(data.username)
      setInvitacionesRetos(invs)
    }
    const sols = await cargarSolicitudesPendientes()
    setSolicitudesAmistad(sols)
    const solReto = await cargarSolicitudesReto()
    setSolicitudesReto(solReto)
    const amigosLista = await cargarAmigos()
    setAmigos(amigosLista)
    setCargando(false)
  }

  const handleAceptarReto = async (inv) => {
    const resultado = await aceptarInvitacion(inv.id, inv.reto_id, usuario.id)
    if (resultado.error) {
      onToast?.(resultado.error, 'error')
      return
    }
    setInvitacionesRetos(prev => prev.filter(i => i.id !== inv.id))
    onRecargarRetos()
    setTimeout(() => onRecargarNotificaciones?.(), 1000)
    onToast?.(t('toast.teUniste'))
  }

  const handleRechazarReto = async (inv) => {
    const resultado = await rechazarInvitacion(inv.id)
    if (resultado.error) {
      onToast?.(resultado.error, 'error')
      return
    }
    setInvitacionesRetos(prev => prev.filter(i => i.id !== inv.id))
    setTimeout(() => onRecargarNotificaciones?.(), 1000)
    onToast?.(t('toast.invitacionRechazada'))
  }

  const handleAceptarAmistad = async (sol) => {
    await aceptarSolicitudAmistad(sol.id, sol.de_usuario_id)
    setSolicitudesAmistad(prev => prev.filter(s => s.id !== sol.id))
    const amigosLista = await cargarAmigos()
    setAmigos(amigosLista)
    setTimeout(() => onRecargarNotificaciones?.(), 1000)
    onToast?.(t('toast.ahoraAmigos'))
    setTab('amigos')
  }

  const handleRechazarAmistad = async (sol) => {
    await rechazarSolicitudAmistad(sol.id)
    setSolicitudesAmistad(prev => prev.filter(s => s.id !== sol.id))
    setTimeout(() => onRecargarNotificaciones?.(), 1000)
    onToast?.(t('toast.solicitudRechazada'))
  }

  const handleAceptarSolicitudReto = async (sol) => {
  await aceptarSolicitudReto(sol.id, sol.reto_id, sol.usuario_id)
  setSolicitudesReto(prev => prev.filter(s => s.id !== sol.id))
  setTimeout(() => {
    onRecargarRetos()
    onRecargarNotificaciones?.()
  }, 1000)
  onToast?.(t('toast.usuarioAñadido'))
}

  const handleRechazarSolicitudReto = async (sol) => {
    await rechazarSolicitudReto(sol.id)
    setSolicitudesReto(prev => prev.filter(s => s.id !== sol.id))
    setTimeout(() => onRecargarNotificaciones?.(), 1000)
    onToast?.(t('toast.solicitudRechazada'))
  }

  const handleBuscar = async (valor) => {
    setUsernameSolicitar(valor)
    if (valor.length >= 2) {
      const resultados = await buscarUsuarios(valor)
      setResultadosBusqueda(resultados.filter(r => r.id !== usuario.id))
    } else {
      setResultadosBusqueda([])
    }
  }

  const handleSolicitarDesdeResultado = async (u) => {
    const resultado = await enviarSolicitudAmistad(u.username)
    onToast?.(resultado.error || t('toast.solicitudEnviada'), resultado.error ? 'error' : 'ok')
    if (!resultado.error) {
      setUsernameSolicitar('')
      setResultadosBusqueda([])
    }
  }

  const totalPendientes = invitacionesRetos.length + solicitudesAmistad.length + solicitudesReto.length

  if (cargando) return <div style={{ padding: '20px' }}><p className="guia-texto">{t('amigos.cargando')}</p></div>

  return (
    <div style={{ paddingBottom: '20px' }}>
      <p className="guia-intro" style={{ marginBottom: '16px' }}>{t('amigos.titulo')}</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button className={`btn-dias ${tab === 'solicitudes' ? 'btn-dias-activo' : ''}`} onClick={() => setTab('solicitudes')}>
          {t('amigos.solicitudes')} {totalPendientes > 0 && `(${totalPendientes})`}
        </button>
        <button className={`btn-dias ${tab === 'amigos' ? 'btn-dias-activo' : ''}`} onClick={() => setTab('amigos')}>
          {t('amigos.listaAmigos')} ({amigos.length})
        </button>
        <button className={`btn-dias ${tab === 'buscar' ? 'btn-dias-activo' : ''}`} onClick={() => setTab('buscar')}>
          {t('amigos.añadir')}
        </button>
      </div>

      {tab === 'solicitudes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {solicitudesAmistad.length > 0 && (
            <div>
              <p className="detalle-seccion-titulo" style={{ marginBottom: '10px' }}>{t('amigos.solicitudesAmistad')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {solicitudesAmistad.map((sol, i) => (
                  <div key={sol.id} className="config-fila" style={{ cursor: 'default', animation: `staggerIn 0.25s ease ${i * 0.04}s both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="participante-avatar">{sol.perfil?.nombre?.charAt(0).toUpperCase() || '?'}</div>
                      <div>
                        <p className="reto-titulo">{sol.perfil?.nombre}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{sol.perfil?.username}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleRechazarAmistad(sol)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        <i className="ti ti-x"></i>
                      </button>
                      <button onClick={() => handleAceptarAmistad(sol)} style={{ background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', color: 'white' }}>
                        <i className="ti ti-check"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {invitacionesRetos.length > 0 && (
            <div>
              <p className="detalle-seccion-titulo" style={{ marginBottom: '10px' }}>{t('amigos.invitacionesRetos')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {invitacionesRetos.map((inv, i) => (
                  <div key={inv.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', animation: `staggerIn 0.25s ease ${i * 0.04}s both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{inv.retos?.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p className="reto-titulo">{inv.retos?.titulo}</p>
                        <p className="reto-dias">{inv.retos?.dias} {t('amigos.dias')} · {t('amigos.de')} @{inv.perfiles?.username}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-principal" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'none' }} onClick={() => handleRechazarReto(inv)}>{t('amigos.rechazar')}</button>
                      <button className="btn-principal" onClick={() => handleAceptarReto(inv)}>{t('amigos.unirme')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {solicitudesReto.length > 0 && (
            <div>
              <p className="detalle-seccion-titulo" style={{ marginBottom: '10px' }}>{t('amigos.quierenUnirse')}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {solicitudesReto.map((sol, i) => (
                  <div key={sol.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', animation: `staggerIn 0.25s ease ${i * 0.04}s both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{sol.reto?.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p className="reto-titulo">{sol.reto?.titulo}</p>
                        <p className="reto-dias">@{sol.perfil?.username} {t('amigos.quiereUnirse')}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-principal" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'none' }} onClick={() => handleRechazarSolicitudReto(sol)}>{t('amigos.rechazar')}</button>
                      <button className="btn-principal" onClick={() => handleAceptarSolicitudReto(sol)}>{t('amigos.aceptar')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalPendientes === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <p className="empty-state-title">{t('amigos.sinSolicitudes')}</p>
              <p className="empty-state-text">{t('amigos.sinSolicitudesTexto')}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'amigos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {amigos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👋</div>
              <p className="empty-state-title">{t('amigos.sinAmigos')}</p>
              <p className="empty-state-text">{t('amigos.sinAmigosTexto')}</p>
            </div>
          ) : (
            amigos.map((amigo, i) => (
              <div key={i} className="config-fila" style={{ animation: `staggerIn 0.25s ease ${i * 0.04}s both` }} onClick={() => setAmigoSeleccionado(amigo.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="participante-avatar" style={{ overflow: 'hidden' }}>
                    {amigo.avatar_url
                      ? <img src={amigo.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : amigo.nombre?.charAt(0).toUpperCase()
                    }
                  </div>
                  <div>
                    <p className="reto-titulo">{amigo.nombre}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{amigo.username}</p>
                  </div>
                </div>
                <i className="ti ti-chevron-right" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'buscar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p className="detalle-seccion-titulo" style={{ marginBottom: '8px' }}>{t('amigos.añadirAmigo')}</p>
            <div style={{ position: 'relative' }}>
              <input
                className="input-reto"
                placeholder={t('amigos.buscarPlaceholder')}
                value={usernameSolicitar}
                onChange={e => handleBuscar(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              />
              {resultadosBusqueda.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {resultadosBusqueda.map((u, i) => (
                    <div key={u.id} className="config-fila" style={{ cursor: 'pointer', animation: `staggerIn 0.25s ease ${i * 0.04}s both` }} onClick={() => handleSolicitarDesdeResultado(u)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="participante-avatar" style={{ overflow: 'hidden' }}>
                          {u.avatar_url
                            ? <img src={u.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : u.nombre?.charAt(0).toUpperCase()
                          }
                        </div>
                        <div>
                          <p className="reto-titulo">{u.nombre}</p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{u.username}</p>
                        </div>
                      </div>
                      <button className="btn-añadir" style={{ width: '32px', height: '32px', fontSize: '14px' }}>
                        <i className="ti ti-user-plus"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {usernameSolicitar.length >= 2 && resultadosBusqueda.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', paddingLeft: '4px' }}>
                  {t('amigos.sinResultados')}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="detalle-seccion-titulo" style={{ marginBottom: '4px' }}>{t('amigos.tuUsername')}</p>
            <p className="guia-texto" style={{ fontSize: '13px', marginBottom: '12px' }}>{t('amigos.compartirUsername')}</p>
            <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--accent)', borderRadius: '14px', padding: '14px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>@{perfil?.username || '—'}</p>
            </div>
          </div>
        </div>
      )}

      {amigoSeleccionado && createPortal(
        <PerfilAmigo
          amigoId={amigoSeleccionado}
          onVolver={() => setAmigoSeleccionado(null)}
          retosUsuario={retosUsuario}
          onToast={onToast}
        />,
        document.body
      )}
    </div>
  )
}

export default Amigos