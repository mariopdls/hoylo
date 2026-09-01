import { supabase } from './supabase'

export async function invitarAmigo(retoId, username) {
  // Validar que no sea una invitación vacía
  if (!username?.trim()) {
    return { error: 'Username requerido' }
  }

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

  const { data: { user } } = await supabase.auth.getUser()

  const { data: invitacionExistente } = await supabase
    .from('invitaciones')
    .select('id')
    .eq('reto_id', retoId)
    .eq('para_username', username)
    .eq('estado', 'pendiente')
    .maybeSingle()

  if (invitacionExistente) return { error: 'Ya enviaste una invitación a este usuario' }

  // PROTECCIÓN CONTRA DOUBLE-CLICK
  // El cliente debe verificar estado "enviando" en componente
  const { error } = await supabase
    .from('invitaciones')
    .insert({
      reto_id: retoId,
      para_username: username,
      de_usuario_id: user.id,
      estado: 'pendiente'
    })

  if (error) return { error: 'Error al enviar la invitación' }
  return { ok: true }
}

export async function cargarInvitacionesPendientes(username) {
  // ARREGLO DE N+1: Usar JOIN en lugar de Promise.all
  const { data, error } = await supabase
    .from('invitaciones')
    .select(`
      id,
      reto_id,
      de_usuario_id,
      estado,
      retos (titulo, emoji, dias),
      perfiles:de_usuario_id(nombre, username)
    `)
    .eq('para_username', username)
    .eq('estado', 'pendiente')

  if (error || !data) return []

  return data.map(inv => ({
    id: inv.id,
    reto_id: inv.reto_id,
    de_usuario_id: inv.de_usuario_id,
    estado: inv.estado,
    retos: inv.retos,
    perfiles: inv.perfiles
  }))
}

export async function aceptarInvitacion(invitacionId, retoId, usuarioId) {
  const { data: yaParticipa } = await supabase
    .from('participantes_reto')
    .select('id')
    .eq('reto_id', retoId)
    .eq('usuario_id', usuarioId)
    .maybeSingle()

  if (!yaParticipa) {
    const { error: errorParticipante } = await supabase
      .from('participantes_reto')
      .insert({
        reto_id: retoId,
        usuario_id: usuarioId,
        rol: 'participante'
      })

    if (errorParticipante) return { error: errorParticipante.message }
  }

  const { error } = await supabase
    .from('invitaciones')
    .update({ estado: 'aceptada' })
    .eq('id', invitacionId)

  if (error) return { error: error.message }
  return { ok: true }
}

export async function rechazarInvitacion(invitacionId) {
  const { error } = await supabase
    .from('invitaciones')
    .update({ estado: 'rechazada' })
    .eq('id', invitacionId)

  if (error) return { error: error.message }
  return { ok: true }
}

// Obtener fecha local en lugar de UTC
function obtenerHoyLocal() {
  const hoy = new Date()
  return hoy.getFullYear() + '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
    String(hoy.getDate()).padStart(2, '0')
}

export async function cargarParticipantes(retoId) {
  const hoy = obtenerHoyLocal()

  // ARREGLO DE N+1: Usar JOIN en lugar de Promise.all con queries individuales
  const { data, error } = await supabase
    .from('participantes_reto')
    .select(`
      id,
      rol,
      ultima_foto_fecha,
      foto_url,
      dias_completados,
      usuario_id,
      perfiles:usuario_id(nombre, username, avatar_url)
    `)
    .eq('reto_id', retoId)

  if (error || !data) return []

  return data.map(p => ({
    ...p,
    foto_hoy: p.ultima_foto_fecha === hoy
  }))
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
      para_usuario_id: perfilDestino.id,
      estado: 'pendiente'
    })

  if (error) return { error: 'Error al enviar la solicitud' }
  return { ok: true }
}

export async function cargarSolicitudesPendientes() {
  const { data: { user } } = await supabase.auth.getUser()

  // ARREGLO DE N+1: Usar JOIN en lugar de Promise.all
  const { data, error } = await supabase
    .from('solicitudes_amistad')
    .select(`
      id,
      de_usuario_id,
      creado_at,
      perfiles:de_usuario_id(nombre, username, avatar_url)
    `)
    .eq('para_usuario_id', user.id)
    .eq('estado', 'pendiente')

  if (error || !data) return []

  return data.map(s => ({
    ...s,
    perfil: s.perfiles
  }))
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

  // ARREGLO DE N+1: Usar JOIN en lugar de Promise.all
  const { data, error } = await supabase
    .from('amigos')
    .select(`
      amigo_id,
      perfiles:amigo_id(id, nombre, username, avatar_url)
    `)
    .eq('usuario_id', user.id)

  if (error || !data) return []

  return data
    .map(a => a.perfiles ? { ...a.perfiles, id: a.amigo_id } : null)
    .filter(Boolean)
}

export async function cargarSolicitudesReto() {
  const { data: { user } } = await supabase.auth.getUser()

  // ARREGLO DE N+1: Usar JOINs en lugar de Promise.all
  // Antes: 1 query solicitudes + N queries retos + N queries perfiles = 1 + 2N queries
  // Ahora: 1 query con 2 JOINs = 1 query total
  const { data, error } = await supabase
    .from('solicitudes_reto')
    .select(`
      id,
      reto_id,
      usuario_id,
      estado,
      retos(titulo, emoji, dias),
      perfiles:usuario_id(nombre, username)
    `)
    .eq('para_admin_id', user.id)
    .eq('estado', 'pendiente')

  if (error || !data) return []

  return data.map(s => ({
    id: s.id,
    reto_id: s.reto_id,
    usuario_id: s.usuario_id,
    estado: s.estado,
    reto: s.retos,
    perfil: s.perfiles
  }))
}

export async function aceptarSolicitudReto(solicitudId, retoId, usuarioId) {
  const { data: yaParticipa } = await supabase
    .from('participantes_reto')
    .select('id')
    .eq('reto_id', retoId)
    .eq('usuario_id', usuarioId)
    .maybeSingle()

  if (!yaParticipa) {
    await supabase
      .from('participantes_reto')
      .insert({
        reto_id: retoId,
        usuario_id: usuarioId,
        rol: 'participante'
      })
  }

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

function obtenerHoyLocal() {
  const hoy = new Date()
  return hoy.getFullYear() + '-' +
    String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
    String(hoy.getDate()).padStart(2, '0')
}

export async function cargarActividadAmigos() {
  const amigos = await cargarAmigos()
  if (amigos.length === 0) return []

  const hoy = obtenerHoyLocal()
  const amigoIds = amigos.map(a => a.id)

  const { data } = await supabase
    .from('participantes_reto')
    .select('usuario_id, retos (emoji, titulo)')
    .in('usuario_id', amigoIds)
    .eq('ultima_foto_fecha', hoy)

  if (!data) return []

  const amigosPorId = new Map(amigos.map(a => [a.id, a]))

  return data
    .filter(p => p.retos)
    .map(p => ({ amigo: amigosPorId.get(p.usuario_id), emoji: p.retos.emoji, titulo: p.retos.titulo }))
    .filter(p => p.amigo)
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