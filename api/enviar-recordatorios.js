import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

export default async function handler(req, res) {
  const secreto = req.headers.authorization?.replace('Bearer ', '')
  if (secreto !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  webpush.setVapidDetails(
    'mailto:soporte@hoylo.app',
    process.env.VITE_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: suscripciones } = await supabaseAdmin.from('push_suscripciones').select('*')

  const payload = JSON.stringify({
    title: 'Hoylo 🌞',
    body: '¡No olvides completar tus retos de hoy!'
  })

  let enviados = 0

  await Promise.all((suscripciones || []).map(async (s) => {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
      enviados++
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await supabaseAdmin.from('push_suscripciones').delete().eq('id', s.id)
      }
    }
  }))

  return res.status(200).json({ ok: true, enviados })
}
