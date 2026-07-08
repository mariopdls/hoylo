import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'No autenticado' })

    const faltantes = []
    if (!process.env.VITE_SUPABASE_URL) faltantes.push('VITE_SUPABASE_URL')
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) faltantes.push('SUPABASE_SERVICE_ROLE_KEY')
    if (!process.env.GROQ_API_KEY) faltantes.push('GROQ_API_KEY')

    if (faltantes.length > 0) {
      console.error('groq.js: faltan variables de entorno:', faltantes.join(', '))
      return res.status(500).json({ error: 'Configuración del servidor incompleta', faltantes })
    }

    let rolDetectado = null
    try {
      const payload = process.env.SUPABASE_SERVICE_ROLE_KEY.split('.')[1]
      rolDetectado = JSON.parse(Buffer.from(payload, 'base64').toString()).role
    } catch (e) {
      rolDetectado = 'no-decodificable'
    }
    if (rolDetectado !== 'service_role') {
      console.error('groq.js: SUPABASE_SERVICE_ROLE_KEY no es una service_role key, role detectado:', rolDetectado)
      return res.status(500).json({ error: 'La clave configurada no es de tipo service_role', rolDetectado })
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: { user }, error: errorUsuario } = await supabaseAdmin.auth.getUser(token)
    if (errorUsuario || !user) return res.status(401).json({ error: 'Token inválido' })

    const { messages, system } = req.body

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: system ? [{ role: 'system', content: system }, ...messages] : messages,
        max_tokens: 1000
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('groq.js: error de la API de Groq', response.status, data)
      return res.status(502).json({ error: 'Error generando con IA', detalle: data })
    }
    return res.status(200).json(data)
  } catch (err) {
    console.error('groq.js: excepción no controlada', err)
    return res.status(500).json({ error: 'Error interno', detalle: err.message })
  }
}