import { useTranslation } from 'react-i18next'
import logo from '../../assets/logo3.png'

function SelectorIdioma({ onNext }) {
  const { i18n } = useTranslation()

  const elegir = (lang) => {
    i18n.changeLanguage(lang)
    onNext()
  }

  return (
    <div className="onboarding-screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '32px' }}>
      <div className="onboarding-logo">
        <img src={logo} alt="Hoylo" />
      </div>

      <div className="onboarding-content" style={{ alignItems: 'center' }}>
        <p className="guia-intro" style={{ textAlign: 'center' }}>¿En qué idioma quieres usar Hoylo?</p>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '-8px' }}>What language would you like to use?</p>

        <div className="opciones" style={{ width: '100%', marginTop: '8px' }}>
          <button className="btn-opcion btn-idioma" onClick={() => elegir('es')}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Español</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>Spain / Latinoamérica</span>
          </button>
          <button className="btn-opcion btn-idioma" onClick={() => elegir('en')}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>English</span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '8px' }}>UK / US</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectorIdioma