const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://qwykbqdyjmgxzljlbplq.supabase.co/',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3eWticWR5am1neHpsamxicGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2ODA2MjYsImV4cCI6MjA5ODI1NjYyNn0.LpnlO-GOwGqmLzNJX_krChnwaiDHtvH5JZ6tPn-D2DQ'
)

;(async () => {
  const { data, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'marioporra9@gmail.com',
    password: 'patata'
  })
  if (loginError) { console.log('LOGIN ERROR', loginError.message); return }

  const token = data.session.access_token

  const prompt = `Eres el asistente de una app de hábitos llamada Hoylo.
Tu tarea es generar exactamente 3 retos personalizados para un usuario basándote en su perfil.

Perfil del usuario:
- ¿Está pasando una mala racha?: bien
- Quiere mejorar en: constancia
- Constancia con hábitos: regular

Reglas:
- Si está pasando una mala racha, los retos deben ser suaves y alcanzables
- Si tiene poca constancia, retos cortos de 7 días máximo
- Cada reto debe tener: título corto, emoji representativo y duración en días
- Tono cercano y sin presión
- Escribe TODOS los títulos en español correcto y natural, sin mezclar palabras de otros idiomas ni anglicismos
- Responde ÚNICAMENTE con un array JSON válido, sin texto extra, sin markdown

Formato exacto:
[
  { "emoji": "🏃", "titulo": "Sal a caminar 20 min", "dias": 7 },
  { "emoji": "💧", "titulo": "Bebe 2 litros de agua", "dias": 14 },
  { "emoji": "📵", "titulo": "Sin móvil al despertar", "dias": 7 }
]`

  const t0 = Date.now()
  const res = await fetch('https://hoylo.vercel.app/api/groq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
  })
  const elapsed = Date.now() - t0
  console.log('STATUS', res.status, 'in', elapsed, 'ms')
  const body = await res.json()
  console.log('RAW BODY:', JSON.stringify(body, null, 2))

  try {
    const texto = body.choices[0].message.content
    console.log('--- content ---')
    console.log(texto)
    const parsed = JSON.parse(texto)
    console.log('PARSED OK, count =', parsed.length)
  } catch (e) {
    console.log('PARSE FAILED:', e.message)
  }
})()
