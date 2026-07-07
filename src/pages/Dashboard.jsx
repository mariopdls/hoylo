import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { supabase } from '../services/supabase'
import { cargarRetos } from '../services/retos'
import { cargarAmigos, cargarActividadAmigos } from '../services/social'
import { calcularRachaVigente } from '../services/racha'
import ModalNuevoReto from '../components/ModalNuevoReto'
import ModalEliminarReto from '../components/ModalEliminarReto'
import DetalleReto from './DetalleReto'
import Amigos from './Amigos'
import Descubrir from './Descubrir'
import Perfil from './Perfil'
import logo from '../assets/logo3.png'

function HeatmapReto({ reto }) {
  const completados = reto.dias_completados || 0
  const casillas = Array.from({ length: reto.dias }, (_, i) => i < completados)
  const terminado = completados >= reto.dias

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
      {casillas.map((hecho, i) => (
        <div key={i} style={{
          width: '10px', height: '10px', borderRadius: '3px',
          background: hecho ? (terminado ? '#3B6D11' : 'var(--accent)') : 'var(--bg-secondary)',
          border: hecho ? 'none' : '1px solid var(--border)'
        }} />
      ))}
    </div>
  )
}

function Dashboard({ usuario, onNuevoReto, onEliminarReto, onActualizarReto, onToast, onToggleIdioma, darkMode, onToggleDark, notificacionesPendientes }) {
  const { t } = useTranslation()
  const [retos, setRetos] = useState([])
  const [amigos, setAmigos] = useState([])
  const [actividadAmigos, setActividadAmigos] = useState([])
  const [perfil, setPerfil] = useState(null)
  const [tab, setTab] = useState('inicio')
  const [cargando, setCargando] = useState(true)
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false)
  const [retoAEliminar, setRetoAEliminar] = useState(null)
  const [retoDetalle, setRetoDetalle] = useState(null)

  useEffect(() => { cargarDatos() }, [])

  const cargarDatos = async () => {
    const [retosData, amigosData, actividadData, perfilData] = await Promise.all([
      cargarRetos(usuario.id),
      cargarAmigos(),
      cargarActividadAmigos(),
      supabase.from('perfiles').select('*').eq('id', usuario.id).maybeSingle()
    ])
    setRetos(retosData)
    setAmigos(amigosData)
    setActividadAmigos(actividadData)
    setPerfil(perfilData.data)
    setCargando(false)
  }

  const hora = new Date().getHours()
  const saludo = hora < 14 ? t('dashboardPc.saludoManana') : hora < 21 ? t('dashboardPc.saludoTarde') : t('dashboardPc.saludoNoche')
  const retosPendientes = retos.filter(r => !r.foto_hoy).length
  const rachaVigente = calcularRachaVigente(perfil?.racha_actual, perfil?.racha_ultima_fecha)

  const navItems = [
    { id: 'inicio', icon: 'ti-home', label: t('nav.inicio') },
    { id: 'estadisticas', icon: 'ti-chart-bar', label: t('nav.estadisticas') },
    { id: 'amigos', icon: 'ti-users', label: t('nav.amigos') },
    { id: 'descubrir', icon: 'ti-compass', label: t('nav.descubrir') },
    { id: 'perfil', icon: 'ti-user', label: t('nav.perfil') },
  ]

  const Sidebar = () => (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      padding: '24px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }}>
      <img src={logo} alt="Hoylo" style={{ width: '120px', height: 'auto', marginBottom: '20px', cursor: 'pointer', marginLeft: '22px' }} />

      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => setTab(item.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '10px', border: 'none',
            cursor: 'pointer', fontSize: '14px', fontWeight: tab === item.id ? '600' : '400',
            background: tab === item.id ? 'var(--accent-light)' : 'transparent',
            color: tab === item.id ? 'var(--accent)' : 'var(--text-secondary)',
            textAlign: 'left', width: '100%'
          }}
        >
          <i className={`ti ${item.icon}`} style={{ fontSize: '18px' }}></i>
          {item.label}
          {item.id === 'amigos' && notificacionesPendientes > 0 && (
            <span style={{ marginLeft: 'auto', background: '#E24B4A', color: 'white', fontSize: '10px', borderRadius: '10px', padding: '1px 6px' }}>
              {notificacionesPendientes}
            </span>
          )}
        </button>
      ))}

      <div style={{ marginTop: 'auto' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          border: '1px solid var(--border)', cursor: 'pointer'
        }}
          onClick={() => supabase.auth.signOut()}
        >
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: perfil?.avatar_url ? 'transparent' : 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '13px', fontWeight: '700',
            overflow: 'hidden', flexShrink: 0
          }}>
            {perfil?.avatar_url
              ? <img src={perfil.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : perfil?.nombre?.charAt(0).toUpperCase() || usuario.email.charAt(0).toUpperCase()
            }
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {perfil?.nombre || usuario.email}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{perfil?.username}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const PanelDerecho = () => (
    <div style={{
      background: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border)',
      padding: '24px 16px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div>
        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          {t('dashboardPc.tusAmigos')} ({amigos.length})
        </p>
        {amigos.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('amigos.sinAmigos')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {amigos.map((amigo, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '12px', color: 'white',
                  fontWeight: '700', overflow: 'hidden', flexShrink: 0
                }}>
                  {amigo.avatar_url
                    ? <img src={amigo.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : amigo.nombre?.charAt(0).toUpperCase()
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{amigo.nombre}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{amigo.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      <div>
        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          {t('dashboardPc.actividadAmigos')}
        </p>
        {actividadAmigos.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('dashboardPc.sinActividadAmigos')}</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {actividadAmigos.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '11px', color: 'white',
                  fontWeight: '700', overflow: 'hidden', flexShrink: 0
                }}>
                  {act.amigo?.avatar_url
                    ? <img src={act.amigo.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : act.amigo?.nombre?.charAt(0).toUpperCase()
                  }
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{act.amigo?.nombre}</strong> {t('dashboardPc.completoHoy', { reto: `${act.emoji} ${act.titulo}` })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      <div>
        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          {t('dashboardPc.tuProgreso')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('dashboardPc.diasCompletadosTotal')}</p>
            <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>
              {retos.reduce((acc, r) => acc + (r.dias_completados || 0), 0)}
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t('dashboardPc.fotosSubidasHoy')}</p>
            <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>
              {retos.filter(r => r.foto_hoy).length} / {retos.length}
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={onToggleIdioma}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer', fontSize: '13px',
            color: 'var(--text-secondary)', width: '100%'
          }}
        >
          <i className="ti ti-language" style={{ fontSize: '16px' }}></i>
          {t('config.cambiarIdioma')}
        </button>
        <button
          onClick={onToggleDark}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer', fontSize: '13px',
            color: 'var(--text-secondary)', width: '100%'
          }}
        >
          <i className={`ti ${darkMode ? 'ti-sun' : 'ti-moon'}`} style={{ fontSize: '16px' }}></i>
          {darkMode ? t('config.modoClaro') : t('config.modoOscuro')}
        </button>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer', fontSize: '13px',
            color: '#E24B4A', width: '100%'
          }}
        >
          <i className="ti ti-logout" style={{ fontSize: '16px' }}></i>
          {t('config.cerrarSesion')}
        </button>
      </div>
    </div>
  )

  const renderContenido = () => {
    switch (tab) {
      case 'inicio':
        return (
          <div style={{ padding: '32px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {saludo}, <span style={{ color: 'var(--accent)' }}>{perfil?.nombre || 'amigo'}</span> 👋
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {retosPendientes > 0 ? t('dashboardPc.pendientes', { count: retosPendientes }) : t('dashboardPc.todoCompletado')}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { label: t('dashboardPc.rachaActual'), value: `🔥 ${rachaVigente}`, sub: t('dashboardPc.diasConsecutivos') },
                { label: t('dashboardPc.mejorRacha'), value: `⭐ ${perfil?.mejor_racha || 0}`, sub: t('dashboardPc.diasSeguidos') },
                { label: t('dashboardPc.retosActivos'), value: retos.length, sub: t('dashboardPc.enProgreso') },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{stat.label}</p>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.sub}</p>
                </div>
              ))}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t('dashboardPc.retosDeHoy')}
                </p>
                <button
                  onClick={() => setModalNuevoAbierto(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px', border: 'none',
                    background: 'var(--accent)', color: 'white', cursor: 'pointer',
                    fontSize: '12px', fontWeight: '600'
                  }}
                >
                  <i className="ti ti-plus" style={{ fontSize: '14px' }}></i>
                  {t('dashboardPc.nuevoReto')}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cargando ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Cargando...</p>
                ) : retos.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</p>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{t('dashboardPc.sinRetosTitulo')}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{t('dashboardPc.sinRetosTexto')}</p>
                  </div>
                ) : (
                  retos.map((reto, i) => {
                    const progreso = Math.round(((reto.dias_completados || 0) / reto.dias) * 100)
                    const esAdmin = reto.usuario_id === usuario.id
                    return (
                      <div
                        key={reto.id || i}
                        onClick={() => setRetoDetalle(i)}
                        style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', cursor: 'pointer' }}
                      >
                        <span style={{ fontSize: '26px' }}>{reto.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>{reto.titulo}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {t('detalle.dia')} {reto.dia_actual || 1} {t('detalle.de')} {reto.dias} · {progreso}%
                          </p>
                          <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', marginTop: '8px' }}>
                            <div style={{ height: '100%', width: `${progreso}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: reto.foto_hoy ? 'rgba(59,109,17,0.1)' : 'var(--bg-secondary)',
                          border: `1px solid ${reto.foto_hoy ? '#3B6D11' : 'var(--border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <i className={`ti ${reto.foto_hoy ? 'ti-check' : 'ti-camera'}`}
                            style={{ fontSize: '15px', color: reto.foto_hoy ? '#3B6D11' : 'var(--text-muted)' }} />
                        </div>
                        {esAdmin && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setRetoAEliminar(reto) }}
                            style={{
                              width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                              background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
                            }}
                            aria-label={t('eliminar.confirmar')}
                          >
                            <i className="ti ti-trash" style={{ fontSize: '15px' }}></i>
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )

      case 'estadisticas':
        return (
          <div style={{ padding: '32px 40px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{t('dashboardPc.estadisticasTitulo')}</h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{t('dashboardPc.progresoAcumulado')}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { label: t('dashboardPc.rachaActual'), value: `🔥 ${rachaVigente}`, sub: t('dashboardPc.diasConsecutivos') },
                { label: t('dashboardPc.mejorRacha'), value: `⭐ ${perfil?.mejor_racha || 0}`, sub: t('dashboardPc.diasSeguidos') },
                { label: t('dashboardPc.diasTotales'), value: retos.reduce((acc, r) => acc + (r.dias_completados || 0), 0), sub: t('dashboardPc.diasCompletadosSub') },
                { label: t('dashboardPc.retosActivos'), value: retos.length, sub: t('dashboardPc.enProgresoAhora') },
                { label: t('dashboardPc.fotosHoy'), value: `${retos.filter(r => r.foto_hoy).length} / ${retos.length}`, sub: t('dashboardPc.subidasHoy') },
                { label: t('dashboardPc.retosTerminados'), value: retos.filter(r => r.dias_completados >= r.dias).length, sub: t('dashboardPc.completadosAl100') },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{stat.label}</p>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>{stat.value}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.sub}</p>
                </div>
              ))}
            </div>

            <div>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                {t('dashboardPc.progresoPorReto')}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {retos.map((reto, i) => {
                  const progreso = Math.round(((reto.dias_completados || 0) / reto.dias) * 100)
                  return (
                    <div key={reto.id || i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '22px' }}>{reto.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{reto.titulo}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {reto.dias_completados || 0} {t('detalle.de')} {reto.dias} · {t('amigos.dias')}
                          </p>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: progreso === 100 ? '#3B6D11' : 'var(--accent)' }}>
                          {progreso}%
                        </span>
                      </div>
                      <HeatmapReto reto={reto} />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'amigos':
        return (
          <div style={{ padding: '32px 40px', overflowY: 'auto' }}>
            <Amigos
              usuario={usuario}
              retosUsuario={retos}
              onRecargarRetos={cargarDatos}
              onRecargarNotificaciones={cargarDatos}
              onToast={onToast}
            />
          </div>
        )

      case 'descubrir':
        return (
          <div style={{ padding: '32px 40px', overflowY: 'auto' }}>
            <Descubrir
              usuario={usuario}
              onAñadirReto={async (reto) => { await onNuevoReto(reto); cargarDatos() }}
              onToast={onToast}
            />
          </div>
        )

      case 'perfil':
        return (
          <div style={{ padding: '32px 40px', overflowY: 'auto' }}>
            <Perfil
              usuario={usuario}
              onToast={onToast}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '200px 1fr 240px',
      height: '100vh',
      background: 'var(--bg-primary)',
      fontFamily: 'var(--font-base)'
    }}>
      <Sidebar />
      {renderContenido()}
      <PanelDerecho />

      {modalNuevoAbierto && (
        <ModalNuevoReto
          onCerrar={() => setModalNuevoAbierto(false)}
          onAñadir={async (reto) => { await onNuevoReto(reto); cargarDatos() }}
        />
      )}

      {retoAEliminar && (
        <ModalEliminarReto
          reto={retoAEliminar}
          onCerrar={() => setRetoAEliminar(null)}
          onConfirmar={async () => {
            await onEliminarReto(retoAEliminar.id)
            setRetoAEliminar(null)
            cargarDatos()
          }}
        />
      )}

      {retoDetalle !== null && retos[retoDetalle] && createPortal(
        <DetalleReto
          reto={retos[retoDetalle]}
          permitirSubirFoto={false}
          onVolver={() => setRetoDetalle(null)}
          onActualizar={(retoActualizado) => { onActualizarReto(retoActualizado); cargarDatos() }}
          onToast={onToast}
        />,
        document.body
      )}
    </div>
  )
}

export default Dashboard
