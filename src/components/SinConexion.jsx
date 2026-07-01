import logo from '../assets/logo3.png'

function SinConexion({ onReintentar }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--bg-secondary)', padding: '32px', textAlign: 'center', gap: '16px'
    }}>
      <img src={logo} alt="Hoylo" style={{ width: '120px', opacity: 0.6 }} />
      <i className="ti ti-wifi-off" style={{ fontSize: '40px', color: 'var(--text-secondary)' }}></i>
      <div>
        <p className="guia-intro">Sin conexión</p>
        <p className="guia-texto" style={{ marginTop: '6px' }}>
          Parece que no tienes internet. Comprueba tu conexión e inténtalo de nuevo.
        </p>
      </div>
      <button className="btn-principal" style={{ width: 'auto', padding: '12px 32px' }} onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  )
}

export default SinConexion