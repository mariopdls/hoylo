import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'
import {
  cargarInvitacionesPendientes, aceptarInvitacion, rechazarInvitacion,
  enviarSolicitudAmistad, cargarSolicitudesPendientes,
  aceptarSolicitudAmistad, rechazarSolicitudAmistad, cargarAmigos,
  cargarSolicitudesReto, aceptarSolicitudReto, rechazarSolicitudReto,
  buscarUsuarios
} from '../services/social'
import PerfilAmigo from './PerfilAmigo'

function Amigos({ usuario, onRecargarRetos, onRecargarNotificaciones }) {
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
  const [mensaje, setMensaje] = useState(null)
  const [amigoSeleccionado, setAmigoSeleccionado] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const { data } = await supabase
      .from('perfiles')
      .select('username, nombre')
      .eq('id', usuario.id)
      .maybeSingle()

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
    await aceptarInvitacion(inv.id, inv.reto_id, usuario.id)
    setInvitacionesRetos(prev => prev.filter(i => i.id !== inv.id))
    onRecargarRetos()
    onRecargarNotificaciones?.()
  }

  const handleRechazarReto = async (inv) => {
    await rechazarInvitacion(inv.id)
    setInvitacionesRetos(prev => prev.filter(i => i.id !== inv.id))
    onRecargarNotificaciones?.()
  }

  const handleAceptarAmistad = async (sol) => {
    await aceptarSolicitudAmistad(sol.id, sol.de_usuario_id)
    setSolicitudesAmistad(prev => prev.filter(s => s.id !== sol.id))
    const amigosLista = await cargarAmigos()
    setAmigos(amigosLista)
    onRecargarNotificaciones?.()
  }

  const handleRechazarAmistad = async (sol) => {
    await rechazarSolicitudAmistad(sol.id)
    setSolicitudesAmistad(prev => prev.filter(s => s.id !== sol.id))
    onRecargarNotificaciones?.()
  }

  const handleAceptarSolicitudReto = async (sol) => {
    await aceptarSolicitudReto(sol.id, sol.reto_id, sol.usuario_id)
    setSolicitudesReto(prev => prev.filter(s => s.id !== sol.id))
    onRecargarRetos()
    onRecargarNotificaciones?.()
  }

  const handleRechazarSolicitudReto = async (sol) => {
    await rechazarSolicitudReto(sol.id)
    setSolicitudesReto(prev => prev.filter(s => s.id !== sol.id))
    onRecargarNotificaciones?.()
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
    if (resultado.error) {
      setMensaje({ tipo: 'error', texto: resultado.error })
    } else {
      setMensaje({ tipo: 'ok', texto: 'Solicitud enviada' })
      setUsernameSolicitar('')
      setResultadosBusqueda([])
    }
    setTimeout(() => setMensaje(null), 3000)
  }

  const totalPendientes = invitacionesRetos.length + solicitudesAmistad.length + solicitudesReto.length

  if (amigoSeleccionado) {
    return (
      <PerfilAmigo
        amigoId={amigoSeleccionado}
        onVolver={() => setAmigoSeleccionado(null)}
      />
    )
  }

  if (cargando) return (
    <div style={{ padding: '20px' }}>
      <p className="guia-texto">Cargando...</p>
    </div>
  )

  return (
    <div style={{ paddingBottom: '20px' }}>
      <p className="guia-intro" style={{ marginBottom: '16px' }}>Amigos</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          className={`btn-dias ${tab === 'solicitudes' ? 'btn-dias-activo' : ''}`}
          onClick={() => setTab('solicitudes')}
          style={{ position: 'relative' }}
        >
          Solicitudes {totalPendientes > 0 && `(${totalPendientes})`}
        </button>
        <button
          className={`btn-dias ${tab === 'amigos' ? 'btn-dias-activo' : ''}`}
          onClick={() => setTab('amigos')}
        >
          Amigos ({amigos.length})
        </button>
        <button
          className={`btn-dias ${tab === 'buscar' ? 'btn-dias-activo' : ''}`}
          onClick={() => setTab('buscar')}
        >
          Añadir
        </button>
      </div>

      {tab === 'solicitudes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {solicitudesAmistad.length > 0 && (
            <div>
              <p className="detalle-seccion-titulo" style={{ marginBottom: '10px' }}>Solicitudes de amistad</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {solicitudesAmistad.map((sol, i) => (
                  <div key={sol.id} className="config-fila" style={{ cursor: 'default', animation: `staggerIn 0.25s ease ${i * 0.04}s both` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="participante-avatar">
                        {sol.perfil?.nombre?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="reto-titulo">{sol.perfil?.nombre}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{sol.perfil?.username}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleRechazarAmistad(sol)}
                        style={{ background: 'var(--bg-secondary)', border: '0.5px solid var(--border)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}
                      >
                        <i className="ti ti-x"></i>
                      </button>
                      <button
                        onClick={() => handleAceptarAmistad(sol)}
                        style={{ background: 'var(--accent)', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', color: 'white' }}
                      >
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
              <p className="detalle-seccion-titulo" style={{ marginBottom: '10px' }}>Invitaciones a retos</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {invitacionesRetos.map((inv, i) => (
                  <div key={inv.id} style={{
                    background: 'var(--bg-card)', border: '0.5px solid var(--border)',
                    borderRadius: '14px', padding: '14px 16px',
                    animation: `staggerIn 0.25s ease ${i * 0.04}s both`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{inv.retos?.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p className="reto-titulo">{inv.retos?.titulo}</p>
                        <p className="reto-dias">{inv.retos?.dias} días · de @{inv.perfiles?.username}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-principal"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '0.5px solid var(--border)' }}
                        onClick={() => handleRechazarReto(inv)}
                      >
                        Rechazar
                      </button>
                      <button className="btn-principal" onClick={() => handleAceptarReto(inv)}>
                        Unirme
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {solicitudesReto.length > 0 && (
            <div>
              <p className="detalle-seccion-titulo" style={{ marginBottom: '10px' }}>Quieren unirse a tus retos</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {solicitudesReto.map((sol, i) => (
                  <div key={sol.id} style={{
                    background: 'var(--bg-card)', border: '0.5px solid var(--border)',
                    borderRadius: '14px', padding: '14px 16px',
                    animation: `staggerIn 0.25s ease ${i * 0.04}s both`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{sol.reto?.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p className="reto-titulo">{sol.reto?.titulo}</p>
                        <p className="reto-dias">@{sol.perfil?.username} quiere unirse</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-principal"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '0.5px solid var(--border)' }}
                        onClick={() => handleRechazarSolicitudReto(sol)}
                      >
                        Rechazar
                      </button>
                      <button className="btn-principal" onClick={() => handleAceptarSolicitudReto(sol)}>
                        Aceptar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalPendientes === 0 && (
            <div style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--border)',
              borderRadius: '14px', padding: '20px', textAlign: 'center'
            }}>
              <p className="guia-texto" style={{ fontSize: '13px' }}>No tienes solicitudes pendientes</p>
            </div>
          )}
        </div>
      )}

      {tab === 'amigos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {amigos.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--border)',
              borderRadius: '14px', padding: '20px', textAlign: 'center'
            }}>
              <p className="guia-texto" style={{ fontSize: '13px' }}>Aún no tienes amigos en Hoylo</p>
            </div>
          ) : (
            amigos.map((amigo, i) => (
              <div
                key={i}
                className="config-fila"
                style={{ animation: `staggerIn 0.25s ease ${i * 0.04}s both` }}
                onClick={() => setAmigoSeleccionado(amigo.id)}
              >
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
            <p className="detalle-seccion-titulo" style={{ marginBottom: '8px' }}>Añadir amigo</p>
            <div style={{ position: 'relative' }}>
              <input
                className="input-reto"
                placeholder="Busca por username..."
                value={usernameSolicitar}
                onChange={e => handleBuscar(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              />
              {resultadosBusqueda.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {resultadosBusqueda.map((u, i) => (
                    <div
                      key={u.id}
                      className="config-fila"
                      style={{ cursor: 'default', animation: `staggerIn 0.25s ease ${i * 0.04}s both` }}
                    >
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
                      <button
                        className="btn-añadir"
                        style={{ width: '32px', height: '32px', fontSize: '14px' }}
                        onClick={() => handleSolicitarDesdeResultado(u)}
                      >
                        <i className="ti ti-user-plus"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {usernameSolicitar.length >= 2 && resultadosBusqueda.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', paddingLeft: '4px' }}>
                  No se encontraron usuarios con ese nombre
                </p>
              )}
            </div>
            {mensaje && (
              <p style={{ fontSize: '12px', color: mensaje.tipo === 'ok' ? '#3B6D11' : '#E24B4A', marginTop: '6px', paddingLeft: '4px' }}>
                {mensaje.texto}
              </p>
            )}
          </div>

          <div>
            <p className="detalle-seccion-titulo" style={{ marginBottom: '4px' }}>Tu username</p>
            <p className="guia-texto" style={{ fontSize: '13px', marginBottom: '12px' }}>
              Comparte tu username para que tus amigos puedan añadirte.
            </p>
            <div style={{
              background: 'var(--bg-card)', border: '1.5px solid var(--accent)',
              borderRadius: '14px', padding: '14px 16px', textAlign: 'center'
            }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>
                @{perfil?.username || '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Amigos