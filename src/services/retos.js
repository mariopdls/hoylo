import { supabase } from './supabase'

// Obtener fecha local en lugar de UTC para sincronización correcta de timezone
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

export async function cargarRetos(usuarioId) {
  const hoy = obtenerHoyLocal()

  const [{ data: retosDirectos }, { data: participaciones }] = await Promise.all([
    supabase
      .from('retos')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('creado_at', { ascending: true }),
    supabase
      .from('participantes_reto')
      .select('reto_id, dias_completados, foto_url, ultima_foto_fecha, retos(*)')
      .eq('usuario_id', usuarioId)
  ])

  const misParticipaciones = new Map((participaciones || []).map(p => [p.reto_id, p]))

  const fusionarProgreso = (reto) => {
    const p = misParticipaciones.get(reto.id)
    const diasCompletados = p?.dias_completados || 0
    return {
      ...reto,
      dias_completados: diasCompletados,
      foto_url: p?.foto_url ?? reto.foto_url,
      foto_hoy: p?.ultima_foto_fecha === hoy,
      dia_actual: Math.min(diasCompletados + 1, reto.dias)
    }
  }

  const retosComoParticipante = (participaciones || [])
    .map(p => p.retos)
    .filter(r => r && !retosDirectos?.find(rd => rd.id === r.id))

  return [...(retosDirectos || []), ...retosComoParticipante].map(fusionarProgreso)
}

export async function guardarReto(usuarioId, reto) {
  // VALIDACIÓN: Título debe tener 1-50 caracteres
  const titulo = reto.titulo?.trim() || ''
  if (!titulo || titulo.length < 1) {
    return { error: 'El título no puede estar vacío' }
  }
  if (titulo.length > 50) {
    return { error: 'El título no puede superar 50 caracteres' }
  }

  const { data, error } = await supabase
    .from('retos')
    .insert({
      usuario_id: usuarioId,
      emoji: reto.emoji,
      titulo: titulo,
      dias: reto.dias,
      dia_actual: 1,
      es_publico: reto.es_publico || false
    })
    .select()
    .single()

  if (error) {
    console.error('Error guardando reto:', error)
    return { error: 'Error al guardar el reto' }
  }

  await supabase
    .from('participantes_reto')
    .insert({
      reto_id: data.id,
      usuario_id: usuarioId,
      rol: 'admin'
    })

  return data
}

export async function eliminarReto(retoId) {
  const { error } = await supabase
    .from('retos')
    .delete()
    .eq('id', retoId)

  if (error) console.error('Error eliminando reto:', error)
}

export async function actualizarTituloReto(retoId, titulo) {
  const { error } = await supabase
    .from('retos')
    .update({ titulo })
    .eq('id', retoId)

  if (error) console.error('Error actualizando reto:', error)
}


export async function completarDia(retoId, fotoUrl = null) {
  const { data: { user } } = await supabase.auth.getUser()
  const hoy = obtenerHoyLocal()

  const { data: participante } = await supabase
    .from('participantes_reto')
    .select('dias_completados, ultima_foto_fecha, foto_url')
    .eq('reto_id', retoId)
    .eq('usuario_id', user.id)
    .single()

  if (participante?.ultima_foto_fecha === hoy) {
    return { error: 'Ya subiste la foto de hoy' }
  }

  const { error } = await supabase
    .from('participantes_reto')
    .update({
      ultima_foto_fecha: hoy,
      foto_url: fotoUrl,
      dias_completados: (participante?.dias_completados || 0) + 1
    })
    .eq('reto_id', retoId)
    .eq('usuario_id', user.id)

  if (error) return { error: 'Error al guardar el progreso' }

  const { data: perfilActual } = await supabase
    .from('perfiles')
    .select('racha_actual, mejor_racha, racha_ultima_fecha')
    .eq('id', user.id)
    .single()

  const ayer = obtenerAyerLocal()

  let nuevaRacha
  if (perfilActual?.racha_ultima_fecha === hoy) {
    nuevaRacha = perfilActual.racha_actual || 1
  } else if (perfilActual?.racha_ultima_fecha === ayer) {
    nuevaRacha = (perfilActual.racha_actual || 0) + 1
  } else {
    nuevaRacha = 1
  }

  const mejorRacha = Math.max(nuevaRacha, perfilActual?.mejor_racha || 0)

  await supabase
    .from('perfiles')
    .update({ racha_actual: nuevaRacha, mejor_racha: mejorRacha, racha_ultima_fecha: hoy })
    .eq('id', user.id)

  return { ok: true }
}