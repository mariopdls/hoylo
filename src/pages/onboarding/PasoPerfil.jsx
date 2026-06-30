import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../services/supabase'
import logo from '../../assets/logo3.png'
import SelectorUbicacion from '../../components/SelectorUbicacion'

const años = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const dias = Array.from({ length: 31 }, (_, i) => i + 1)

function PasoPerfil({ onNext, onBack, onRespuesta }) {
  const { t } = useTranslation()
  const [nombre, setNombre] = useState('')
  const [username, setUsername] = useState('')
  const [dia, setDia] = useState('')
  const [mes, setMes] = useState('')
  const [año, setAño] = useState('')
  const [sexo, setSexo] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [pais, setPais] = useState('')
  const [errorUsername, setErrorUsername] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [mostrarSelector, setMostrarSelector] = useState(false)

  const continuar = async () => {
    if (!nombre || !username) return

    if (año && (año > new Date().getFullYear() || año < 1900)) {
      setErrorUsername(t('perfil.fechaError'))
      return
    }

    setCargando(true)
    setErrorUsername(null)

    const { data } = await supabase
      .from('perfiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (data) {
      setErrorUsername(t('perfil.usernameError'))
      setCargando(false)
      return
    }

    const fechaNacimiento = dia && mes && año
      ? `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
      : ''

    onRespuesta('perfil', { nombre, username, fecha_nacimiento: fechaNacimiento, sexo, ciudad, pais })
    setCargando(false)
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
        <p className="guia-intro">{t('perfil.titulo')}</p>
        <p className="guia-texto">{t('perfil.subtitulo')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          <input
            className="input-reto"
            placeholder={t('perfil.nombre')}
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
          <div>
            <input
              className="input-reto"
              placeholder={t('perfil.username')}
              value={username}
              onChange={e => {
                setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))
                setErrorUsername(null)
              }}
            />
            {errorUsername && (
              <p style={{ fontSize: '12px', color: '#E24B4A', marginTop: '4px', paddingLeft: '8px' }}>
                {errorUsername}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="input-reto"
              value={dia}
              onChange={e => setDia(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">Día</option>
              {dias.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              className="input-reto"
              value={mes}
              onChange={e => setMes(e.target.value)}
              style={{ flex: 2 }}
            >
              <option value="">Mes</option>
              {meses.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select
              className="input-reto"
              value={año}
              onChange={e => setAño(e.target.value)}
              style={{ flex: 2 }}
            >
              <option value="">Año</option>
              {años.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['hombre', 'mujer', 'otro', 'prefiero'].map(s => (
              <button
                key={s}
                className={`btn-dias ${sexo === s ? 'btn-dias-activo' : ''}`}
                style={{ fontSize: '11px' }}
                onClick={() => setSexo(s)}
              >
                {t(`perfil.${s}`)}
              </button>
            ))}
          </div>

          {mostrarSelector ? (
            <SelectorUbicacion
              onSelect={({ pais, ciudad }) => {
                setPais(pais)
                setCiudad(ciudad)
                setMostrarSelector(false)
              }}
            />
          ) : (
            <button
              className="btn-opcion"
              onClick={() => setMostrarSelector(true)}
              style={{ textAlign: 'left' }}
            >
              {ciudad && pais ? `📍 ${ciudad}, ${pais}` : t('perfil.ubicacion')}
            </button>
          )}
        </div>
      </div>

      <button
        className="btn-principal"
        onClick={continuar}
        disabled={!nombre || !username || cargando}
      >
        {cargando ? '...' : t('perfil.siguiente')}
      </button>
    </div>
  )
}

export default PasoPerfil