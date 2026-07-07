import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import admin from 'firebase-admin'

function obtenerAppFirebase() {
  if (admin.apps.length) return admin.apps[0]
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  })
}

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
  obtenerAppFirebase()

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: suscripciones } = await supabaseAdmin.from('push_suscripciones').select('*')

  const titulo = 'Hoylo 🌞'
  const cuerpo = '¡No olvides completar tus retos de hoy!'
  const payloadWeb = JSON.stringify({ title: titulo, body: cuerpo })

  let enviados = 0

  await Promise.all((suscripciones || []).map(async (s) => {
    try {
      if (s.tipo === 'fcm') {
        await admin.messaging().send({
          token: s.endpoint,
          notification: { title: titulo, body: cuerpo }
        })
      } else {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payloadWeb
        )
      }
      enviados++
    } catch (err) {
      const tokenInvalido = err.statusCode === 404 || err.statusCode === 410 ||
        err.code === 'messaging/registration-token-not-registered' ||
        err.code === 'messaging/invalid-registration-token'
      if (tokenInvalido) {
        await supabaseAdmin.from('push_suscripciones').delete().eq('id', s.id)
      }
    }
  }))

  return res.status(200).json({ ok: true, enviados })
}
