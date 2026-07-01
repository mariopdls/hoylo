import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cargarPerfilPublico, contarRetosCompletados } from '../services/perfilesPublicos'

function PerfilAmigo({ amigoId, onVolver }) {
  const { t } = useTranslation()
  const [perfil, setPerfil] = useState(null)
  const [retosCount, setRetosCount] = useState(0)
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const data = await cargarPerfilPublico(amigoId)
    setPerfil(data)
    const count = await contarRetosCompletados(amigoId)
    setRetosCount(count)
    setCargando(false)
  }

  if (cargando) return (
    <div className="detalle-screen" style={{ animation: 'slideInRight 0.28s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <button className="btn-volver" onClick={onVolver}><i className="ti ti-arrow-left"></i></button>
      </div>
      <div style={{ padding: '24px 20px' }}><p className="guia-texto">{t('perfilAmigo.cargando')}</p></div>
    </div>
  )

  if (!perfil || perfil.perfil_publico === false) return (
    <div className="detalle-screen" style={{ animation: 'slideInRight 0.28s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <button className="btn-volver" onClick={onVolver}><i className="ti ti-arrow-left"></i></button>
      </div>
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <p className="empty-state-title">{t('perfilAmigo.privado')}</p>
      </div>
    </div>
  )

  return (
    <div className="detalle-screen" style={{ animation: 'slideInRight 0.28s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <button className="btn-volver" onClick={onVolver}><i className="ti ti-arrow-left"></i></button>
        <div style={{ width: '38px' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <h2 className="detalle-titulo" style={{ justifyContent: 'center' }}>{perfil.nombre}</h2>
            <p className="reto-dias">@{perfil.username}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 20px', textAlign: 'center', boxShadow: 'var(--shadow-xs)' }}>
            <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>{retosCount}</p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t('perfilAmigo.retos')}</p>
          </div>
        </div>

        {(perfil.ciudad || perfil.pais) && (
          <div>
            <p className="detalle-seccion-titulo">{t('perfilAmigo.ubicacion')}</p>
            <p className="reto-titulo">
              <i className="ti ti-map-pin" style={{ fontSize: '14px', marginRight: '6px', color: 'var(--text-muted)' }}></i>
              {[perfil.ciudad, perfil.pais].filter(Boolean).join(', ')}
            </p>
          </div>
        )}

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
  )
}

export default PerfilAmigo