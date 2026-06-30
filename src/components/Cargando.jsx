import logo from '../assets/logo.png'

function Cargando() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      gap: '16px'
    }}>
      <img
        src={logo}
        alt="Hoylo"
        style={{
          width: '160px',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}
      />
    </div>
  )
}

export default Cargando