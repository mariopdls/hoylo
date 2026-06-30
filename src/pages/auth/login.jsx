import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../services/supabase'
import logo from '../../assets/logo3.png'

function Login({ onLogin }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [esRegistro, setEsRegistro] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  const mensajeError = (msg) => {
    if (msg.includes('already registered')) return 'Este correo ya tiene una cuenta. Inicia sesión.'
    if (msg.includes('User already registered')) return 'Este correo ya tiene una cuenta. Inicia sesión.'
    if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos.'
    if (msg.includes('invalid_credentials')) return 'Email o contraseña incorrectos.'
    if (msg.includes('Password should')) return 'La contraseña debe tener al menos 6 caracteres.'
    if (msg.includes('Unable to validate')) return 'Email o contraseña incorrectos.'
    return 'Ha ocurrido un error, inténtalo de nuevo.'
  }

  const handleSubmit = async () => {
    if (!email || !password) return
    setCargando(true)
    setError(null)

    if (esRegistro) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      setCargando(false)

      if (error) {
        setError(mensajeError(error.message))
        return
      }

      onLogin(data.user)
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setCargando(false)

      if (error) {
        setError(mensajeError(error.message))
        return
      }

      onLogin(data.user)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) setError('Error al iniciar sesión con Google')
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-logo">
        <img src={logo} alt="Hoylo" />
      </div>

      <div className="onboarding-content">
        <p className="guia-intro">{esRegistro ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</p>
        <p className="guia-texto">
          {esRegistro ? 'Únete a Hoylo y empieza tus retos.' : 'Inicia sesión para continuar.'}
        </p>

        <button
          className="btn-opcion"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '8px' }}
          onClick={handleGoogleLogin}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.71v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.61z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33C2.44 15.98 5.48 18 9 18z"/>
            <path fill="#FBBC05" d="M3.95 10.71c-.18-.54-.28-1.12-.28-1.71s.1-1.17.28-1.71V4.96H.96C.35 6.18 0 7.55 0 9s.35 2.82.96 4.04l2.99-2.33z"/>
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="separador" style={{ margin: '12px 0' }}>
          <span>o</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            className="input-reto"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="input-reto"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
          />
        </div>

        {error && (
          <p style={{ fontSize: '13px', color: '#E24B4A', marginTop: '8px' }}>{error}</p>
        )}

        <button
          className="btn-opcion"
          style={{ textAlign: 'center', marginTop: '8px' }}
          onClick={() => { setEsRegistro(v => !v); setError(null) }}
        >
          {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>

      <button
        className="btn-principal"
        onClick={handleSubmit}
        disabled={cargando || !email || !password}
      >
        {cargando ? '...' : esRegistro ? 'Crear cuenta' : 'Entrar'}
      </button>
    </div>
  )
}

export default Login