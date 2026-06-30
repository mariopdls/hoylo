import { supabase } from './supabase'

export async function cargarPerfilPublico(usuarioId) {
  const { data } = await supabase
    .from('perfiles')
    .select('nombre, username, avatar_url, ciudad, pais, aficiones, perfil_publico')
    .eq('id', usuarioId)
    .maybeSingle()

  return data
}

export async function contarRetosCompletados(usuarioId) {
  const { count } = await supabase
    .from('participantes_reto')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)

  return count || 0
}