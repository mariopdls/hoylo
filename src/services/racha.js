export function calcularRachaVigente(rachaActual, ultimaFecha) {
  if (!ultimaFecha) return 0

  const hoy = new Date().toISOString().split('T')[0]
  const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (ultimaFecha === hoy || ultimaFecha === ayer) return rachaActual || 0
  return 0
}
