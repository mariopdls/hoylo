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

export async function enviarSolicitudAmistad(usernameDestino) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfilDestino } = await supabase
    .from('perfiles')
    .select('id')
    .eq('username', usernameDestino)
    .maybeSingle()

  if (!perfilDestino) return { error: 'Usuario no encontrado' }
  if (perfilDestino.id === user.id) return { error: 'No puedes enviarte una solicitud a ti mismo' }

  const { data: yaSonAmigos } = await supabase
    .from('amigos')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('amigo_id', perfilDestino.id)
    .maybeSingle()

  if (yaSonAmigos) return { error: 'Ya sois amigos' }

  const { data: solicitudExistente } = await supabase
    .from('solicitudes_amistad')
    .select('id')
    .eq('de_usuario_id', user.id)
    .eq('para_usuario_id', perfilDestino.id)
    .eq('estado', 'pendiente')
    .maybeSingle()

  if (solicitudExistente) return { error: 'Ya enviaste una solicitud a este usuario' }

  const { error } = await supabase
    .from('solicitudes_amistad')
    .insert({
      de_usuario_id: user.id,
      para_usuario_id: perfilDestino.id
    })

  if (error) return { error: 'Error al enviar la solicitud' }
  return { ok: true }
}

export async function cargarSolicitudesPendientes() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('solicitudes_amistad')
    .select('id, de_usuario_id, creado_at')
    .eq('para_usuario_id', user.id)
    .eq('estado', 'pendiente')

  if (!data) return []

  const conPerfil = await Promise.all(
    data.map(async (s) => {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, username, avatar_url')
        .eq('id', s.de_usuario_id)
        .maybeSingle()
      return { ...s, perfil }
    })
  )

  return conPerfil
}

export async function aceptarSolicitudAmistad(solicitudId, deUsuarioId) {
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('amigos').insert([
    { usuario_id: user.id, amigo_id: deUsuarioId },
    { usuario_id: deUsuarioId, amigo_id: user.id }
  ])

  await supabase
    .from('solicitudes_amistad')
    .update({ estado: 'aceptada' })
    .eq('id', solicitudId)
}

export async function rechazarSolicitudAmistad(solicitudId) {
  await supabase
    .from('solicitudes_amistad')
    .update({ estado: 'rechazada' })
    .eq('id', solicitudId)
}

export async function cargarAmigos() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('amigos')
    .select('amigo_id')
    .eq('usuario_id', user.id)

  if (!data) return []

  const conPerfil = await Promise.all(
    data.map(async (a) => {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, username, avatar_url')
        .eq('id', a.amigo_id)
        .maybeSingle()
      return perfil ? { ...perfil, id: a.amigo_id } : null
    })
  )

  return conPerfil.filter(Boolean)
}

export async function cargarSolicitudesReto() {
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('solicitudes_reto')
    .select('id, reto_id, usuario_id, estado')
    .eq('para_admin_id', user.id)
    .eq('estado', 'pendiente')

  if (!data) return []

  const conDatos = await Promise.all(
    data.map(async (s) => {
      const { data: reto } = await supabase
        .from('retos')
        .select('titulo, emoji, dias')
        .eq('id', s.reto_id)
        .maybeSingle()

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, username')
        .eq('id', s.usuario_id)
        .maybeSingle()

      return { ...s, reto, perfil }
    })
  )

  return conDatos
}

export async function aceptarSolicitudReto(solicitudId, retoId, usuarioId) {
  await supabase
    .from('participantes_reto')
    .insert({
      reto_id: retoId,
      usuario_id: usuarioId,
      rol: 'participante'
    })

  await supabase
    .from('solicitudes_reto')
    .update({ estado: 'aceptada' })
    .eq('id', solicitudId)
}

export async function rechazarSolicitudReto(solicitudId) {
  await supabase
    .from('solicitudes_reto')
    .update({ estado: 'rechazada' })
    .eq('id', solicitudId)
}

export async function buscarUsuarios(query) {
  if (!query || query.length < 2) return []

  const { data } = await supabase
    .from('perfiles')
    .select('id, nombre, username, avatar_url, perfil_publico')
    .ilike('username', `%${query}%`)
    .eq('perfil_publico', true)
    .limit(8)

  return data || []
}

export async function cargarAmigosenComun(otroUsuarioId) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data: misAmigos } = await supabase
    .from('amigos')
    .select('amigo_id')
    .eq('usuario_id', user.id)

  const { data: susAmigos } = await supabase
    .from('amigos')
    .select('amigo_id')
    .eq('usuario_id', otroUsuarioId)

  if (!misAmigos || !susAmigos) return []

  const misIds = new Set(misAmigos.map(a => a.amigo_id))
  const enComun = susAmigos.filter(a => misIds.has(a.amigo_id))

  const conPerfil = await Promise.all(
    enComun.map(async (a) => {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, username, avatar_url')
        .eq('id', a.amigo_id)
        .maybeSingle()
      return perfil
    })
  )

  return conPerfil.filter(Boolean)
}