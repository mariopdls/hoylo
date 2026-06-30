import { useTranslation } from 'react-i18next'

function ModalEliminarReto({ reto, onCerrar, onConfirmar }) {
  const { t } = useTranslation()

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <p className="guia-intro">{t('eliminar.titulo')}</p>
          <button className="modal-cerrar" onClick={onCerrar}>
            <i className="ti ti-x"></i>
          </button>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span style={{ fontSize: '48px' }}>{reto.emoji}</span>
          <p className="guia-texto" style={{ marginTop: '12px' }}>
            {t('eliminar.pregunta')} <strong>{reto.titulo}</strong>?
          </p>
          <p className="guia-texto" style={{ fontSize: '13px', marginTop: '8px' }}>
            {t('eliminar.aviso')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            className="btn-principal"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '0.5px solid var(--border)' }}
            onClick={onCerrar}
          >
            {t('eliminar.cancelar')}
          </button>
          <button
            className="btn-principal"
            style={{ background: '#E24B4A' }}
            onClick={onConfirmar}
          >
            {t('eliminar.confirmar')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalEliminarReto