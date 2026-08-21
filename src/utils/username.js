export const USERNAME_MAX_LENGTH = 12

const PALABRAS_PROHIBIDAS = [
  'puta', 'puto', 'culo', 'mierda', 'gilipollas', 'idiota', 'imbecil',
  'cabron', 'cabrona', 'maricon', 'marica', 'zorra', 'coño', 'cojon',
  'pene', 'penis', 'porno', 'porn', 'follar', 'bastardo', 'bastarda',
  'mamon', 'mamona', 'sudaca', 'tonto', 'tonta'
]

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
