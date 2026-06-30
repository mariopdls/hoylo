import { useState } from 'react'
import northamerica from '../assets/continentes/northamerica.png'
import southamerica from '../assets/continentes/southamerica.png'
import asia from '../assets/continentes/asia.png'
import europe from '../assets/continentes/europe.png'
import africa from '../assets/continentes/africa.png'
import oceania from '../assets/continentes/oceania.png'

const CONTINENTES = [
  { id: 'europa', nombre: 'Europa', img: europe },
  { id: 'norteamerica', nombre: 'Norte América', img: northamerica },
  { id: 'sudamerica', nombre: 'Sud América', img: southamerica },
  { id: 'africa', nombre: 'África', img: africa },
  { id: 'asia', nombre: 'Asia', img: asia },
  { id: 'oceania', nombre: 'Oceanía', img: oceania },
]

const PAISES = {
  europa: ['España', 'Francia', 'Alemania', 'Italia', 'Portugal', 'Reino Unido', 'Países Bajos', 'Bélgica', 'Suiza', 'Austria', 'Polonia', 'Suecia', 'Noruega', 'Dinamarca', 'Finlandia', 'Grecia', 'Rumanía', 'Hungría', 'República Checa', 'Ucrania', 'Otro'],
  norteamerica: ['Estados Unidos', 'Canadá', 'México', 'Cuba', 'Guatemala', 'Honduras', 'El Salvador', 'Nicaragua', 'Costa Rica', 'Panamá', 'República Dominicana', 'Otro'],
  sudamerica: ['Colombia', 'Argentina', 'Chile', 'Perú', 'Venezuela', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Brasil', 'Otro'],
  africa: ['Nigeria', 'Etiopía', 'Egipto', 'Sudáfrica', 'Tanzania', 'Kenia', 'Ghana', 'Marruecos', 'Mozambique', 'Argelia', 'Angola', 'Camerún', 'Senegal', 'Túnez', 'Otro'],
  asia: ['China', 'India', 'Japón', 'Corea del Sur', 'Indonesia', 'Tailandia', 'Vietnam', 'Filipinas', 'Turquía', 'Arabia Saudí', 'Israel', 'Emiratos Árabes', 'Pakistán', 'Bangladesh', 'Otro'],
  oceania: ['Australia', 'Nueva Zelanda', 'Papúa Nueva Guinea', 'Fiji', 'Islas Salomón', 'Vanuatu', 'Samoa', 'Tonga', 'Otro']
}

const CIUDADES = {
  'España': ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Otra'],
  'Francia': ['París', 'Marsella', 'Lyon', 'Toulouse', 'Niza', 'Otra'],
  'Alemania': ['Berlín', 'Hamburgo', 'Múnich', 'Colonia', 'Frankfurt', 'Otra'],
  'Italia': ['Roma', 'Milán', 'Nápoles', 'Turín', 'Palermo', 'Otra'],
  'Portugal': ['Lisboa', 'Oporto', 'Braga', 'Coimbra', 'Otra'],
  'Reino Unido': ['Londres', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Otra'],
  'Países Bajos': ['Ámsterdam', 'Rotterdam', 'La Haya', 'Utrecht', 'Otra'],
  'Bélgica': ['Bruselas', 'Amberes', 'Gante', 'Brujas', 'Otra'],
  'Suiza': ['Zúrich', 'Ginebra', 'Basilea', 'Berna', 'Otra'],
  'Austria': ['Viena', 'Graz', 'Linz', 'Salzburgo', 'Otra'],
  'Polonia': ['Varsovia', 'Cracovia', 'Lodz', 'Wroclaw', 'Otra'],
  'Suecia': ['Estocolmo', 'Gotemburgo', 'Malmö', 'Uppsala', 'Otra'],
  'Noruega': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Otra'],
  'Dinamarca': ['Copenhague', 'Aarhus', 'Odense', 'Aalborg', 'Otra'],
  'Finlandia': ['Helsinki', 'Espoo', 'Tampere', 'Turku', 'Otra'],
  'Grecia': ['Atenas', 'Tesalónica', 'Patras', 'Heraclión', 'Otra'],
  'México': ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Otra'],
  'Estados Unidos': ['Nueva York', 'Los Ángeles', 'Chicago', 'Houston', 'Miami', 'Otra'],
  'Canadá': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Otra'],
  'Cuba': ['La Habana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Otra'],
  'Costa Rica': ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Otra'],
  'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata', 'Otra'],
  'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Otra'],
  'Chile': ['Santiago', 'Valparaíso', 'Concepción', 'Antofagasta', 'Otra'],
  'Brasil': ['São Paulo', 'Río de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Otra'],
  'Perú': ['Lima', 'Arequipa', 'Trujillo', 'Cusco', 'Otra'],
  'Venezuela': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Otra'],
  'Ecuador': ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Otra'],
  'Bolivia': ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Otra'],
  'Uruguay': ['Montevideo', 'Salto', 'Paysandú', 'Maldonado', 'Otra'],
  'Paraguay': ['Asunción', 'Ciudad del Este', 'San Lorenzo', 'Otra'],
  'China': ['Pekín', 'Shanghái', 'Cantón', 'Shenzhen', 'Otra'],
  'Japón': ['Tokio', 'Osaka', 'Kioto', 'Yokohama', 'Otra'],
  'India': ['Bombay', 'Delhi', 'Bangalore', 'Hyderabad', 'Otra'],
  'Corea del Sur': ['Seúl', 'Busan', 'Incheon', 'Daegu', 'Otra'],
  'Indonesia': ['Yakarta', 'Surabaya', 'Bandung', 'Bekasi', 'Otra'],
  'Tailandia': ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Otra'],
  'Vietnam': ['Ho Chi Minh', 'Hanói', 'Da Nang', 'Hai Phong', 'Otra'],
  'Turquía': ['Estambul', 'Ankara', 'Esmirna', 'Bursa', 'Otra'],
  'Arabia Saudí': ['Riad', 'Yeda', 'La Meca', 'Medina', 'Otra'],
  'Israel': ['Tel Aviv', 'Jerusalén', 'Haifa', 'Beerseba', 'Otra'],
  'Emiratos Árabes': ['Dubái', 'Abu Dabi', 'Sharjah', 'Ajman', 'Otra'],
  'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Otra'],
  'Egipto': ['El Cairo', 'Alejandría', 'Giza', 'Shubra el Jima', 'Otra'],
  'Sudáfrica': ['Johannesburgo', 'Ciudad del Cabo', 'Durban', 'Pretoria', 'Otra'],
  'Marruecos': ['Casablanca', 'Fez', 'Marrakech', 'Rabat', 'Otra'],
  'Australia': ['Sídney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaida', 'Otra'],
  'Nueva Zelanda': ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Otra'],
}

function SelectorUbicacion({ onSelect }) {
  const [nivel, setNivel] = useState('continente')
  const [continenteSeleccionado, setContinenteSeleccionado] = useState(null)
  const [paisSeleccionado, setPaisSeleccionado] = useState(null)
  const [otraCiudad, setOtraCiudad] = useState('')

  const seleccionarContinente = (c) => {
    setContinenteSeleccionado(c)
    setNivel('pais')
  }

  const seleccionarPais = (p) => {
    if (p === 'Otro') {
      onSelect({ pais: 'Otro', ciudad: '' })
      return
    }
    setPaisSeleccionado(p)
    setNivel('ciudad')
  }

  const seleccionarCiudad = (ciudad) => {
    if (ciudad === 'Otra') {
      setNivel('otra')
      return
    }
    onSelect({ pais: paisSeleccionado, ciudad })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {nivel !== 'continente' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '13px', padding: 0 }}
            onClick={() => { setNivel('continente'); setPaisSeleccionado(null) }}
          >
            Continentes
          </button>
          {continenteSeleccionado && (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>›</span>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: nivel === 'pais' ? 'var(--text-primary)' : 'var(--accent)', fontSize: '13px', padding: 0 }}
                onClick={() => nivel !== 'pais' && setNivel('pais')}
              >
                {continenteSeleccionado.nombre}
              </button>
            </>
          )}
          {paisSeleccionado && (
            <>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>›</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{paisSeleccionado}</span>
            </>
          )}
        </div>
      )}

      {nivel === 'continente' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {CONTINENTES.map((c, i) => (
            <button
              key={c.id}
              onClick={() => seleccionarContinente(c)}
              style={{
                background: 'var(--bg-card)', border: '0.5px solid var(--border)',
                borderRadius: '14px', padding: '16px 12px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                animation: `staggerIn 0.3s ease ${i * 0.08}s both`
              }}
            >
              <img src={c.img} alt={c.nombre} style={{ width: '100px', height: '70px', objectFit: 'contain' }} />
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{c.nombre}</span>
            </button>
          ))}
        </div>
      )}

      {nivel === 'pais' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
          {PAISES[continenteSeleccionado.id].map((p, i) => (
            <button
              key={p}
              onClick={() => seleccionarPais(p)}
              style={{
                background: 'var(--bg-card)', border: '0.5px solid var(--border)',
                borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
                textAlign: 'left', fontSize: '14px', color: 'var(--text-primary)',
                animation: `staggerIn 0.3s ease ${i * 0.05}s both`
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {nivel === 'ciudad' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
          {(CIUDADES[paisSeleccionado] || ['Otra']).map((c, i) => (
            <button
              key={c}
              onClick={() => seleccionarCiudad(c)}
              style={{
                background: 'var(--bg-card)', border: '0.5px solid var(--border)',
                borderRadius: '10px', padding: '10px 14px', cursor: 'pointer',
                textAlign: 'left', fontSize: '14px', color: 'var(--text-primary)',
                animation: `staggerIn 0.3s ease ${i * 0.05}s both`
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {nivel === 'otra' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'staggerIn 0.3s ease both' }}>
          <input
            className="input-reto"
            placeholder="Escribe tu ciudad"
            value={otraCiudad}
            onChange={e => setOtraCiudad(e.target.value)}
          />
          <button
            className="btn-principal"
            onClick={() => onSelect({ pais: paisSeleccionado, ciudad: otraCiudad })}
            disabled={!otraCiudad.trim()}
          >
            Confirmar
          </button>
        </div>
      )}

    </div>
  )
}

export default SelectorUbicacion