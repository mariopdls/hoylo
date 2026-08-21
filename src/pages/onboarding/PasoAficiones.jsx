import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/logo3.png'

const AFICIONES_BASE_ES = [
  '🎵 Música', '📚 Lectura', '🏃 Deporte', '🎨 Arte',
  '🎮 Videojuegos', '🍳 Cocina', '✈️ Viajes', '🌱 Naturaleza',
  '💻 Tecnología', '🎬 Cine', '🧘 Meditación', '📷 Fotografía'
]

const AFICIONES_BASE_EN = [
  '🎵 Music', '📚 Reading', '🏃 Sport', '🎨 Art',
  '🎮 Video games', '🍳 Cooking', '✈️ Travel', '🌱 Nature',
  '💻 Technology', '🎬 Cinema', '🧘 Meditation', '📷 Photography'
]

const SUGERENCIAS_LOCAL_ES = {
  '🎵 Música': ['🎸 Guitarra', '🎹 Piano', '🎤 Canto', '🎧 Producción'],
  '📚 Lectura': ['📖 Poesía', '🧠 Filosofía', '📝 Escritura', '📚 Biografías'],
  '🏃 Deporte': ['🏊 Natación', '🚴 Ciclismo', '🏋️ Fuerza', '🥾 Senderismo'],
  '🎨 Arte': ['🖌️ Dibujo', '🧵 Costura', '🎨 Acuarela', '🪄 Manualidades'],
  '🎮 Videojuegos': ['🎮 Esports', '🕹️ Retro', '🧩 Puzzle', '🏆 Competición'],
  '🍳 Cocina': ['🥘 Recetas', '🍰 Repostería', '🥬 Cocina saludable', '🌮 Cocina internacional'],
  '✈️ Viajes': ['🧭 Exploración', '🏞️ Naturaleza', '📍 Rutas locales', '🌍 Cultura'],
  '🌱 Naturaleza': ['🌿 Jardinería', '🐝 Ecología', '🌼 Flores', '🌳 Senderismo'],
  '💻 Tecnología': ['🤖 IA', '🧩 Programación', '📱 Gadget', '🖥️ Diseño digital'],
  '🎬 Cine': ['🎞️ Documentales', '🧠 Cine de autor', '🎬 Clásicos', '🍿 Cine en familia'],
  '🧘 Meditación': ['🧘 Respiración', '🌊 Mindfulness', '✨ Relax', '🫶 Bienestar'],
  '📷 Fotografía': ['📸 Retrato', '🌄 Paisajes', '🧭 Viajes fotográficos', '🎞️ Storytelling']
}

const SUGERENCIAS_LOCAL_EN = {
  '🎵 Music': ['🎸 Guitar', '🎹 Piano', '🎤 Singing', '🎧 Production'],
  '📚 Reading': ['📖 Poetry', '🧠 Philosophy', '📝 Writing', '📚 Biographies'],
  '🏃 Sport': ['🏊 Swimming', '🚴 Cycling', '🏋️ Strength', '🥾 Hiking'],
  '🎨 Art': ['🖌️ Drawing', '🧵 Sewing', '🎨 Watercolor', '🪄 Crafts'],
  '🎮 Video games': ['🎮 Esports', '🕹️ Retro games', '🧩 Puzzles', '🏆 Competition'],
  '🍳 Cooking': ['🥘 Recipes', '🍰 Baking', '🥬 Healthy cooking', '🌮 International food'],
  '✈️ Travel': ['🧭 Exploration', '🏞️ Nature', '📍 Local routes', '🌍 Culture'],
  '🌱 Nature': ['🌿 Gardening', '🐝 Ecology', '🌼 Flowers', '🌳 Hiking'],
  '💻 Technology': ['🤖 AI', '🧩 Programming', '📱 Gadgets', '🖥️ Digital design'],
  '🎬 Cinema': ['🎞️ Documentaries', '🧠 Art cinema', '🎬 Classics', '🍿 Family movies'],
  '🧘 Meditation': ['🧘 Breathing', '🌊 Mindfulness', '✨ Relaxation', '🫶 Wellness'],
  '📷 Photography': ['📸 Portraits', '🌄 Landscapes', '🧭 Travel photography', '🎞️ Storytelling']
}

function obtenerSugerencias(aficionesSeleccionadas, idioma) {
  const mapa = idioma === 'es' ? SUGERENCIAS_LOCAL_ES : SUGERENCIAS_LOCAL_EN
  const seleccionadas = new Set(aficionesSeleccionadas)
  const sugerencias = []

  for (const aficion of aficionesSeleccionadas) {
    const relacionados = mapa[aficion] || []
    for (const sugerencia of relacionados) {
      if (!seleccionadas.has(sugerencia) && !sugerencias.includes(sugerencia)) {
        sugerencias.push(sugerencia)
      }
    }
  }

  const adicionales = Object.values(mapa)
    .flat()
    .filter(sugerencia => !seleccionadas.has(sugerencia) && !sugerencias.includes(sugerencia))

  for (const sugerencia of adicionales) {
    if (sugerencias.length >= 6) break
    if (!sugerencias.includes(sugerencia)) {
      sugerencias.push(sugerencia)
    }
  }

  return sugerencias.slice(0, 6)
}

function PasoAficiones({ onNext, onBack, onRespuesta }) {
  const { t, i18n } = useTranslation()
  const [seleccionadas, setSeleccionadas] = useState([])
  const [sugeridas, setSugeridas] = useState([])
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false)

  const aficionesBase = i18n.language === 'es' ? AFICIONES_BASE_ES : AFICIONES_BASE_EN

  const toggleAficion = async (aficion) => {
    const nuevas = seleccionadas.includes(aficion)
      ? seleccionadas.filter(a => a !== aficion)
      : [...seleccionadas, aficion]

    setSeleccionadas(nuevas)

    if (nuevas.length >= 2 && !seleccionadas.includes(aficion)) {
      setCargandoSugerencias(true)
      try {
        const sugs = obtenerSugerencias(nuevas, i18n.language)
        setSugeridas(sugs.filter(s => !nuevas.includes(s)))
      } catch (e) {
        console.error(e)
        setSugeridas([])
      } finally {
        setCargandoSugerencias(false)
      }
    }
  }

  const continuar = () => {
    onRespuesta('aficiones', seleccionadas)
    onNext()
  }

  return (
    <div className="onboarding-screen">
    <div className="onboarding-topbar">
      <button className="btn-volver" onClick={onBack}>
        <i className="ti ti-arrow-left"></i>
      </button>
    </div>

      <div className="onboarding-logo">
        <img src={logo} alt="Hoylo" />
      </div>

      <div className="onboarding-content">
        <p className="guia-intro">{t('aficiones.titulo')}</p>
        <p className="guia-texto">{t('aficiones.subtitulo')}</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {aficionesBase.map(a => (
            <button
              key={a}
              className={`btn-opcion ${seleccionadas.includes(a) ? 'seleccionado' : ''}`}
              style={{ padding: '6px 12px', fontSize: '13px' }}
              onClick={() => toggleAficion(a)}
            >
              {a}
            </button>
          ))}
        </div>

        {cargandoSugerencias && (
          <p className="guia-texto" style={{ fontSize: '13px', marginTop: '12px' }}>
            {t('aficiones.sugerencias')}
          </p>
        )}

        {sugeridas.length > 0 && (
          <>
            <div className="separador" style={{ marginTop: '12px' }}>
              <span>{t('aficiones.separador')}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {sugeridas.map(a => (
                <button
                  key={a}
                  className={`btn-opcion ${seleccionadas.includes(a) ? 'seleccionado' : ''}`}
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                  onClick={() => toggleAficion(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        className="btn-principal"
        onClick={continuar}
        disabled={seleccionadas.length === 0}
      >
        {t('aficiones.siguiente')}
      </button>
    </div>
  )
}

export default PasoAficiones