import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import logo from '../../assets/logo3.png'

function PasoMejorar({ onNext, onBack, onRespuesta }) {
  const { t } = useTranslation()
  const [seleccionadas, setSeleccionadas] = useState([])

  const opciones = [
    { id: 'actividad', texto: t('mejorar.actividad') },
    { id: 'constancia', texto: t('mejorar.constancia') },
    { id: 'alimentacion', texto: t('mejorar.alimentacion') },
    { id: 'descanso', texto: t('mejorar.descanso') },
    { id: 'mente', texto: t('mejorar.mente') },
    { id: 'aprender', texto: t('mejorar.aprender') },
  ]

  const toggleOpcion = (id) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    )
  }

  const continuar = () => {
    onRespuesta('mejorar', seleccionadas)
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
        <p className="guia-intro">{t('mejorar.titulo')}</p>
        <p className="guia-texto">{t('mejorar.subtitulo')}</p>
        <div className="opciones">
          {opciones.map(op => (
            <button
              key={op.id}
              className={`btn-opcion ${seleccionadas.includes(op.id) ? 'seleccionado' : ''}`}
              onClick={() => toggleOpcion(op.id)}
            >
              {op.texto}
            </button>
          ))}
        </div>
      </div>
      <button className="btn-principal" onClick={continuar} disabled={seleccionadas.length === 0}>
        {t('mejorar.boton')}
      </button>
    </div>
  )
}

export default PasoMejorar