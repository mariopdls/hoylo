import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'
import { subirFoto } from '../services/cloudinary'

const AFICIONES_ES = ['🎵 Música', '📚 Lectura', '🏃 Deporte', '🎨 Arte', '🎮 Videojuegos', '🍳 Cocina', '✈️ Viajes', '🌱 Naturaleza', '💻 Tecnología', '🎬 Cine', '🧘 Meditación', '📷 Fotografía']
const AFICIONES_EN = ['🎵 Music', '📚 Reading', '🏃 Sport', '🎨 Art', '🎮 Video games', '🍳 Cooking', '✈️ Travel', '🌱 Nature', '💻 Technology', '🎬 Cinema', '🧘 Meditation', '📷 Photography']

function Perfil({ usuario, onToast }) {
  const { t, i18n } = useTranslation()
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [nuevaAficion, setNuevaAficion] = useState('')
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const inputFotoRef = useRef(null)
  const [perfil, setPerfil] = useState({
    nombre: '', username: '', fecha_nacimiento: '',
    sexo: '', ciudad: '', pais: '', aficiones: [], avatar_url: ''
  })

  const aficionesBase = i18n.language === 'es' ? AFICIONES_ES : AFICIONES_EN

  useEffect(() => { cargarPerfil() }, [])

  const cargarPerfil = async () => {
    const { data } = await supabase.from('perfiles').select('*').eq('id', usuario.id).maybeSingle()
    if (data) setPerfil(data)
    setCargando(false)
  }

  const guardarPerfil = async () => {
  setGuardando(true)
  await supabase.from('perfiles').upsert({ ...perfil, id: usuario.id }, { onConflict: 'id' })
  setGuardando(false)
  setEditando(false)
  onToast?.(t('toast.perfilGuardado'))
  }

const handleFotoPerfil = async (e) => {
  const archivo = e.target.files[0]
  if (!archivo) return
  setSubiendoFoto(true)
  try {
    const url = await subirFoto(archivo)
    setPerfil(p => ({ ...p, avatar_url: url }))
    await supabase.from('perfiles').update({ avatar_url: url }).eq('id', usuario.id)
    onToast?.(t('toast.fotoActualizada'))
  } catch (err) {
    onToast?.(t('toast.errorFotoPerfil'), 'error')
  }
  setSubiendoFoto(false)
  }

  const toggleAficion = (aficion) => {
    setPerfil(prev => ({
      ...prev,
      aficiones: prev.aficiones?.includes(aficion)
        ? prev.aficiones.filter(a => a !== aficion)
        : [...(prev.aficiones || []), aficion]
    }))
  }

  const añadirAficionPersonalizada = () => {
    if (!nuevaAficion.trim()) return
    if (perfil.aficiones?.includes(nuevaAficion.trim())) return
    setPerfil(prev => ({ ...prev, aficiones: [...(prev.aficiones || []), nuevaAficion.trim()] }))
    setNuevaAficion('')
  }

  const eliminarAficion = (aficion) => {
    setPerfil(prev => ({ ...prev, aficiones: prev.aficiones.filter(a => a !== aficion) }))
  }

  if (cargando) return <div style={{ padding: '20px' }}><p className="guia-texto">{t('miPerfil.cargando')}</p></div>

  return (
    <div style={{ paddingBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <p className="guia-intro">{t('miPerfil.titulo')}</p>
        <button className="header-icon" onClick={() => editando ? guardarPerfil() : setEditando(true)}>
          <i className={`ti ${editando ? 'ti-check' : 'ti-edit'}`}></i>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '80px', height: '80px', margin: '4px' }}>
          <div
            style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: perfil.avatar_url ? 'transparent' : 'linear-gradient(135deg, var(--accent), var(--accent-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', color: 'white', fontWeight: '700',
              cursor: 'pointer', overflow: 'hidden',
              boxShadow: 'var(--shadow-md)'
            }}
            onClick={() => inputFotoRef.current.click()}
          >
            {perfil.avatar_url ? (
              <img src={perfil.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              perfil.nombre ? perfil.nombre.charAt(0).toUpperCase() : usuario.email.charAt(0).toUpperCase()
            )}
          </div>
          <div
            onClick={() => inputFotoRef.current.click()}
            style={{
              position: 'absolute', bottom: '0px', right: '0px',
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'var(--accent)',
              border: '2px solid var(--bg-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              zIndex: 1
            }}
          >
            <i className="ti ti-camera" style={{ color: 'white', fontSize: '10px' }}></i>
          </div>
        </div>

        <input type="file" accept="image/*" ref={inputFotoRef} style={{ display: 'none' }} onChange={handleFotoPerfil} />
        {subiendoFoto && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px' }}>Subiendo...</p>}
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>{usuario.email}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="perfil-campo">
          <label className="perfil-label">{t('miPerfil.nombre')}</label>
          {editando
            ? <input className="input-reto" value={perfil.nombre || ''} onChange={e => setPerfil(p => ({ ...p, nombre: e.target.value }))} placeholder={t('miPerfil.nombre')} style={{ border: 'none', padding: '0', borderRadius: '0', boxShadow: 'none' }} />
            : <p className="perfil-valor">{perfil.nombre || '—'}</p>
          }
        </div>

        <div className="perfil-campo">
          <label className="perfil-label">{t('miPerfil.username')}</label>
          <p className="perfil-valor">{perfil.username ? `@${perfil.username}` : '—'}</p>
        </div>

        <div className="perfil-campo">
          <label className="perfil-label">{t('miPerfil.fechaNacimiento')}</label>
          {editando
            ? <input className="input-reto" type="date" value={perfil.fecha_nacimiento || ''} onChange={e => setPerfil(p => ({ ...p, fecha_nacimiento: e.target.value }))} style={{ border: 'none', padding: '0', borderRadius: '0', boxShadow: 'none' }} />
            : <p className="perfil-valor">{perfil.fecha_nacimiento || '—'}</p>
          }
        </div>

        <div className="perfil-campo">
          <label className="perfil-label">{t('miPerfil.sexo')}</label>
          {editando ? (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
              {['hombre', 'mujer', 'otro', 'prefiero'].map(s => (
                <button key={s} className={`btn-dias ${perfil.sexo === s ? 'btn-dias-activo' : ''}`} onClick={() => setPerfil(p => ({ ...p, sexo: s }))} style={{ fontSize: '11px' }}>
                  {t(`miPerfil.${s}`)}
                </button>
              ))}
            </div>
          ) : <p className="perfil-valor">{perfil.sexo ? t(`miPerfil.${perfil.sexo}`) : '—'}</p>}
        </div>

        <div className="perfil-campo">
          <label className="perfil-label">{t('miPerfil.ciudad')}</label>
          {editando
            ? <input className="input-reto" value={perfil.ciudad || ''} onChange={e => setPerfil(p => ({ ...p, ciudad: e.target.value }))} placeholder={t('miPerfil.ciudad')} style={{ border: 'none', padding: '0', borderRadius: '0', boxShadow: 'none' }} />
            : <p className="perfil-valor">{perfil.ciudad || '—'}</p>
          }
        </div>

        <div className="perfil-campo">
          <label className="perfil-label">{t('miPerfil.pais')}</label>
          {editando
            ? <input className="input-reto" value={perfil.pais || ''} onChange={e => setPerfil(p => ({ ...p, pais: e.target.value }))} placeholder={t('miPerfil.pais')} style={{ border: 'none', padding: '0', borderRadius: '0', boxShadow: 'none' }} />
            : <p className="perfil-valor">{perfil.pais || '—'}</p>
          }
        </div>

        <div className="perfil-campo">
          <label className="perfil-label">{t('miPerfil.aficiones')}</label>
          {editando ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {aficionesBase.map(a => (
                  <button key={a} className={`btn-opcion ${perfil.aficiones?.includes(a) ? 'seleccionado' : ''}`} style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => toggleAficion(a)}>
                    {a}
                  </button>
                ))}
              </div>
              {perfil.aficiones?.filter(a => !aficionesBase.includes(a)).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {perfil.aficiones.filter(a => !aficionesBase.includes(a)).map(a => (
                    <span key={a} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent)', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {a}
                      <button onClick={() => eliminarAficion(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', padding: 0 }}>
                        <i className="ti ti-x"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="input-reto" placeholder="Añadir afición personalizada..." value={nuevaAficion} onChange={e => setNuevaAficion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') añadirAficionPersonalizada() }} />
                <button className="btn-añadir" onClick={añadirAficionPersonalizada}><i className="ti ti-plus"></i></button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {perfil.aficiones?.length > 0
                ? perfil.aficiones.map(a => (
                  <span key={a} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px', padding: '4px 10px', fontSize: '12px', color: 'var(--text-primary)' }}>{a}</span>
                ))
                : <p className="perfil-valor">—</p>
              }
            </div>
          )}
        </div>
      </div>

      {editando && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button className="btn-principal" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'none' }} onClick={() => setEditando(false)}>
            {t('miPerfil.cancelar')}
          </button>
          <button className="btn-principal" onClick={guardarPerfil} disabled={guardando}>
            {guardando ? t('miPerfil.guardando') : t('miPerfil.guardar')}
          </button>
        </div>
      )}

      <button className="btn-principal" style={{ marginTop: '24px', background: '#E24B4A', boxShadow: 'none' }} onClick={() => supabase.auth.signOut()}>
        {t('miPerfil.cerrarSesion')}
      </button>
    </div>
  )
}

export default Perfil