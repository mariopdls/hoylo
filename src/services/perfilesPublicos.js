import { supabase } from './supabase'

export async function cargarPerfilPublico(usuarioId) {
  const { data } = await supabase
    .from('perfiles')
    .select('nombre, username, avatar_url, ciudad, pais, aficiones, perfil_publico, bio, racha_actual, mejor_racha')
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

export async function cargarRetosPublicosActivos(usuarioId) {
  const { data } = await supabase
    .from('participantes_reto')
    .select(`
      dias_completados,
      retos (
        id, emoji, titulo, dias, es_publico
      )
    `)
    .eq('usuario_id', usuarioId)

  if (!data) return []

  return data
    .filter(p => p.retos?.es_publico)
    .map(p => ({
      ...p.retos,
      dias_completados: p.dias_completados || 0
    }))
}