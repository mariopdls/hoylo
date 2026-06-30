import { useState, useEffect } from 'react'
import { cargarRetosPopulares, cargarRetosDeAmigos, pedirUnirseAReto, cargarRetosDelMomento } from '../services/descubrir'

function Descubrir({ usuario, onAñadirReto }) {
  const [tab, setTab] = useState('populares')
  const [populares, setPopulares] = useState([])
  const [deAmigos, setDeAmigos] = useState([])
  const [retosIA, setRetosIA] = useState([])
  const [cargando, setCargando] = useState(true)
  const [solicitados, setSolicitados] = useState(new Set())
  const [añadidos, setAñadidos] = useState(new Set())
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const [pop, amig, ia] = await Promise.all([
      cargarRetosPopulares(),
      cargarRetosDeAmigos(usuario.id),
      cargarRetosDelMomento()
    ])
    setPopulares(pop)
    setDeAmigos(amig)
    setRetosIA(ia)
    setCargando(false)
  }

  const handlePedirUnirse = async (retoId) => {
    const resultado = await pedirUnirseAReto(retoId)
    if (resultado.error) {
      setMensaje({ tipo: 'error', texto: resultado.error })
    } else {
      setSolicitados(prev => new Set(prev).add(retoId))
      setMensaje({ tipo: 'ok', texto: 'Solicitud enviada' })
    }
    setTimeout(() => setMensaje(null), 2500)
  }

  const handleAñadirRetoIA = (reto) => {
    onAñadirReto({ emoji: reto.emoji, titulo: reto.titulo, dias: reto.dias })
    setAñadidos(prev => new Set(prev).add(reto.id))
    setMensaje({ tipo: 'ok', texto: 'Reto añadido a tu lista' })
    setTimeout(() => setMensaje(null), 2500)
  }

  if (cargando) return (
    <div style={{ padding: '20px' }}>
      <p className="guia-texto">Cargando...</p>
    </div>
  )

  const listaActual = tab === 'populares' ? populares : tab === 'amigos' ? deAmigos : retosIA

  return (
    <div style={{ paddingBottom: '20px' }}>
      <p className="guia-intro" style={{ marginBottom: '16px' }}>Descubrir</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          className={`btn-dias ${tab === 'populares' ? 'btn-dias-activo' : ''}`}
          onClick={() => setTab('populares')}
        >
          🔥 Populares
        </button>
        <button
          className={`btn-dias ${tab === 'amigos' ? 'btn-dias-activo' : ''}`}
          onClick={() => setTab('amigos')}
        >
          👥 De amigos
        </button>
        <button
          className={`btn-dias ${tab === 'ia' ? 'btn-dias-activo' : ''}`}
          onClick={() => setTab('ia')}
        >
          ✨ Del momento
        </button>
      </div>

      {mensaje && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: `0.5px solid ${mensaje.tipo === 'ok' ? '#3B6D11' : '#E24B4A'}`,
          borderRadius: '10px', padding: '8px 12px', marginBottom: '12px'
        }}>
          <p style={{ fontSize: '12px', color: mensaje.tipo === 'ok' ? '#3B6D11' : '#E24B4A' }}>
            {mensaje.texto}
          </p>
        </div>
      )}

      {listaActual.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderRadius: '14px', padding: '24px', textAlign: 'center'
        }}>
          <p className="guia-texto" style={{ fontSize: '13px' }}>
            {tab === 'populares' && 'Aún no hay retos populares'}
            {tab === 'amigos' && 'Tus amigos no tienen retos públicos nuevos ahora mismo'}
            {tab === 'ia' && 'Generando retos del momento...'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {listaActual.map((reto, i) => (
            <div key={reto.id} style={{
              background: 'var(--bg-card)', border: '0.5px solid var(--border)',
              borderRadius: '14px', padding: '14px 16px',
              animation: `staggerIn 0.3s ease ${i * 0.05}s both`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '28px' }}>{reto.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p className="reto-titulo">{reto.titulo}</p>
                  <p className="reto-dias">
                    {reto.dias} días
                    {tab === 'populares' && reto.numParticipantes > 0 && ` · ${reto.numParticipantes} participantes`}
                    {tab === 'amigos' && reto.creador && ` · de @${reto.creador.username}`}
                    {tab === 'ia' && ' · sugerido por IA'}
                  </p>
                </div>
              </div>

              {tab === 'ia' ? (
                <button
                  className="btn-principal"
                  style={{
                    opacity: añadidos.has(reto.id) ? 0.5 : 1,
                    cursor: añadidos.has(reto.id) ? 'not-allowed' : 'pointer'
                  }}
                  disabled={añadidos.has(reto.id)}
                  onClick={() => handleAñadirRetoIA(reto)}
                >
                  {añadidos.has(reto.id) ? '✓ Añadido' : 'Añadir a mis retos'}
                </button>
              ) : (
                <button
                  className="btn-principal"
                  style={{
                    opacity: solicitados.has(reto.id) ? 0.5 : 1,
                    cursor: solicitados.has(reto.id) ? 'not-allowed' : 'pointer'
                  }}
                  disabled={solicitados.has(reto.id)}
                  onClick={() => handlePedirUnirse(reto.id)}
                >
                  {solicitados.has(reto.id) ? '✓ Solicitud enviada' : 'Pedir unirme'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Descubrir