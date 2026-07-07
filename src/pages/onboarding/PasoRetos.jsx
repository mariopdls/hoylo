import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { generarRetos } from '../../services/ia'
import logo from '../../assets/logo.png'

const EMOJIS = ['⭐', '🏃', '💧', '📵', '🥗', '📚', '🧘', '💪', '🎯', '🌱', '😴', '✍️', '🎨', '🚴', '🧹']

function PasoRetos({ respuestas, onFin, onBack }) {
  const { t, i18n } = useTranslation()
  const [retos, setRetos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [retoPropio, setRetoPropio] = useState('')
  const [emojiSeleccionado, setEmojiSeleccionado] = useState('⭐')
  const [diasSeleccionados, setDiasSeleccionados] = useState(7)
  const [mostrarEmojis, setMostrarEmojis] = useState(false)
  const [retosPersonalizados, setRetosPersonalizados] = useState([])
  const [retosSeleccionados, setRetosSeleccionados] = useState([])
  const [esPublico, setEsPublico] = useState(false)

  const generar = () => {
    generarRetos(respuestas, i18n.language)
      .then(data => {
        setRetos(data)
        setCargando(false)
      })
      .catch(err => {
        console.error(err)
        setError(t('retos.error'))
        setCargando(false)
      })
  }

  useEffect(() => {
    generar()
  }, [])

  const reintentar = () => {
    setCargando(true)
    setError(null)
    generar()
  }

  const toggleReto = (i) => {
    setRetosSeleccionados(prev =>
      prev.includes(i) ? prev.filter(r => r !== i) : [...prev, i]
    )
  }

  const añadirRetoPropio = () => {
    if (retoPropio.trim()) {
      setRetosPersonalizados(prev => [...prev, {
        emoji: emojiSeleccionado,
        titulo: retoPropio.trim(),
        dias: diasSeleccionados
      }])
      setRetoPropio('')
      setEmojiSeleccionado('⭐')
      setDiasSeleccionados(7)
      setMostrarEmojis(false)
    }
  }

  const eliminarRetoPropio = (i) => {
    setRetosPersonalizados(prev => prev.filter((_, j) => j !== i))
  }

  const handleEmpezar = () => {
    const retosFinales = [
      ...retosPersonalizados,
      ...retosSeleccionados.map(i => retos[i])
    ]
    onFin(retosFinales)
  }

  if (cargando) return (
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
        <p className="guia-intro">{t('retos.cargando')}</p>
        <p className="guia-texto">{t('retos.cargandoSub')}</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="onboarding-screen">
      <button className="btn-volver" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        <i className="ti ti-arrow-left"></i>
      </button>
      <div className="onboarding-content">
        <p className="guia-texto">{error}</p>
      </div>
      <button className="btn-principal" onClick={reintentar}>
        {t('retos.reintentar')}
      </button>
    </div>
  )

  return (
    <div className="onboarding-screen">
      <button className="btn-volver" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        <i className="ti ti-arrow-left"></i>
      </button>

      <div className="onboarding-logo">
        <img src={logo} alt="Hoylo" />
      </div>

      <div className="onboarding-content">
        <p className="guia-intro">{t('retos.titulo')}</p>
        <p className="guia-texto">{t('retos.subtitulo')}</p>

        <div className="reto-propio">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-emoji" onClick={() => setMostrarEmojis(v => !v)}>
              {emojiSeleccionado}
            </button>
            <input
              type="text"
              className="input-reto"
              placeholder={t('retos.placeholder')}
              value={retoPropio}
              onChange={e => setRetoPropio(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') añadirRetoPropio() }}
            />
            <button className="btn-añadir" onClick={añadirRetoPropio}>
              <i className="ti ti-plus"></i>
            </button>
          </div>

          {mostrarEmojis && (
            <div className="emoji-picker">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  className={`emoji-option ${emojiSeleccionado === e ? 'emoji-activo' : ''}`}
                  onClick={() => { setEmojiSeleccionado(e); setMostrarEmojis(false) }}
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          <div className="dias-selector" style={{ marginTop: '10px' }}>
            <span className="guia-texto" style={{ fontSize: '13px' }}>{t('retos.duracion')}</span>
            {[7, 14, 21, 30].map(d => (
              <button
                key={d}
                className={`btn-dias ${diasSeleccionados === d ? 'btn-dias-activo' : ''}`}
                onClick={() => setDiasSeleccionados(d)}
              >
                {d}d
              </button>
            ))}
          </div>

          {retosPersonalizados.length > 0 && (
            <div className="retos-lista" style={{ marginTop: '10px' }}>
              {retosPersonalizados.map((r, i) => (
                <div key={i} className="reto-card" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="reto-emoji">{r.emoji}</span>
                    <div>
                      <p className="reto-titulo">{r.titulo}</p>
                      <p className="reto-dias">{r.dias}d</p>
                    </div>
                  </div>
                  <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '18px' }}
                    onClick={() => eliminarRetoPropio(i)}
                  >
                    <i className="ti ti-x"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="separador">
          <span>{t('retos.separador')}</span>
        </div>

        <div className="retos-lista">
          {retos.map((reto, i) => (
            <div
              key={i}
              className={`reto-card ${retosSeleccionados.includes(i) ? 'reto-seleccionado' : ''}`}
              onClick={() => toggleReto(i)}
            >
              <span className="reto-emoji">{reto.emoji}</span>
              <div>
                <p className="reto-titulo">{reto.titulo}</p>
                <p className="reto-dias">{reto.dias}d</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn-principal"
        onClick={handleEmpezar}
        disabled={retosSeleccionados.length === 0 && retosPersonalizados.length === 0}
      >
        {t('retos.boton')}
      </button>
    </div>
  )
}

export default PasoRetos