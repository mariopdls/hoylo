import { useTranslation } from 'react-i18next'
import logo from '../../assets/logo3.png'

function PasoRacha({ onNext, onBack, onRespuesta }) {
  const { t } = useTranslation()

  const opciones = [
    { id: 'mal', texto: t('racha.mal') },
    { id: 'bien', texto: t('racha.bien') },
    { id: 'nose', texto: t('racha.nose') },
    { id: 'prefiero', texto: t('racha.prefiero') },
  ]

  const elegir = (id) => {
    onRespuesta('racha', id)
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
        <p className="guia-intro">{t('racha.titulo')}</p>
        <p className="guia-texto">{t('racha.subtitulo')}</p>
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

export default PasoRacha