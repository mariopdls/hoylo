// Obtener fecha local en lugar de UTC para sincronización correcta
function obtenerHoyLocal() {
  const hoy = new Date()
  return hoy.getFullYear() + '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
    String(hoy.getDate()).padStart(2, '0')
}

function obtenerAyerLocal() {
  const ayer = new Date(Date.now() - 86400000)
  return ayer.getFullYear() + '-' +
    String(ayer.getMonth() + 1).padStart(2, '0') + '-' +
    String(ayer.getDate()).padStart(2, '0')
}

export function calcularRachaVigente(rachaActual, ultimaFecha) {
  if (!ultimaFecha) return 0

  const hoy = obtenerHoyLocal()
  const ayer = obtenerAyerLocal()

  if (ultimaFecha === hoy || ultimaFecha === ayer) return rachaActual || 0
  return 0
}
