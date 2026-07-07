import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No autenticado' })

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user }, error: errorUsuario } = await supabaseAdmin.auth.getUser(token)
  if (errorUsuario || !user) return res.status(401).json({ error: 'Token inválido' })

  if (req.method === 'POST') {
    const { endpoint, keys, tipo, token } = req.body

    const fila = tipo === 'fcm'
      ? { usuario_id: user.id, endpoint: token, tipo: 'fcm', p256dh: null, auth: null }
      : { usuario_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, tipo: 'web' }

    const { error } = await supabaseAdmin
      .from('push_suscripciones')
      .upsert(fila, { onConflict: 'endpoint' })

    if (error) return res.status(500).json({ error: 'Error al guardar la suscripción' })
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'DELETE') {
    const { endpoint, tipo } = req.body

    let query = supabaseAdmin
      .from('push_suscripciones')
      .delete()
      .eq('usuario_id', user.id)

    query = tipo === 'fcm' ? query.eq('tipo', 'fcm') : query.eq('endpoint', endpoint)

    await query

    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
