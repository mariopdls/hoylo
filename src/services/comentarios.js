import { supabase } from './supabase'

export async function cargarComentarios(retoId) {
  const { data } = await supabase
    .from('comentarios_reto')
    .select('id, usuario_id, texto, creado_at')
    .eq('reto_id', retoId)
    .order('creado_at', { ascending: true })

  if (!data) return []

  const conPerfil = await Promise.all(
    data.map(async (c) => {
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('nombre, username, avatar_url')
        .eq('id', c.usuario_id)
        .maybeSingle()
      return { ...c, perfil }
    })
  )

  return conPerfil
}

export async function enviarComentario(retoId, texto) {
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('comentarios_reto')
    .insert({
      reto_id: retoId,
      usuario_id: user.id,
      texto: texto.trim()
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