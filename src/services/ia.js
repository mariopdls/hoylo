import { supabase } from './supabase'

const GROQ_ENDPOINT = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/groq`
  : '/api/groq'

async function cabecerasAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
  }
}

export async function generarRetos(respuestas, idioma = 'es') {
  const { racha, mejorar, constancia } = respuestas

  const prompt = idioma === 'es'
    ? `Eres el asistente de una app de hábitos llamada Hoylo. 
Tu tarea es generar exactamente 3 retos personalizados para un usuario basándote en su perfil.

Perfil del usuario:
- ¿Está pasando una mala racha?: ${racha}
- Quiere mejorar en: ${mejorar?.join(', ')}
- Constancia con hábitos: ${constancia}

Reglas:
- Si está pasando una mala racha, los retos deben ser suaves y alcanzables
- Si tiene poca constancia, retos cortos de 7 días máximo
- Cada reto debe tener: título corto, emoji representativo y duración en días
- Tono cercano y sin presión
- Responde ÚNICAMENTE con un array JSON válido, sin texto extra, sin markdown

Formato exacto:
[
  { "emoji": "🏃", "titulo": "Sal a caminar 20 min", "dias": 7 },
  { "emoji": "💧", "titulo": "Bebe 2 litros de agua", "dias": 14 },
  { "emoji": "📵", "titulo": "Sin móvil al despertar", "dias": 7 }
]`
    : `You are the assistant of a habit app called Hoylo.
Your task is to generate exactly 3 personalized challenges for a user based on their profile.

User profile:
- Going through a rough patch?: ${racha}
- Wants to improve: ${mejorar?.join(', ')}
- Consistency with habits: ${constancia}

Rules:
- If going through a rough patch, challenges must be soft and achievable
- If low consistency, max 7-day challenges
- Each challenge must have: short title, representative emoji and duration in days
- Friendly tone, no pressure
- Reply ONLY with a valid JSON array, no extra text, no markdown

Exact format:
[
  { "emoji": "🏃", "titulo": "Go for a 20 min walk", "dias": 7 },
  { "emoji": "💧", "titulo": "Drink 2 liters of water", "dias": 14 },
  { "emoji": "📵", "titulo": "No phone when waking up", "dias": 7 }
]`

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: await cabecerasAuth(),
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  console.log('Respuesta groq:', data)
  const texto = data.choices[0].message.content
  return JSON.parse(texto)
}

export async function generarRetosDelMomento(idioma = 'es') {
  const fecha = new Date()
  const mes = fecha.toLocaleDateString(idioma === 'es' ? 'es-ES' : 'en-US', { month: 'long' })
  const estacion = (fecha.getMonth() >= 2 && fecha.getMonth() <= 4) ? 'primavera'
    : (fecha.getMonth() >= 5 && fecha.getMonth() <= 7) ? 'verano'
    : (fecha.getMonth() >= 8 && fecha.getMonth() <= 10) ? 'otoño' : 'invierno'

  const prompt = idioma === 'es'
    ? `Genera exactamente 6 retos de hábitos saludables y positivos adecuados para el mes de ${mes}, en plena ${estacion}.
Los retos deben ser apropiados para todas las edades, completamente seguros, sin ninguna connotación política, religiosa, sexual, violenta u ofensiva.
Cada uno debe tener: título corto, emoji representativo y duración en días (7, 14, 21 o 30).
Responde ÚNICAMENTE con un array JSON válido, sin texto extra, sin markdown.
Formato: [{ "emoji": "🌻", "titulo": "Cuida una planta cada día", "dias": 21 }]`
    : `Generate exactly 6 healthy and positive habit challenges suitable for the month of ${mes}.
Challenges must be appropriate for all ages, completely safe, with no political, religious, sexual, violent, or offensive connotations.
Each one must have: short title, representative emoji, and duration in days (7, 14, 21, or 30).
Reply ONLY with a valid JSON array, no extra text, no markdown.
Format: [{ "emoji": "🌻", "titulo": "Take care of a plant daily", "dias": 21 }]`

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: await cabecerasAuth(),
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  const texto = data.choices[0].message.content
  return JSON.parse(texto)
}