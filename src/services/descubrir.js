import { supabase } from './supabase'

export async function cargarRetosPopulares(limite = 10) {
  const { data: participaciones } = await supabase
    .from('participantes_reto')
    .select('reto_id')

  if (!participaciones) return []

  const conteo = {}
  participaciones.forEach(p => {
    conteo[p.reto_id] = (conteo[p.reto_id] || 0) + 1
  })

  const retoIdsOrdenados = Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([id]) => id)

  if (retoIdsOrdenados.length === 0) return []

  const { data: retos } = await supabase
    .from('retos')
    .select('*')
    .in('id', retoIdsOrdenados)
    .eq('es_publico', true)

  return (retos || []).map(r => ({
    ...r,
    numParticipantes: conteo[r.id] || 0
  })).sort((a, b) => b.numParticipantes - a.numParticipantes)
}

export async function cargarRetosDeAmigos(usuarioId) {
  const { data: amigos } = await supabase
    .from('amigos')
    .select('amigo_id')
    .eq('usuario_id', usuarioId)

  if (!amigos || amigos.length === 0) return []

  const amigoIds = amigos.map(a => a.amigo_id)

  const { data: retosAmigos } = await supabase
    .from('retos')
    .select('*')
    .in('usuario_id', amigoIds)
    .eq('es_publico', true)

  if (!retosAmigos) return []

  const { data: misParticipaciones } = await supabase
    .from('participantes_reto')
    .select('reto_id')
    .eq('usuario_id', usuarioId)

  const misRetoIds = new Set((misParticipaciones || []).map(p => p.reto_id))

  const retosFiltrados = retosAmigos.filter(r => !misRetoIds.has(r.id))

  const conPerfil = await Promise.all(
    retosFiltrados.map(async (r) => {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, username')
        .eq('id', r.usuario_id)
        .maybeSingle()
      return { ...r, creador: perfil }
    })
  )

  return conPerfil
}

export async function pedirUnirseAReto(retoId) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data: reto } = await supabase
    .from('retos')
    .select('usuario_id')
    .eq('id', retoId)
    .single()

  const { data: yaParticipa } = await supabase
    .from('participantes_reto')
    .select('id')
    .eq('reto_id', retoId)
    .eq('usuario_id', user.id)
    .maybeSingle()

  if (yaParticipa) return { error: 'Ya participas en este reto' }

  const { data: solicitudExistente } = await supabase
    .from('solicitudes_reto')
    .select('id')
    .eq('reto_id', retoId)
    .eq('usuario_id', user.id)
    .eq('estado', 'pendiente')
    .maybeSingle()

  if (solicitudExistente) return { error: 'Ya enviaste una solicitud' }

  const { error } = await supabase
    .from('solicitudes_reto')
    .insert({
      reto_id: retoId,
      usuario_id: user.id,
      para_admin_id: reto.usuario_id
    })

  if (error) return { error: 'Error al enviar la solicitud' }
  return { ok: true }
}