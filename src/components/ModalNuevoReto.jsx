import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const EMOJIS = ['⭐', '🏃', '💧', '📵', '🥗', '📚', '🧘', '💪', '🎯', '🌱', '😴', '✍️', '🎨', '🚴', '🧹']

function ModalNuevoReto({ onCerrar, onAñadir }) {
  const { t } = useTranslation()
  const [retoTexto, setRetoTexto] = useState('')
  const [emojiSeleccionado, setEmojiSeleccionado] = useState('⭐')
  const [diasSeleccionados, setDiasSeleccionados] = useState(7)
  const [mostrarEmojis, setMostrarEmojis] = useState(false)

  const handleAñadir = () => {
    if (retoTexto.trim()) {
      onAñadir({ emoji: emojiSeleccionado, titulo: retoTexto.trim(), dias: diasSeleccionados })
      onCerrar()
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <p className="guia-intro">{t('retos.titulo')}</p>
          <button className="modal-cerrar" onClick={onCerrar}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
          <button className="btn-emoji" onClick={() => setMostrarEmojis(v => !v)}>
            {emojiSeleccionado}
          </button>
          <input
            type="text"
            className="input-reto"
            placeholder={t('retos.placeholder')}
            value={retoTexto}
            onChange={e => setRetoTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAñadir() }}
          />
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

        <div className="dias-selector" style={{ marginTop: '14px' }}>
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

        <button
          className="btn-principal"
          style={{ marginTop: '20px' }}
          onClick={handleAñadir}
          disabled={!retoTexto.trim()}
        >
          {t('retos.boton')}
        </button>
      </div>
    </div>
  )
}

export default ModalNuevoReto