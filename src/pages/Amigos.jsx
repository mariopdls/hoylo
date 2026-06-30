import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'
import { cargarInvitacionesPendientes, aceptarInvitacion, rechazarInvitacion } from '../services/social'

function Amigos({ usuario, onRecargarRetos }) {
  const { t } = useTranslation()
  const [invitaciones, setInvitaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const { data } = await supabase
      .from('perfiles')
      .select('username, nombre')
      .eq('id', usuario.id)
      .maybeSingle()

    setPerfil(data)

    if (data?.username) {
      const invs = await cargarInvitacionesPendientes(data.username)
      setInvitaciones(invs)
    }

    setCargando(false)
  }

  const handleAceptar = async (inv) => {
    await aceptarInvitacion(inv.id, inv.reto_id, usuario.id)
    setInvitaciones(prev => prev.filter(i => i.id !== inv.id))
    onRecargarRetos()
  }

  const handleRechazar = async (inv) => {
    await rechazarInvitacion(inv.id)
    setInvitaciones(prev => prev.filter(i => i.id !== inv.id))
  }

  if (cargando) return (
    <div style={{ padding: '20px' }}>
      <p className="guia-texto">Cargando...</p>
    </div>
  )

  return (
    <div style={{ paddingBottom: '20px' }}>
      <p className="guia-intro" style={{ marginBottom: '16px' }}>Amigos</p>

      <div style={{ marginBottom: '24px' }}>
        <p className="detalle-seccion-titulo" style={{ marginBottom: '12px' }}>Invitaciones pendientes</p>

        {invitaciones.length === 0 ? (
          <div style={{
            background: 'var(--bg-card)', border: '0.5px solid var(--border)',
            borderRadius: '14px', padding: '20px', textAlign: 'center'
          }}>
            <p className="guia-texto" style={{ fontSize: '13px' }}>No tienes invitaciones pendientes</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {invitaciones.map(inv => (
              <div key={inv.id} style={{
                background: 'var(--bg-card)', border: '0.5px solid var(--border)',
                borderRadius: '14px', padding: '14px 16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{inv.retos?.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <p className="reto-titulo">{inv.retos?.titulo}</p>
                    <p className="reto-dias">
                      {inv.retos?.dias} días · de @{inv.perfiles?.username}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-principal"
                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '0.5px solid var(--border)' }}
                    onClick={() => handleRechazar(inv)}
                  >
                    Rechazar
                  </button>
                  <button
                    className="btn-principal"
                    onClick={() => handleAceptar(inv)}
                  >
                    Unirme
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="detalle-seccion-titulo" style={{ marginBottom: '4px' }}>Tu username</p>
        <p className="guia-texto" style={{ fontSize: '13px', marginBottom: '12px' }}>
          Comparte tu username para que tus amigos puedan invitarte a retos.
        </p>
        <div style={{
          background: 'var(--bg-card)', border: '1.5px solid var(--accent)',
          borderRadius: '14px', padding: '14px 16px', textAlign: 'center'
        }}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>
            @{perfil?.username || '—'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Amigos