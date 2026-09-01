import { supabase } from './supabase'

// Sanitizar texto de comentarios para prevenir XSS
function sanitizarComentario(texto) {
  if (!texto || typeof texto !== 'string') return ''
  
  // Limitar longitud
  const textoTrimmed = texto.trim().slice(0, 500)
  
  // Remover caracteres de control peligrosos pero mantener espacios y saltos de línea
  return textoTrimmed
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Control chars
    .replace(/javascript:/gi, '') // Prevenir javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Prevenir event handlers como onclick=
}

export async function cargarComentarios(retoId, pagina = 0, porPagina = 20) {
  const inicio = pagina * porPagina
  const fin = inicio + porPagina - 1

  // ARREGLO DE PAGINACI\u00d3N: Ahora acepta par\u00e1metros de p\u00e1gina
  const { data, error, count } = await supabase
    .from('comentarios_reto')
    .select(`
      id,
      usuario_id,
      texto,
      creado_at,
      perfiles:usuario_id(nombre, username, avatar_url)
    `, { count: 'exact' })
    .eq('reto_id', retoId)
    .order('creado_at', { ascending: true })
    .range(inicio, fin)

  if (error || !data) {
    console.error('Error cargando comentarios:', error)
    return { comentarios: [], total: 0, pagina }
  }

  // Mapear respuesta para mantener compatibilidad
  const comentarios = data.map(c => ({
    id: c.id,
    usuario_id: c.usuario_id,
    texto: c.texto,
    creado_at: c.creado_at,
    perfil: c.perfiles
  }))

  return { comentarios, total: count || 0, pagina }
}

export async function enviarComentario(retoId, texto) {
  const { data: { user } } = await supabase.auth.getUser()

  // VALIDACIÓN CONTRA XSS
  const textoBlanqueado = sanitizarComentario(texto)

  // Validar que no esté vacío después de sanitizar
  if (!textoBlanqueado) {
    return { error: 'El comentario no puede estar vacío' }
  }

  // Validar longitud máxima
  if (textoBlanqueado.length > 500) {
    return { error: 'El comentario no puede superar 500 caracteres' }
  }

  const { error } = await supabase
    .from('comentarios_reto')
    .insert({
      reto_id: retoId,
      usuario_id: user.id,
      texto: textoBlanqueado
    })

  if (error) return { error: 'Error al enviar el comentario' }
  return { ok: true }
}

export async function eliminarComentario(comentarioId) {
  await supabase
    .from('comentarios_reto')
    .delete()
    .eq('id', comentarioId)
}