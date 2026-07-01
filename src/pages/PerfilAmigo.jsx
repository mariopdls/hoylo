import { useState, useEffect } from 'react'
import { cargarPerfilPublico, contarRetosCompletados } from '../services/perfilesPublicos'

function PerfilAmigo({ amigoId, onVolver }) {
  const [perfil, setPerfil] = useState(null)
  const [retosCount, setRetosCount] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const data = await cargarPerfilPublico(amigoId)
    setPerfil(data)
    const count = await contarRetosCompletados(amigoId)
    setRetosCount(count)
    setCargando(false)
  }

  if (cargando) return (
    <div className="detalle-screen" style={{ animation: 'slideInRight 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div className="detalle-header">
        <button className="btn-volver" onClick={onVolver}>
          <i className="ti ti-arrow-left"></i>
        </button>
      </div>
      <div className="detalle-contenido">
        <p className="guia-texto">Cargando...</p>
      </div>
    </div>
  )

  if (!perfil || perfil.perfil_publico === false) return (
    <div className="detalle-screen" style={{ animation: 'slideInRight 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div className="detalle-header">
        <button className="btn-volver" onClick={onVolver}>
          <i className="ti ti-arrow-left"></i>
        </button>
      </div>
      <div className="detalle-contenido">
        <p className="guia-texto">Este perfil es privado</p>
      </div>
    </div>
  )

  return (
    <div className="detalle-screen" style={{ animation: 'slideInRight 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div className="detalle-header">
        <button className="btn-volver" onClick={onVolver}>
          <i className="ti ti-arrow-left"></i>
        </button>
        <div style={{ width: '36px' }} />
      </div>

      <div className="detalle-contenido">

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '90px', height: '90px', borderRadius: '50%',
            background: perfil.avatar_url ? 'transparent' : 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', color: 'white', fontWeight: '700', overflow: 'hidden'
          }}>
            {perfil.avatar_url ? (
              <img src={perfil.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              perfil.nombre?.charAt(0).toUpperCase() || '?'
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 className="detalle-titulo" style={{ justifyContent: 'center' }}>{perfil.nombre}</h2>
            <p className="reto-dias">@{perfil.username}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '8px' }}>
          <div style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border)',
            borderRadius: '12px', padding: '12px 20px', textAlign: 'center'
          }}>
            <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>{retosCount}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>retos</p>
          </div>
        </div>

        {(perfil.ciudad || perfil.pais) && (
          <div className="detalle-seccion">
            <p className="detalle-seccion-titulo">Ubicación</p>
            <p className="reto-titulo">
              <i className="ti ti-map-pin" style={{ fontSize: '14px', marginRight: '6px', color: 'var(--text-muted)' }}></i>
              {[perfil.ciudad, perfil.pais].filter(Boolean).join(', ')}
            </p>
          </div>
        )}

        {perfil.aficiones?.length > 0 && (
          <div className="detalle-seccion">
            <p className="detalle-seccion-titulo">Aficiones</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {perfil.aficiones.map(a => (
                <span key={a} style={{
                  background: 'var(--bg-secondary)', border: '0.5px solid var(--border)',
                  borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: 'var(--text-primary)'
                }}>{a}</span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default PerfilAmigo