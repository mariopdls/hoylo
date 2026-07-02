import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cargarRetosPopulares, cargarRetosDeAmigos, pedirUnirseAReto, cargarRetosDelMomento } from '../services/descubrir'

function Descubrir({ usuario, onAñadirReto, onToast }) {
  const { t } = useTranslation()
  const [tab, setTab] = useState('populares')
  const [populares, setPopulares] = useState([])
  const [deAmigos, setDeAmigos] = useState([])
  const [retosIA, setRetosIA] = useState([])
  const [cargando, setCargando] = useState(true)
  const [solicitados, setSolicitados] = useState(new Set())
  const [añadidos, setAñadidos] = useState(new Set())

  useEffect(() => { cargarDatos() }, [])

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
  onToast?.(resultado.error || t('toast.solicitudEnviada'), resultado.error ? 'error' : 'ok')
  if (!resultado.error) setSolicitados(prev => new Set(prev).add(retoId))
  }

  const handleAñadirRetoIA = (reto) => {
  onAñadirReto({ emoji: reto.emoji, titulo: reto.titulo, dias: reto.dias })
  setAñadidos(prev => new Set(prev).add(reto.id))
  onToast?.(t('descubrir.añadido'))
  }

  if (cargando) return <div style={{ padding: '20px' }}><p className="guia-texto">{t('descubrir.cargando')}</p></div>

  const listaActual = tab === 'populares' ? populares : tab === 'amigos' ? deAmigos : retosIA

  return (
    <div style={{ paddingBottom: '20px' }}>
      <p className="guia-intro" style={{ marginBottom: '16px' }}>{t('descubrir.titulo')}</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button className={`btn-dias ${tab === 'populares' ? 'btn-dias-activo' : ''}`} onClick={() => setTab('populares')}>{t('descubrir.populares')}</button>
        <button className={`btn-dias ${tab === 'amigos' ? 'btn-dias-activo' : ''}`} onClick={() => setTab('amigos')}>{t('descubrir.deAmigos')}</button>
        <button className={`btn-dias ${tab === 'ia' ? 'btn-dias-activo' : ''}`} onClick={() => setTab('ia')}>{t('descubrir.delMomento')}</button>
      </div>

      {listaActual.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            {tab === 'populares' ? '🔥' : tab === 'amigos' ? '👥' : '✨'}
          </div>
          <p className="empty-state-title">
            {tab === 'populares' ? t('descubrir.sinPopulares') : tab === 'amigos' ? t('descubrir.sinAmigos') : t('descubrir.sinIA')}
          </p>
          <p className="empty-state-text">
            {tab === 'populares' ? t('descubrir.sinPopularesTexto') : tab === 'amigos' ? t('descubrir.sinAmigosTexto') : t('descubrir.sinIATexto')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {listaActual.map((reto, i) => (
            <div key={reto.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', animation: `staggerIn 0.3s ease ${i * 0.05}s both`, boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '28px' }}>{reto.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p className="reto-titulo">{reto.titulo}</p>
                  <p className="reto-dias">
                    {reto.dias} {t('amigos.dias')}
                    {tab === 'populares' && reto.numParticipantes > 0 && ` · ${reto.numParticipantes} ${t('descubrir.participantes')}`}
                    {tab === 'amigos' && reto.creador && ` · @${reto.creador.username}`}
                  </p>
                </div>
              </div>
              {tab === 'ia' ? (
                <button
                  className="btn-principal"
                  style={{ opacity: añadidos.has(reto.id) ? 0.5 : 1, cursor: añadidos.has(reto.id) ? 'not-allowed' : 'pointer' }}
                  disabled={añadidos.has(reto.id)}
                  onClick={() => handleAñadirRetoIA(reto)}
                >
                  {añadidos.has(reto.id) ? t('descubrir.añadido') : t('descubrir.añadirReto')}
                </button>
              ) : (
                <button
                  className="btn-principal"
                  style={{ opacity: solicitados.has(reto.id) ? 0.5 : 1, cursor: solicitados.has(reto.id) ? 'not-allowed' : 'pointer' }}
                  disabled={solicitados.has(reto.id)}
                  onClick={() => handlePedirUnirse(reto.id)}
                >
                  {solicitados.has(reto.id) ? t('descubrir.solicitudEnviada') : t('descubrir.pedirUnirme')}
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