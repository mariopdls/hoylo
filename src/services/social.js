import { supabase } from './supabase'

export async function invitarAmigo(retoId, username) {
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('id')
    .eq('username', username)
    .maybeSingle()

  if (!perfil) return { error: 'Usuario no encontrado' }

  const { data: yaParticipa } = await supabase
    .from('participantes_reto')
    .select('id')
    .eq('reto_id', retoId)
    .eq('usuario_id', perfil.id)
    .maybeSingle()

  if (yaParticipa) return { error: 'Este usuario ya participa en el reto' }

  const { error } = await supabase
    .from('invitaciones')
    .insert({
      reto_id: retoId,
      para_username: username,
      de_usuario_id: (await supabase.auth.getUser()).data.user.id
    })

  if (error) return { error: 'Error al enviar la invitación' }
  return { ok: true }
}

export async function cargarInvitacionesPendientes(username) {
  const { data } = await supabase
    .from('invitaciones')
    .select(`
      id,
      reto_id,
      de_usuario_id,
      estado,
      retos (titulo, emoji, dias)
    `)
    .eq('para_username', username)
    .eq('estado', 'pendiente')

  if (!data) return []

  const invitacionesConPerfil = await Promise.all(
    data.map(async (inv) => {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, username')
        .eq('id', inv.de_usuario_id)
        .maybeSingle()
      return { ...inv, perfiles: perfil }
    })
  )

  return invitacionesConPerfil
}

export async function aceptarInvitacion(invitacionId, retoId, usuarioId) {
  await supabase
    .from('participantes_reto')
    .insert({
      reto_id: retoId,
      usuario_id: usuarioId,
      rol: 'participante'
    })

  await supabase
    .from('invitaciones')
    .update({ estado: 'aceptada' })
    .eq('id', invitacionId)
}

export async function rechazarInvitacion(invitacionId) {
  await supabase
    .from('invitaciones')
    .update({ estado: 'rechazada' })
    .eq('id', invitacionId)
}

export async function cargarParticipantes(retoId) {
  const { data } = await supabase
    .from('participantes_reto')
    .select('id, rol, foto_hoy, foto_url, dias_completados, usuario_id')
    .eq('reto_id', retoId)

  if (!data) return []

  const participantesConPerfil = await Promise.all(
    data.map(async (p) => {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, username, avatar_url')
        .eq('id', p.usuario_id)
        .maybeSingle()
      return { ...p, perfiles: perfil }
    })
  )

  return participantesConPerfil
}

export async function abandonarReto(retoId, usuarioId) {
  await supabase
    .from('participantes_reto')
    .delete()
    .eq('reto_id', retoId)
    .eq('usuario_id', usuarioId)
}