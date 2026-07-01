import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'

function ModalEliminarReto({ reto, onCerrar, onConfirmar }) {
  const { t } = useTranslation()

  return createPortal(
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <p className="guia-intro">{t('eliminar.titulo')}</p>
          <button className="modal-cerrar" onClick={onCerrar}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <p className="guia-texto" style={{ marginTop: '12px' }}>
          {t('eliminar.pregunta')} <strong>{reto?.emoji} {reto?.titulo}</strong>?
        </p>
        <p className="guia-texto" style={{ fontSize: '13px', marginTop: '6px' }}>
          {t('eliminar.aviso')}
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            className="btn-principal"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', boxShadow: 'none' }}
            onClick={onCerrar}
          >
            {t('eliminar.cancelar')}
          </button>
          <button
            className="btn-principal"
            style={{ background: '#E24B4A', boxShadow: 'none' }}
            onClick={onConfirmar}
          >
            {t('eliminar.confirmar')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ModalEliminarReto