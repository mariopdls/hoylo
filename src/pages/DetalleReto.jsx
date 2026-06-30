import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { actualizarTituloReto, completarDia } from '../services/retos'
import { subirFoto } from '../services/cloudinary'
import { cargarParticipantes, invitarAmigo } from '../services/social'
import { supabase } from '../services/supabase'

function CarruselFotos({ participantes }) {
  const [indice, setIndice] = useState(0)
  const startX = useRef(null)

  const conFoto = participantes.filter(p => p.foto_url)
  if (conFoto.length === 0) return null

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e) => {
    if (!startX.current) return
    const diff = startX.current - e.changedTouches[0].clientX
    if (diff > 50 && indice < conFoto.length - 1) setIndice(i => i + 1)
    if (diff < -50 && indice > 0) setIndice(i => i - 1)
    startX.current = null
  }

  const actual = conFoto[indice]

  return (
    <div
      style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '12px', position: 'relative' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div style={{
        display: 'flex',
        transform: `translateX(-${indice * 100}%)`,
        transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform'
      }}>
        {conFoto.map((p, i) => (
          <div key={i} style={{ minWidth: '100%', position: 'relative' }}>
            <img
              src={p.foto_url}
              alt="foto"
              style={{ width: '100%', objectFit: 'cover', maxHeight: '220px', display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.5))',
              padding: '12px 14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '12px', color: 'white', fontWeight: '700'
                }}>
                  {p.perfiles?.nombre?.charAt(0).toUpperCase() || '?'}
                </div>
                <p style={{ fontSize: '13px', color: 'white', fontWeight: '500' }}>
                  {p.perfiles?.nombre || p.perfiles?.username || 'Usuario'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {conFoto.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '10px', right: '14px',
          display: 'flex', gap: '4px'
        }}>
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

function DetalleReto({ reto, onVolver, onActualizar }) {
  const { t } = useTranslation()
  const [editandoTitulo, setEditandoTitulo] = useState(false)
  const [titulo, setTitulo] = useState(reto.titulo)
  const [fotoSubida, setFotoSubida] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [progresoActual, setProgresoActual] = useState(reto.dias_completados || 0)
  const [participantes, setParticipantes] = useState([])
  const [mostrarInvitar, setMostrarInvitar] = useState(false)
  const [usernameInvitar, setUsernameInvitar] = useState('')
  const [mensajeInvitacion, setMensajeInvitacion] = useState(null)
  const [usuarioActual, setUsuarioActual] = useState(null)
  const inputFotoRef = useRef(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUsuarioActual(user)
    const data = await cargarParticipantes(reto.id)
    setParticipantes(data)

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
      await cargarDatos()
    } catch (err) {
      console.error('Error subiendo foto:', err)
    }
    setSubiendo(false)
  }

  const handleInvitar = async () => {
    if (!usernameInvitar.trim()) return
    const resultado = await invitarAmigo(reto.id, usernameInvitar.trim())
    if (resultado.error) {
      setMensajeInvitacion({ tipo: 'error', texto: resultado.error })
    } else {
      setMensajeInvitacion({ tipo: 'ok', texto: 'Invitación enviada' })
      setUsernameInvitar('')
    }
    setTimeout(() => setMensajeInvitacion(null), 3000)
  }

  const progreso = Math.round((progresoActual / reto.dias) * 100)
  const circunferencia = 94
  const yaSubioFoto = fotoSubida || reto.foto_hoy

  return (
    <div className="detalle-screen">
      <div className="detalle-header">
        <button className="btn-volver" onClick={onVolver}>
          <i className="ti ti-arrow-left"></i>
        </button>
        <span className="reto-emoji" style={{ fontSize: '28px' }}>{reto.emoji}</span>
        <div style={{ width: '36px' }} />
      </div>

      <div className="detalle-contenido">
        <div className="detalle-titulo-wrap" onClick={() => !editandoTitulo && setEditandoTitulo(true)}>
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
          <p className="reto-dias">{t('detalle.dia')} {reto.dia_actual || 1} {t('detalle.de')} {reto.dias}</p>
        </div>

        <div className="detalle-progreso-grande">
          <svg
            width="100" height="100" viewBox="0 0 36 36"
            style={{ animation: fotoSubida ? 'bounce 0.6s ease 0.8s' : 'none' }}
          >
            <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border)" strokeWidth="3"/>
            <circle
              cx="18" cy="18" r="15"
              fill="none" stroke="var(--accent)" strokeWidth="3"
              strokeDasharray={`${progreso / 100 * circunferencia} ${circunferencia}`}
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
              style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            />
            <text x="18" y="21" textAnchor="middle" fontSize="8" fill="var(--text-muted)">{progreso}%</text>
          </svg>
          <p className="guia-texto" style={{ fontSize: '13px' }}>{t('detalle.completado')}</p>
        </div>

        <CarruselFotos participantes={participantes} />

        <div className="detalle-seccion">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <p className="detalle-seccion-titulo">{t('detalle.participantes')}</p>
            <button className="header-icon" onClick={() => setMostrarInvitar(v => !v)} aria-label="Invitar">
              <i className="ti ti-user-plus"></i>
            </button>
          </div>

          {mostrarInvitar && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="input-reto"
                  placeholder="@username"
                  value={usernameInvitar}
                  onChange={e => setUsernameInvitar(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  onKeyDown={e => { if (e.key === 'Enter') handleInvitar() }}
                />
                <button className="btn-añadir" onClick={handleInvitar}>
                  <i className="ti ti-send"></i>
                </button>
              </div>
              {mensajeInvitacion && (
                <p style={{ fontSize: '12px', color: mensajeInvitacion.tipo === 'ok' ? '#3B6D11' : '#E24B4A', paddingLeft: '4px' }}>
                  {mensajeInvitacion.texto}
                </p>
              )}
            </div>
          )}

          <div className="participantes-lista">
            {participantes.map((p, i) => (
              <div key={i} className="participante-item">
                <div className="participante-avatar">
                  {p.perfiles?.nombre ? p.perfiles.nombre.charAt(0).toUpperCase() : '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="participante-nombre">{p.perfiles?.nombre || p.perfiles?.username || 'Usuario'}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {p.dias_completados || 0} días completados
                  </p>
                </div>
                {p.foto_hoy
                  ? <i className="ti ti-circle-check" style={{ color: '#3B6D11', fontSize: '20px' }}></i>
                  : <i className="ti ti-circle" style={{ color: 'var(--border)', fontSize: '20px' }}></i>
                }
              </div>
            ))}
          </div>
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
          {subiendo ? '⏳ Subiendo...' : yaSubioFoto ? t('detalle.fotoSubida') : t('detalle.subirFoto')}
        </button>
      </div>
    </div>
  )
}

export default DetalleReto