import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'

function ModalConfirmacion({ visible, titulo, mensaje, onConfirmar, onCancelar, cargando = false }) {
  const { t } = useTranslation()

  if (!visible) return null

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: '20px 20px 0 0',
        padding: '24px 16px', width: '100%', maxWidth: '500px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
      }}>
        <p className="detalle-seccion-titulo" style={{ marginBottom: '8px' }}>
          {titulo}
        </p>
        <p className="guia-texto" style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
          {mensaje}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-principal"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'none', flex: 1 }}
            onClick={onCancelar}
            disabled={cargando}
          >
            {t('general.cancelar') || 'Cancelar'}
          </button>
          <button
            className="btn-principal"
            style={{ background: '#E24B4A', flex: 1 }}
            onClick={onConfirmar}
            disabled={cargando}
          >
            {cargando ? '...' : (t('general.confirmar') || 'Confirmar')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ModalConfirmacion
