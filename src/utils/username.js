export const USERNAME_MAX_LENGTH = 12
export const NOMBRE_MAX_LENGTH = 24

const PALABRAS_PROHIBIDAS = [
  'puta', 'puto', 'culo', 'mierda', 'gilipollas', 'idiota', 'imbecil',
  'cabron', 'cabrona', 'maricon', 'marica', 'zorra', 'coño', 'cojon',
  'pene', 'penis', 'porno', 'porn', 'follar', 'bastardo', 'bastarda',
  'mamon', 'mamona', 'sudaca', 'tonto', 'tonta'
]

export function formatearNombreVisible(valor = '') {
  return normalizarNombre(valor)
    .split(' ')
    .filter(Boolean)
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ')
    .slice(0, NOMBRE_MAX_LENGTH)
}

export function normalizarNombre(valor = '') {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ'\-\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, NOMBRE_MAX_LENGTH)
}

export function formatearUsernameVisible(valor = '') {
  return normalizarUsername(valor)
}

export function normalizarUsername(valor = '') {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, USERNAME_MAX_LENGTH)
}

export function validarUsername(valor = '') {
  const limpio = normalizarUsername(valor)

  if (!limpio) {
    return { limpio, valido: false, razon: 'vacio' }
  }

  if (limpio.length < 3) {
    return { limpio, valido: false, razon: 'longitud' }
  }

  if (limpio.length > USERNAME_MAX_LENGTH) {
    return { limpio, valido: false, razon: 'longitud' }
  }

  const tienePalabraProhibida = PALABRAS_PROHIBIDAS.some(palabra => limpio.includes(palabra))
  if (tienePalabraProhibida) {
    return { limpio, valido: false, razon: 'prohibido' }
  }

  return { limpio, valido: true, razon: null }
}
