import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import logo from '../../assets/logo3.png'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [esRegistro, setEsRegistro] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        onLogin(session.user)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const mensajeError = (msg) => {
    if (msg.includes('already registered')) return 'Este correo ya tiene una cuenta. Inicia sesión.'
    if (msg.includes('User already registered')) return 'Este correo ya tiene una cuenta. Inicia sesión.'
    if (msg.includes('Invalid login')) return 'Email o contraseña incorrectos.'
    if (msg.includes('invalid_credentials')) return 'Email o contraseña incorrectos.'
    if (msg.includes('Password should')) return 'La contraseña debe tener al menos 6 caracteres.'
    if (msg.includes('Unable to validate')) return 'Email o contraseña incorrectos.'
    if (msg.includes('over_email_send_rate_limit') || msg.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos.'
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

      if (data?.user?.identities?.length === 0) {
        setError('Este correo ya tiene una cuenta. Inicia sesión.')
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
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