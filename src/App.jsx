import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'
import { cargarRetos, guardarReto, eliminarReto } from './services/retos'
import Login from './pages/auth/login'
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
import Cargando from './components/Cargando'
import ModalConfig from './components/ModalConfig'
import logo from './assets/logo3.PNG'
import lohago from './assets/lohago.PNG'
import i18n from './i18n/i18n.js'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)
  const [paso, setPaso] = useState(0)
  const [respuestas, setRespuestas] = useState({})
  const [retosUsuario, setRetosUsuario] = useState([])
  const [paginaActiva, setPaginaActiva] = useState('inicio')
  const [darkMode, setDarkMode] = useState(false)
  const [idioma, setIdioma] = useState('es')
  const [modalConfig, setModalConfig] = useState(false)
  const [mostrarTagline, setMostrarTagline] = useState(false)
  const [animandoLogo, setAnimandoLogo] = useState(false)
  const [desvaneciendo, setDesvaneciendo] = useState(false)

  const guardarPerfilInicial = async (retos, idiomaActual) => {
    const perfilData = respuestas.perfil || {}
    const aficiones = respuestas.aficiones || []
    await new Promise(resolve => setTimeout(resolve, 1000))
    const { error } = await supabase
      .from('perfiles')
      .upsert({
        id: usuario.id,
        ...perfilData,
        aficiones,
        idioma: idiomaActual
      }, { onConflict: 'id' })
    console.log('Error Supabase:', error)
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      setUsuario(user)

      if (user) {
        const [perfilData, retosData] = await Promise.all([
          supabase.from('perfiles').select('id, idioma').eq('id', user.id).maybeSingle(),
          cargarRetos(user.id)
        ])

        if (perfilData.data) {
          setPaso(8)
          if (perfilData.data.idioma) {
            i18n.changeLanguage(perfilData.data.idioma)
            setIdioma(perfilData.data.idioma)
          }
          setRetosUsuario(retosData)
        }
      }

      setCargandoAuth(false)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null)
    })
  }, [])

  const siguiente = () => setPaso(p => p + 1)
  const anterior = () => setPaso(p => p - 1)
  const guardarRespuesta = (clave, valor) => {
    setRespuestas(r => ({ ...r, [clave]: valor }))
  }

  const añadirReto = async (reto) => {
    const retoGuardado = await guardarReto(usuario.id, reto)
    if (retoGuardado) setRetosUsuario(prev => [...prev, retoGuardado])
  }

  const eliminarRetoUsuario = async (retoId) => {
    await eliminarReto(retoId)
    setRetosUsuario(prev => prev.filter(r => r.id !== retoId))
  }

  const actualizarReto = (retoActualizado) => {
    setRetosUsuario(prev => prev.map(r => r.id === retoActualizado.id ? retoActualizado : r))
  }

  const toggleDark = () => {
    setDarkMode(d => !d)
    document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark')
  }

  const toggleIdioma = () => {
    const nuevo = idioma === 'es' ? 'en' : 'es'
    i18n.changeLanguage(nuevo)
    setIdioma(nuevo)
  }

  if (cargandoAuth) return <Cargando />

  if (!usuario) return (
    <div className="onboarding-wrapper">
      <Login onLogin={setUsuario} />
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
                await guardarPerfilInicial(retos, idioma)
                for (const reto of retos) {
                  await guardarReto(usuario.id, reto)
                }
                const retosGuardados = await cargarRetos(usuario.id)
                setRetosUsuario(retosGuardados)
                siguiente()
              }}
            />
          )}
        </div>
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
              style={{ fontSize: '25px', padding: '8px' }}
            >
              <i className="ti ti-settings"></i>
            </button>
          </div>
          </header>

          <main className="app-content">
            {paginaActiva === 'inicio' && <Home retos={retosUsuario} onNuevoReto={añadirReto} onEliminarReto={eliminarRetoUsuario} onActualizarReto={actualizarReto} />}
            {paginaActiva === 'descubrir' && <div>Descubrir</div>}
            {paginaActiva === 'amigos' && <Amigos usuario={usuario} onRecargarRetos={async () => {
              const retos = await cargarRetos(usuario.id)
              setRetosUsuario(retos)
            }} />}
            {paginaActiva === 'perfil' && <Perfil usuario={usuario} />}
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
            <button className={`nav-item ${paginaActiva === 'amigos' ? 'active' : ''}`} onClick={() => setPaginaActiva('amigos')}>
              <i className="ti ti-users"></i>
              {idioma === 'es' ? 'Amigos' : 'Friends'}
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
        </div>
      )}
    </div>
  )
}

export default App