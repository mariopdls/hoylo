import { useTranslation } from 'react-i18next'
import logo from '../../assets/logo3.png'

function PasoConstancia({ onNext, onBack, onRespuesta }) {
  const { t } = useTranslation()

  const opciones = [
    { id: 'mucho', texto: t('constancia.mucho') },
    { id: 'regular', texto: t('constancia.regular') },
    { id: 'poco', texto: t('constancia.poco') },
    { id: 'nose', texto: t('constancia.nose') },
  ]

  const elegir = (id) => {
    onRespuesta('constancia', id)
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
        <p className="guia-intro">{t('constancia.titulo')}</p>
        <p className="guia-texto">{t('constancia.subtitulo')}</p>
        <div className="opciones">
          {opciones.map(op => (
            <button key={op.id} className="btn-opcion" onClick={() => elegir(op.id)}>
              {op.texto}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PasoConstancia