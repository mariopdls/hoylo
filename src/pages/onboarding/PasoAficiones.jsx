import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../services/supabase'
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

const GROQ_ENDPOINT = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/groq`
  : '/api/groq'

async function obtenerSugerencias(aficionesSeleccionadas, idioma) {
  const prompt = idioma === 'es'
    ? `El usuario tiene estas aficiones: ${aficionesSeleccionadas.join(', ')}.
Sugiere exactamente 6 aficiones más específicas relacionadas con las que ya tiene.
Cada una debe tener un emoji y un nombre corto.
Responde ÚNICAMENTE con un array JSON, sin texto extra, sin markdown.
Formato: ["🎸 Guitarra", "🎹 Piano", "🎤 Canto"]`
    : `The user has these hobbies: ${aficionesSeleccionadas.join(', ')}.
Suggest exactly 6 more specific hobbies related to what they already have.
Each one must have an emoji and a short name.
Reply ONLY with a valid JSON array, no extra text, no markdown.
Format: ["🎸 Guitar", "🎹 Piano", "🎤 Singing"]`

  const { data: { session } } = await supabase.auth.getSession()

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
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
        const sugs = await obtenerSugerencias(nuevas, i18n.language)
        setSugeridas(sugs.filter(s => !nuevas.includes(s)))
      } catch (e) {
        console.error(e)
      }
      setCargandoSugerencias(false)
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