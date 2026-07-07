import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user }, error: errorUsuario } = await supabaseAdmin.auth.getUser(token)
  if (errorUsuario || !user) return res.status(401).json({ error: 'Token inválido' })

  const { data: perfil } = await supabaseAdmin
    .from('perfiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  await supabaseAdmin.from('participantes_reto').delete().eq('usuario_id', user.id)
  await supabaseAdmin.from('comentarios_reto').delete().eq('usuario_id', user.id)
  await supabaseAdmin.from('amigos').delete().or(`usuario_id.eq.${user.id},amigo_id.eq.${user.id}`)
  await supabaseAdmin.from('solicitudes_amistad').delete().or(`de_usuario_id.eq.${user.id},para_usuario_id.eq.${user.id}`)
  await supabaseAdmin.from('solicitudes_reto').delete().or(`usuario_id.eq.${user.id},para_admin_id.eq.${user.id}`)
  await supabaseAdmin.from('invitaciones').delete().eq('de_usuario_id', user.id)
  if (perfil?.username) {
    await supabaseAdmin.from('invitaciones').delete().eq('para_username', perfil.username)
  }
  await supabaseAdmin.from('retos').delete().eq('usuario_id', user.id)
  await supabaseAdmin.from('perfiles').delete().eq('id', user.id)

  const { error: errorBorrado } = await supabaseAdmin.auth.admin.deleteUser(user.id)
  if (errorBorrado) return res.status(500).json({ error: 'Error al eliminar la cuenta' })

  return res.status(200).json({ ok: true })
}
