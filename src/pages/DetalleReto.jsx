import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { actualizarTituloReto, completarDia } from '../services/retos'
import { subirFoto } from '../services/cloudinary'
import { cargarParticipantes, invitarAmigo } from '../services/social'
import { cargarComentarios, enviarComentario, eliminarComentario } from '../services/comentarios'
import { supabase } from '../services/supabase'

function CarruselFotos({ participantes }) {
  const [indice, setIndice] = useState(0)
  const startX = useRef(null)
  const containerRef = useRef(null)

  const conFoto = participantes.filter(p => p.foto_url)
  if (conFoto.length === 0) return null

  const onTouchStart = (e) => { startX.current = e.touches[0].clientX }

  const onTouchEnd = (e) => {
    if (!startX.current) return
    const diff = startX.current - e.changedTouches[0].clientX
    if (diff > 50 && indice < conFoto.length - 1) setIndice(i => i + 1)
    if (diff < -50 && indice > 0) setIndice(i => i - 1)
    startX.current = null
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        height: '220px',
        borderRadius: '14px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-secondary)',
        flexShrink: 0
      }}
    >
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        transform: `translateX(-${indice * 100}%)`,
        transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform'
      }}>
        {conFoto.map((p, i) => (
          <div key={i} style={{ width: '100%', height: '100%', minWidth: '100%', flexShrink: 0, position: 'relative' }}>
            <img
              src={p.foto_url}
              alt="foto"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
              padding: '24px 14px 12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '11px', color: 'white', fontWeight: '700',
                  flexShrink: 0, overflow: 'hidden'
                }}>
                  {p.perfiles?.avatar_url
                    ? <img src={p.perfiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : p.perfiles?.nombre?.charAt(0).toUpperCase() || '?'
                  }
                </div>
                <p style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>
                  {p.perfiles?.nombre || p.perfiles?.username || 'Usuario'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {conFoto.length > 1 && (
        <div style={{ position: 'absolute', bottom: '10px', right: '12px', display: 'flex', gap: '4px' }}>
          {conFoto.map((_, i) => (
            <div
              key={i}
              onClick={() => setIndice(i)}
              style={{
                width: i === indice ? '16px' : '6px', height: '6px',
                borderRadius: '3px', background: 'white',
                opacity: i === indice ? 1 : 0.5,
                transition: 'all 0.3s ease', cursor: 'pointer'
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function DetalleReto({ reto, onVolver, onActualizar, onToast }) {
  const { t } = useTranslation()
  const [editandoTitulo, setEditandoTitulo] = useState(false)
  const [titulo, setTitulo] = useState(reto.titulo)
  const [fotoSubida, setFotoSubida] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [progresoActual, setProgresoActual] = useState(reto.dias_completados || 0)
  const [participantes, setParticipantes] = useState([])
  const [mostrarInvitar, setMostrarInvitar] = useState(false)
  const [usernameInvitar, setUsernameInvitar] = useState('')
  const [usuarioActualId, setUsuarioActualId] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const inputFotoRef = useRef(null)

  useEffect(() => {
    cargarDatos()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUsuarioActualId(user.id)
    const data = await cargarParticipantes(reto.id)
    setParticipantes(data)
    const coms = await cargarComentarios(reto.id)
    setComentarios(coms)
    const miParticipacion = data.find(p => p.usuario_id === user?.id)
    if (miParticipacion?.foto_hoy) setFotoSubida(true)
    if (miParticipacion?.dias_completados) setProgresoActual(miParticipacion.dias_completados)
  }

  const handleTituloBlur = async () => {
    setEditandoTitulo(false)
    await actualizarTituloReto(reto.id, titulo)
    onActualizar({ ...reto, titulo })
  }

  const handleFoto = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return
    setSubiendo(true)
    try {
      const url = await subirFoto(archivo)
      setFotoSubida(true)
      await completarDia(reto.id, url)
      const nuevoDiasCompletados = progresoActual + 1
      setProgresoActual(nuevoDiasCompletados)
      onActualizar({ ...reto, dias_completados: nuevoDiasCompletados, foto_hoy: true })
      onToast?.(t('toast.fotoSubida'))
      await cargarDatos()
    } catch (err) {
      onToast?.(t('toast.errorFoto'), 'error')
    }
    setSubiendo(false)
  }

  const handleInvitar = async () => {
    if (!usernameInvitar.trim()) return
    const resultado = await invitarAmigo(reto.id, usernameInvitar.trim())
    onToast?.(resultado.error || t('toast.invitacionEnviada'), resultado.error ? 'error' : 'ok')
    if (!resultado.error) {
      setUsernameInvitar('')
      setMostrarInvitar(false)
    }
  }

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim()) return
    const resultado = await enviarComentario(reto.id, nuevoComentario)
    if (!resultado.error) {
      setNuevoComentario('')
      const coms = await cargarComentarios(reto.id)
      setComentarios(coms)
    } else {
      onToast?.(t('toast.errorComentario'), 'error')
    }
  }

  const handleEliminarComentario = async (comentarioId) => {
    await eliminarComentario(comentarioId)
    setComentarios(prev => prev.filter(c => c.id !== comentarioId))
  }

  const progreso = Math.round((progresoActual / reto.dias) * 100)
  const circunferencia = 94
  const yaSubioFoto = fotoSubida || reto.foto_hoy

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '420px',
      height: '100dvh',
      background: 'var(--bg-primary)',
      zIndex: 999,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideInRight 0.28s ease-out'
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-primary)', flexShrink: 0
      }}>
        <button className="btn-volver" onClick={onVolver}>
          <i className="ti ti-arrow-left"></i>
        </button>
        <span style={{ fontSize: '28px' }}>{reto.emoji}</span>
        <div style={{ width: '38px' }} />
      </div>

      {/* Contenido scrollable */}
      <div style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '24px 20px 24px',
        display: 'flex', flexDirection: 'column',
        gap: '24px', WebkitOverflowScrolling: 'touch'
      }}>
        {/* Título */}
        <div style={{ cursor: 'pointer' }} onClick={() => !editandoTitulo && setEditandoTitulo(true)}>
          {editandoTitulo ? (
            <input
              className="detalle-titulo-input"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              onBlur={handleTituloBlur}
              onKeyDown={e => { if (e.key === 'Enter') handleTituloBlur() }}
              autoFocus
            />
          ) : (
            <h2 className="detalle-titulo">
              {titulo}
              <i className="ti ti-pencil" style={{ fontSize: '14px', marginLeft: '8px', color: 'var(--text-muted)' }}></i>
            </h2>
          )}
          <p className="reto-dias" style={{ marginTop: '4px' }}>
            {t('detalle.dia')} {reto.dia_actual || 1} {t('detalle.de')} {reto.dias}
          </p>
        </div>

        {/* Progreso */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <svg
            width="100" height="100" viewBox="0 0 36 36"
            style={{ animation: fotoSubida ? 'bounce 0.6s ease 0.8s' : 'none', flexShrink: 0 }}
          >
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3"/>
            <circle
              cx="18" cy="18" r="15" fill="none" stroke="var(--accent)" strokeWidth="3"
              strokeDasharray={`${progreso / 100 * circunferencia} ${circunferencia}`}
              strokeLinecap="round" transform="rotate(-90 18 18)"
              style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            />
            <text x="18" y="21" textAnchor="middle" fontSize="8" fill="var(--text-muted)">{progreso}%</text>
          </svg>
          <p className="guia-texto" style={{ fontSize: '13px' }}>{t('detalle.completado')}</p>
        </div>

        {/* Carrusel */}
        <CarruselFotos participantes={participantes} />

        {/* Participantes */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p className="detalle-seccion-titulo">{t('detalle.participantes')}</p>
            <button className="header-icon" onClick={() => setMostrarInvitar(v => !v)} aria-label="Invitar">
              <i className="ti ti-user-plus"></i>
            </button>
          </div>

          {mostrarInvitar && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                className="input-reto"
                placeholder="@username"
                value={usernameInvitar}
                onChange={e => setUsernameInvitar(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                onKeyDown={e => { if (e.key === 'Enter') handleInvitar() }}
              />
              <button className="btn-añadir" onClick={handleInvitar}>
                <i className="ti ti-send"></i>
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {participantes.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="participante-avatar" style={{ overflow: 'hidden' }}>
                  {p.perfiles?.avatar_url
                    ? <img src={p.perfiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : p.perfiles?.nombre?.charAt(0).toUpperCase() || '?'
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p className="participante-nombre">{p.perfiles?.nombre || p.perfiles?.username || 'Usuario'}</p>
                </div>
                {p.foto_hoy
                  ? <i className="ti ti-circle-check" style={{ color: '#3B6D11', fontSize: '20px' }}></i>
                  : <i className="ti ti-circle" style={{ color: 'var(--border)', fontSize: '20px' }}></i>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Comentarios — solo la lista */}
        <div>
          <p className="detalle-seccion-titulo">{t('detalle.comentarios')}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {comentarios.length === 0 ? (
              <p className="guia-texto" style={{ fontSize: '13px' }}>{t('detalle.primerComentario')}</p>
            ) : (
              comentarios.map((c, i) => (
                <div key={c.id} style={{ display: 'flex', gap: '8px', animation: `staggerIn 0.25s ease ${i * 0.03}s both` }}>
                  <div className="participante-avatar" style={{ width: '28px', height: '28px', fontSize: '11px', flexShrink: 0, overflow: 'hidden' }}>
                    {c.perfil?.avatar_url
                      ? <img src={c.perfil.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : c.perfil?.nombre?.charAt(0).toUpperCase() || '?'
                    }
                  </div>
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '8px 12px', flex: 1 }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {c.perfil?.nombre || c.perfil?.username}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px' }}>{c.texto}</p>
                  </div>
                  {c.usuario_id === usuarioActualId && (
                    <button
                      onClick={() => handleEliminarComentario(c.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px', alignSelf: 'center' }}
                    >
                      <i className="ti ti-x"></i>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer fijo */}
      <div style={{
        padding: '10px 20px',
        paddingBottom: 'calc(90px + env(safe-area-inset-bottom))',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-primary)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            className="input-reto"
            placeholder={t('detalle.placeholderComentario')}
            value={nuevoComentario}
            onChange={e => setNuevoComentario(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleEnviarComentario() }}
          />
          <button className="btn-añadir" onClick={handleEnviarComentario}>
            <i className="ti ti-send"></i>
          </button>
        </div>

        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={inputFotoRef}
          style={{ display: 'none' }}
          onChange={handleFoto}
        />
        <button
          className="btn-principal"
          style={{ opacity: yaSubioFoto ? 0.5 : 1, cursor: yaSubioFoto || subiendo ? 'not-allowed' : 'pointer' }}
          disabled={yaSubioFoto || subiendo}
          onClick={() => inputFotoRef.current.click()}
        >
          {subiendo ? '⏳' : yaSubioFoto ? t('detalle.fotoSubida') : t('detalle.subirFoto')}
        </button>
      </div>
    </div>
  )
}

export default DetalleReto