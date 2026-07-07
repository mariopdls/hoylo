import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cargarPerfilPublico, contarRetosCompletados, cargarRetosPublicosActivos } from '../services/perfilesPublicos'
import { cargarAmigosenComun, invitarAmigo } from '../services/social'
import { calcularRachaVigente } from '../services/racha'

function PerfilAmigo({ amigoId, onVolver, retosUsuario, onToast }) {
  const { t } = useTranslation()
  const [perfil, setPerfil] = useState(null)
  const [retosCount, setRetosCount] = useState(0)
  const [retosActivos, setRetosActivos] = useState([])
  const [amigosEnComun, setAmigosEnComun] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarInvitar, setMostrarInvitar] = useState(false)
  const [invitando, setInvitando] = useState(null)
  const [invitados, setInvitados] = useState(new Set())

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const [data, count, activos, enComun] = await Promise.all([
      cargarPerfilPublico(amigoId),
      contarRetosCompletados(amigoId),
      cargarRetosPublicosActivos(amigoId),
      cargarAmigosenComun(amigoId)
    ])
    setPerfil(data)
    setRetosCount(count)
    setRetosActivos(activos)
    setAmigosEnComun(enComun)
    setCargando(false)
  }

  const handleInvitar = async (retoId) => {
    setInvitando(retoId)
    const resultado = await invitarAmigo(retoId, perfil.username)
    if (resultado.error) {
      onToast?.(resultado.error, 'error')
    } else {
      setInvitados(prev => new Set(prev).add(retoId))
    }
    setInvitando(null)
  }

  const Wrapper = ({ children }) => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.28s ease-out', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <button className="btn-volver" onClick={onVolver}><i className="ti ti-arrow-left"></i></button>
        </div>
        {children}
      </div>
    </div>
  )

  if (cargando) return (
    <Wrapper>
      <div style={{ padding: '24px 20px' }}>
        <p className="guia-texto">{t('perfilAmigo.cargando')}</p>
      </div>
    </Wrapper>
  )

  if (!perfil || perfil.perfil_publico === false) return (
    <Wrapper>
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <p className="empty-state-title">{t('perfilAmigo.privado')}</p>
      </div>
    </Wrapper>
  )

  const circunferencia = 94
  const rachaVigente = calcularRachaVigente(perfil.racha_actual, perfil.racha_ultima_fecha)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.28s ease-out', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <button className="btn-volver" onClick={onVolver}><i className="ti ti-arrow-left"></i></button>
          <button
            className="btn-dias"
            style={{ fontSize: '12px' }}
            onClick={() => setMostrarInvitar(v => !v)}
          >
            <i className="ti ti-user-plus" style={{ marginRight: '4px' }}></i>
            Invitar a reto
          </button>
        </div>

        {/* Panel invitar */}
        {mostrarInvitar && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
            {!retosUsuario?.length ? (
              <p className="guia-texto" style={{ fontSize: '13px' }}>No tienes retos activos</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p className="detalle-seccion-titulo" style={{ marginBottom: '4px' }}>¿A cuál reto invitar?</p>
                {retosUsuario.map(reto => (
                  <div key={reto.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{reto.emoji}</span>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{reto.titulo}</p>
                    </div>
                    <button
                      className="btn-dias"
                      style={{
                        fontSize: '11px',
                        background: invitados.has(reto.id) ? 'var(--bg-secondary)' : 'var(--accent)',
                        color: invitados.has(reto.id) ? 'var(--text-secondary)' : 'white',
                        border: 'none', flexShrink: 0
                      }}
                      disabled={invitados.has(reto.id) || invitando === reto.id}
                      onClick={() => handleInvitar(reto.id)}
                    >
                      {invitados.has(reto.id) ? '✓ Enviado' : invitando === reto.id ? '...' : 'Invitar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contenido scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Avatar + nombre + bio */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%',
              background: perfil.avatar_url ? 'transparent' : 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '36px', color: 'white', fontWeight: '700', overflow: 'hidden',
              boxShadow: 'var(--shadow-md)'
            }}>
              {perfil.avatar_url
                ? <img src={perfil.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : perfil.nombre?.charAt(0).toUpperCase() || '?'
              }
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>{perfil.nombre}</h2>
              <p className="reto-dias">@{perfil.username}</p>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', maxWidth: '280px', lineHeight: '1.5' }}>
              "{perfil.bio || '¡Hola! Estoy utilizando Hoylo'}"
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', boxShadow: 'var(--shadow-xs)', minWidth: '80px' }}>
              <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>{retosCount}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('perfilAmigo.retos')}</p>
            </div>
            {rachaVigente > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', boxShadow: 'var(--shadow-xs)', minWidth: '80px' }}>
                <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>🔥 {rachaVigente}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Racha actual</p>
              </div>
            )}
            {perfil.mejor_racha > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', boxShadow: 'var(--shadow-xs)', minWidth: '80px' }}>
                <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>⭐ {perfil.mejor_racha}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Mejor racha</p>
              </div>
            )}
          </div>

          {/* Amigos en común */}
          {amigosEnComun.length > 0 && (
            <div>
              <p className="detalle-seccion-titulo" style={{ marginBottom: '10px' }}>
                {amigosEnComun.length} amigo{amigosEnComun.length > 1 ? 's' : ''} en común
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {amigosEnComun.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-secondary)', borderRadius: '20px', padding: '4px 10px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'white', fontWeight: '700', overflow: 'hidden', flexShrink: 0 }}>
                      {a.avatar_url
                        ? <img src={a.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : a.nombre?.charAt(0).toUpperCase()
                      }
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>{a.nombre}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retos públicos activos */}
          {retosActivos.length > 0 && (
            <div>
              <p className="detalle-seccion-titulo" style={{ marginBottom: '10px' }}>Retos activos</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {retosActivos.map((reto, i) => {
                  const progreso = Math.round((reto.dias_completados / reto.dias) * 100)
                  const dash = Math.round((progreso / 100) * circunferencia)
                  return (
                    <div key={reto.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow-xs)', animation: `staggerIn 0.25s ease ${i * 0.05}s both` }}>
                      <span style={{ fontSize: '28px' }}>{reto.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{reto.titulo}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Día {reto.dias_completados} de {reto.dias}</p>
                      </div>
                      <svg width="40" height="40" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
                        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3"/>
                        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--accent)" strokeWidth="3"
                          strokeDasharray={`${dash} ${circunferencia}`}
                          strokeLinecap="round" transform="rotate(-90 18 18)"
                        />
                        <text x="18" y="21" textAnchor="middle" fontSize="8" fill="var(--text-muted)">{progreso}%</text>
                      </svg>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Ubicación */}
          {(perfil.ciudad || perfil.pais) && (
            <div>
              <p className="detalle-seccion-titulo">{t('perfilAmigo.ubicacion')}</p>
              <p className="reto-titulo">
                <i className="ti ti-map-pin" style={{ fontSize: '14px', marginRight: '6px', color: 'var(--text-muted)' }}></i>
                {[perfil.ciudad, perfil.pais].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          {/* Aficiones */}
          {perfil.aficiones?.length > 0 && (
            <div>
              <p className="detalle-seccion-titulo">{t('perfilAmigo.aficiones')}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {perfil.aficiones.map(a => (
                  <span key={a} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: 'var(--text-primary)' }}>{a}</span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default PerfilAmigo