import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import ModalNuevoReto from '../components/ModalNuevoReto'
import ModalEliminarReto from '../components/ModalEliminarReto'
import DetalleReto from './DetalleReto'

function RetoCard({ reto, onEliminar, onAbrir, esAdmin }) {
  const [offsetX, setOffsetX] = useState(0)
  const startX = useRef(null)
  const isDragging = useRef(false)
  const { t } = useTranslation()

  const UMBRAL = 80

  const onTouchStart = (e) => {
    if (!esAdmin) return
    startX.current = e.touches[0].clientX
    isDragging.current = true
  }

  const onTouchMove = (e) => {
    if (!esAdmin || !isDragging.current) return
    const diff = e.touches[0].clientX - startX.current
    if (diff < 0) setOffsetX(Math.max(diff, -120))
  }

  const onTouchEnd = () => {
    if (!esAdmin) {
      onAbrir()
      return
    }
    isDragging.current = false
    if (offsetX < -UMBRAL) {
      onEliminar()
    } else if (offsetX === 0) {
      onAbrir()
    }
    setOffsetX(0)
  }

  return (
    <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', marginBottom: '10px' }}>
      {esAdmin && (
        <div style={{
          position: 'absolute', inset: 0,
          background: '#E24B4A',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: '20px', borderRadius: '14px'
        }}>
          <i className="ti ti-trash" style={{ color: 'white', fontSize: '22px' }}></i>
        </div>
      )}
      <div
        className="reto-card reto-card-home"
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.3s ease',
          marginBottom: 0
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <span className="reto-emoji">{reto.emoji}</span>
        <div className="reto-info">
          <p className="reto-titulo">{reto.titulo}</p>
          <p className="reto-dias">{t('detalle.dia')} {reto.dia_actual || 1} {t('detalle.de')} {reto.dias}</p>
        </div>
        <div className="reto-progreso">
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#E8C97A" strokeWidth="3"/>
            <circle cx="18" cy="18" r="15" fill="none" stroke="#F5A623" strokeWidth="3"
              strokeDasharray={`${Math.round(((reto.dias_completados || 0) / reto.dias) * 94)} 94`}
              strokeLinecap="round" transform="rotate(-90 18 18)"
            />
            <text x="18" y="22" textAnchor="middle" fontSize="10" fill="#BA7517">
              {Math.round(((reto.dias_completados || 0) / reto.dias) * 100)}%
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}

function Home({ retos, usuario, onNuevoReto, onEliminarReto, onActualizarReto, onToast }) {
  const { t } = useTranslation()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [retoAEliminar, setRetoAEliminar] = useState(null)
  const [retoDetalle, setRetoDetalle] = useState(null)
  const hora = new Date().getHours()
  const saludo = hora < 14 ? t('home.saludoManana') : hora < 21 ? t('home.saludoTarde') : t('home.saludoNoche')

  return (
    <div>
      <p className="guia-intro">{saludo}</p>
      <p className="guia-texto" style={{ marginBottom: '16px' }}>{t('home.retosHoy')}</p>

      <div className="nuevo-reto-banner" onClick={() => setModalAbierto(true)}>
        <span className="nuevo-reto-emoji">💡</span>
        <div>
          <p className="nuevo-reto-titulo">{t('home.nuevoBanner')}</p>
          <p className="nuevo-reto-sub">{t('home.nuevoSub')}</p>
        </div>
      </div>

      <div className="retos-lista" style={{ gap: 0 }}>
        {retos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <p className="empty-state-title">Sin retos todavía</p>
            <p className="empty-state-text">Crea tu primer reto y empieza a construir hábitos hoy</p>
          </div>
        ) : (
          retos.map((reto, i) => (
            <RetoCard
              key={reto.id || i}
              reto={reto}
              esAdmin={reto.usuario_id === usuario?.id}
              onEliminar={() => setRetoAEliminar(reto)}
              onAbrir={() => setRetoDetalle(i)}
            />
          ))
        )}
      </div>

      {modalAbierto && (
        <ModalNuevoReto
          onCerrar={() => setModalAbierto(false)}
          onAñadir={(reto) => {
            onNuevoReto(reto)
            setModalAbierto(false)
          }}
        />
      )}

      {retoAEliminar && (
        <ModalEliminarReto
          reto={retoAEliminar}
          onCerrar={() => setRetoAEliminar(null)}
          onConfirmar={() => {
            onEliminarReto(retoAEliminar.id)
            setRetoAEliminar(null)
          }}
        />
      )}

      {retoDetalle !== null && createPortal(
        <DetalleReto
          reto={retos[retoDetalle]}
          onVolver={() => setRetoDetalle(null)}
          onActualizar={(retoActualizado) => {
            onActualizarReto(retoActualizado)
          }}
          onToast={onToast}
        />,
        document.body
      )}
    </div>
  )
}

export default Home