import { supabase } from './supabase'

export async function cargarRetos(usuarioId) {
  const { data: retosDirectos } = await supabase
    .from('retos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('creado_at', { ascending: true })

  const { data: participaciones } = await supabase
    .from('participantes_reto')
    .select('reto_id, retos(*)')
    .eq('usuario_id', usuarioId)
    .neq('rol', 'admin')

  const retosComoParticipante = participaciones
    ?.map(p => p.retos)
    .filter(r => r && !retosDirectos?.find(rd => rd.id === r.id)) || []

  return [...(retosDirectos || []), ...retosComoParticipante]
}

export async function guardarReto(usuarioId, reto) {
  const { data, error } = await supabase
    .from('retos')
    .insert({
      usuario_id: usuarioId,
      emoji: reto.emoji,
      titulo: reto.titulo,
      dias: reto.dias,
      dia_actual: 1
    })
    .select()
    .single()

  if (error) {
    console.error('Error guardando reto:', error)
    return null
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

  const { data: participante } = await supabase
    .from('participantes_reto')
    .select('dias_completados')
    .eq('reto_id', retoId)
    .eq('usuario_id', user.id)
    .single()

  await supabase
    .from('participantes_reto')
    .update({
      foto_hoy: true,
      foto_url: fotoUrl,
      dias_completados: (participante?.dias_completados || 0) + 1
    })
    .eq('reto_id', retoId)
    .eq('usuario_id', user.id)
}

export async function resetearFotosDia() {
  const { error } = await supabase
    .from('retos')
    .update({ foto_hoy: false })
    .eq('foto_hoy', true)

  if (error) console.error('Error reseteando fotos:', error)
}