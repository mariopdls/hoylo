import { useTranslation } from 'react-i18next'
import logo from '../../assets/logo3.png'

function Bienvenida({ onNext, onBack }) {
  const { t } = useTranslation()

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
        <p className="guia-intro">{t('bienvenida.titulo')}</p>
        <p className="guia-texto">{t('bienvenida.texto1')}</p>
        <p className="guia-texto">{t('bienvenida.texto2')}</p>
      </div>
      <button className="btn-principal" onClick={onNext}>
        {t('bienvenida.boton')}
      </button>
    </div>
  )
}

export default Bienvenida