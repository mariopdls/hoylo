import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import { cargarRetos, guardarReto, eliminarReto } from './services/retos'
import Login from './pages/auth/login'
import { useTranslation } from 'react-i18next'
import SelectorIdioma from './pages/onboarding/SelectorIdioma'
import PasoPerfil from './pages/onboarding/PasoPerfil'
import PasoAficiones from './pages/onboarding/PasoAficiones'
import Bienvenida from './pages/onboarding/Bienvenida'
import PasoRacha from './pages/onboarding/PasoRacha'
import PasoMejorar from './pages/onboarding/PasoMejorar'
import PasoConstancia from './pages/onboarding/PasoConstancia'
import PasoRetos from './pages/onboarding/PasoRetos'
import Home from './pages/Home'
import Perfil from './pages/Perfil'
import Amigos from './pages/Amigos'
import Descubrir from './pages/Descubrir'
import Dashboard from './pages/Dashboard'
import Cargando from './components/Cargando'
import ModalConfig from './components/ModalConfig'
import PullToRefresh from './components/PullToRefresh'
import Toast from './components/Toast'
import logo from './assets/logo3.png'
import lohago from './assets/lohago.PNG'
import i18n from './i18n/i18n.js'

function App() {
  const { t } = useTranslation()
  const [usuario, setUsuario] = useState(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [retosUsuario, setRetosUsuario] = useState([])
  const [paginaActiva, setPaginaActiva] = useState('inicio')
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })
  const [idioma, setIdioma] = useState('es')
  const [modalConfig, setModalConfig] = useState(false)
  const [mostrarTagline, setMostrarTagline] = useState(false)
  const [animandoLogo, setAnimandoLogo] = useState(false)
  const [desvaneciendo, setDesvaneciendo] = useState(false)
  const [notificacionesPendientes, setNotificacionesPendientes] = useState(0)
  const [toast, setToast] = useState(null)
  const [esPc, setEsPc] = useState(window.innerWidth >= 900)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    const handleResize = () => setEsPc(window.innerWidth >= 900)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const mostrarToast = (texto, tipo = 'ok') => {
    setToast({ texto, tipo })
  }

  const cargarNotificacionesPendientes = async (user) => {
    const { data: perfilData } = await supabase
      .from('perfiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()

    if (!perfilData?.username) return

    const { count: countSolicitudes } = await supabase
      .from('solicitudes_amistad')
      .select('id', { count: 'exact', head: true })
      .eq('para_usuario_id', user.id)
      .eq('estado', 'pendiente')

    const { count: countInvitaciones } = await supabase
      .from('invitaciones')
      .select('id', { count: 'exact', head: true })
      .eq('para_username', perfilData.username)
      .eq('estado', 'pendiente')

    const { count: countSolicitudesReto } = await supabase
      .from('solicitudes_reto')
      .select('id', { count: 'exact', head: true })
      .eq('para_admin_id', user.id)
      .eq('estado', 'pendiente')

    setNotificacionesPendientes((countSolicitudes || 0) + (countInvitaciones || 0) + (countSolicitudesReto || 0))
  }

  const cargarPerfilYRetos = async (user) => {
    const { data: perfilData } = await supabase
      .from('perfiles')
      .select('id, idioma')
      .eq('id', user.id)
      .maybeSingle()

    if (perfilData) {
      setPaso(8)
      if (perfilData.idioma) {
        i18n.changeLanguage(perfilData.idioma)
        setIdioma(perfilData.idioma)
      }
      const retosData = await cargarRetos(user.id)
      setRetosUsuario(retosData)
      await cargarNotificacionesPendientes(user)
    } else {
      setPaso(0)
      setRespuestas({})
      setRetosUsuario([])
    }
  }

  const guardarPerfilInicial = async (idiomaActual, user) => {
    const perfilData = respuestas.perfil || {}
    const aficiones = respuestas.aficiones || []

    if (!user) {
      console.error('No hay usuario')
      return null
    }

    const { error } = await supabase
      .from('perfiles')
      .upsert({
        id: user.id,
        ...perfilData,
        aficiones,
        idioma: idiomaActual
      }, { onConflict: 'id' })

    if (error) console.error('Error guardando perfil:', error)
    return user
  }

  useEffect(() => {
    let activo = true

    const inicializar = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      if (!activo) return
      setUsuario(user)
      if (user) await cargarPerfilYRetos(user)
      if (activo) setCargandoAuth(false)
    }

    inicializar()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null
      setUsuario(user)

      if (event === 'SIGNED_IN' && user) {
        setCargandoAuth(true)
        await cargarPerfilYRetos(user)
        setCargandoAuth(false)
      }

      if (event === 'SIGNED_OUT') {
        setPaso(0)
        setRespuestas({})
        setRetosUsuario([])
        setNotificacionesPendientes(0)
      }
    })

    return () => {
      activo = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const siguiente = () => setPaso(p => p + 1)
  const anterior = () => setPaso(p => p - 1)
  const guardarRespuesta = (clave, valor) => setRespuestas(r => ({ ...r, [clave]: valor }))

  const añadirReto = async (reto) => {
    const retoGuardado = await guardarReto(usuario.id, reto)
    if (retoGuardado) {
      setRetosUsuario(prev => [...prev, retoGuardado])
      mostrarToast(t('toast.retoAñadido'))
    }
  }

  const eliminarRetoUsuario = async (retoId) => {
    await eliminarReto(retoId)
    setRetosUsuario(prev => prev.filter(r => r.id !== retoId))
    mostrarToast(t('toast.retoEliminado'))
  }

  const actualizarReto = (retoActualizado) => {
    setRetosUsuario(prev => prev.map(r => r.id === retoActualizado.id ? retoActualizado : r))
  }

  const toggleDark = () => {
    const nuevo = !darkMode
    setDarkMode(nuevo)
    localStorage.setItem('darkMode', nuevo)
    document.documentElement.setAttribute('data-theme', nuevo ? 'dark' : 'light')
  }

  const toggleIdioma = () => {
    const nuevo = idioma === 'es' ? 'en' : 'es'
    i18n.changeLanguage(nuevo)
    setIdioma(nuevo)
  }

  if (cargandoAuth) return <Cargando />

  if (!usuario) return (
    <div className="onboarding-wrapper">
      <Login onLogin={async (user) => {
        setCargandoAuth(true)
        setUsuario(user)
        await cargarPerfilYRetos(user)
        setCargandoAuth(false)
      }} />
    </div>
  )

  const onboarding = paso < 8

  return (
    <div>
      {onboarding ? (
        <div className="onboarding-wrapper">
          {paso === 0 && <SelectorIdioma onNext={siguiente} />}
          {paso === 1 && <PasoPerfil onNext={siguiente} onBack={anterior} onRespuesta={guardarRespuesta} />}
          {paso === 2 && <PasoAficiones onNext={siguiente} onBack={anterior} onRespuesta={guardarRespuesta} />}
          {paso === 3 && <Bienvenida onNext={siguiente} onBack={anterior} />}
          {paso === 4 && <PasoRacha onNext={siguiente} onBack={anterior} onRespuesta={guardarRespuesta} />}
          {paso === 5 && <PasoMejorar onNext={siguiente} onBack={anterior} onRespuesta={guardarRespuesta} />}
          {paso === 6 && <PasoConstancia onNext={siguiente} onBack={anterior} onRespuesta={guardarRespuesta} />}
          {paso === 7 && (
            <PasoRetos
              respuestas={respuestas}
              onBack={anterior}
              onFin={async (retos) => {
                const user = await guardarPerfilInicial(idioma, usuario)
                if (!user) return
                for (const reto of retos) {
                  await guardarReto(user.id, reto)
                }
                const retosGuardados = await cargarRetos(user.id)
                setRetosUsuario(retosGuardados)
                siguiente()
              }}
            />
          )}
        </div>
      ) : esPc ? (
        <Dashboard
          usuario={usuario}
          onNuevoReto={añadirReto}
          onEliminarReto={eliminarRetoUsuario}
          onActualizarReto={actualizarReto}
          onToast={mostrarToast}
          idioma={idioma}
          onToggleIdioma={toggleIdioma}
          darkMode={darkMode}
          onToggleDark={toggleDark}
          notificacionesPendientes={notificacionesPendientes}
        />
      ) : (
        <div className="app-container">
          <header className="app-header">
            <div className="header-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <img
                src={logo}
                alt="Hoylo"
                style={{
                  cursor: 'pointer',
                  animation: animandoLogo ? 'logoSalto 0.7s ease' : 'none'
                }}
                onClick={() => {
                  setAnimandoLogo(true)
                  setMostrarTagline(true)
                  setDesvaneciendo(false)
                  setTimeout(() => setDesvaneciendo(true), 1800)
                  setTimeout(() => {
                    setAnimandoLogo(false)
                    setMostrarTagline(false)
                    setDesvaneciendo(false)
                  }, 2500)
                }}
              />
              <div style={{ height: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                {mostrarTagline && (
                  <img
                    src={lohago}
                    alt="Hoy lo hago"
                    style={{
                      height: '16px',
                      animation: desvaneciendo ? 'fadeOut 0.7s ease forwards' : 'fadeInUp 0.4s ease'
                    }}
                  />
                )}
              </div>
            </div>
            <div className="header-icons" style={{ display: 'flex', alignItems: 'center' }}>
              <button
                className="header-icon"
                onClick={() => setModalConfig(true)}
                aria-label="Configuración"
                style={{ fontSize: '26px', padding: '8px' }}
              >
                <i className="ti ti-settings"></i>
              </button>
            </div>
          </header>

          <main className="app-content">
            {paginaActiva === 'inicio' && (
              <PullToRefresh onRefresh={async () => {
                const retos = await cargarRetos(usuario.id)
                setRetosUsuario(retos)
                await cargarNotificacionesPendientes(usuario)
              }}>
                <Home
                  retos={retosUsuario}
                  usuario={usuario}
                  onNuevoReto={añadirReto}
                  onEliminarReto={eliminarRetoUsuario}
                  onActualizarReto={actualizarReto}
                  onToast={mostrarToast}
                />
              </PullToRefresh>
            )}
            {paginaActiva === 'descubrir' && (
              <Descubrir
                usuario={usuario}
                onAñadirReto={añadirReto}
                onToast={mostrarToast}
              />
            )}
            {paginaActiva === 'amigos' && (
              <Amigos
                usuario={usuario}
                retosUsuario={retosUsuario}
                onRecargarRetos={async () => {
                  const retos = await cargarRetos(usuario.id)
                  setRetosUsuario(retos)
                }}
                onRecargarNotificaciones={() => cargarNotificacionesPendientes(usuario)}
                onToast={mostrarToast}
              />
            )}
            {paginaActiva === 'perfil' && (
              <Perfil
                usuario={usuario}
                onToast={mostrarToast}
              />
            )}
          </main>

          <nav className="app-nav">
            <button className={`nav-item ${paginaActiva === 'inicio' ? 'active' : ''}`} onClick={() => setPaginaActiva('inicio')}>
              <i className="ti ti-home"></i>
              {idioma === 'es' ? 'Inicio' : 'Home'}
            </button>
            <button className={`nav-item ${paginaActiva === 'descubrir' ? 'active' : ''}`} onClick={() => setPaginaActiva('descubrir')}>
              <i className="ti ti-compass"></i>
              {idioma === 'es' ? 'Descubrir' : 'Discover'}
            </button>
            <button
              className={`nav-item ${paginaActiva === 'amigos' ? 'active' : ''}`}
              onClick={() => setPaginaActiva('amigos')}
              style={{ position: 'relative' }}
            >
              <i className="ti ti-users"></i>
              {idioma === 'es' ? 'Amigos' : 'Friends'}
              {notificacionesPendientes > 0 && (
                <span style={{
                  position: 'absolute', top: '0px', right: '14px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#E24B4A'
                }} />
              )}
            </button>
            <button className={`nav-item ${paginaActiva === 'perfil' ? 'active' : ''}`} onClick={() => setPaginaActiva('perfil')}>
              <i className="ti ti-user"></i>
              {idioma === 'es' ? 'Perfil' : 'Profile'}
            </button>
          </nav>

          {modalConfig && (
            <ModalConfig
              onCerrar={() => setModalConfig(false)}
              idioma={idioma}
              onToggleIdioma={toggleIdioma}
              darkMode={darkMode}
              onToggleDark={toggleDark}
            />
          )}

          <Toast mensaje={toast} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  )
}

export default App