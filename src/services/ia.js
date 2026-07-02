const GROQ_ENDPOINT = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/groq`
  : '/api/groq'

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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  const texto = data.choices[0].message.content
  return JSON.parse(texto)
}

export async function generarRetosDelMomento(idioma = 'es') {
  const fecha = new Date()
  const mes = fecha.toLocaleDateString(idioma === 'es' ? 'es-ES' : 'en-US', { month: 'long' })
  const dia = fecha.getDate()
  const estacion = (fecha.getMonth() >= 2 && fecha.getMonth() <= 4) ? 'primavera'
    : (fecha.getMonth() >= 5 && fecha.getMonth() <= 7) ? 'verano'
    : (fecha.getMonth() >= 8 && fecha.getMonth() <= 10) ? 'otoño' : 'invierno'

  const prompt = idioma === 'es'
    ? `Genera exactamente 6 retos de hábitos para el mes de ${mes} (día ${dia}), en plena ${estacion}.

Ten en cuenta el contexto actual: época del año, festividades cercanas, eventos populares de ${mes}, tendencias de bienestar de temporada. Por ejemplo en verano: hidratación, playa, actividad al aire libre. En diciembre: descanso, reflexión del año, propósitos. En enero: nuevos hábitos, deporte. En primavera: naturaleza, alergias, energía.

Los retos deben sentirse actuales y relevantes para lo que vive la gente ahora mismo, no genéricos.
Apropiados para todas las edades, sin connotaciones políticas, religiosas, sexuales o violentas.
Cada uno: título corto y motivador, emoji representativo, duración en días (7, 14, 21 o 30).
Responde ÚNICAMENTE con un array JSON válido, sin texto extra, sin markdown.
Formato: [{ "emoji": "🌊", "titulo": "Nada 20 minutos cada día", "dias": 14 }]`
    : `Generate exactly 6 habit challenges for the month of ${mes} (day ${dia}), in the middle of ${estacion === 'verano' ? 'summer' : estacion === 'invierno' ? 'winter' : estacion === 'primavera' ? 'spring' : 'autumn'}.

Consider the current context: time of year, upcoming holidays, popular events in ${mes}, seasonal wellness trends. For example in summer: hydration, outdoor activities, beach. In December: rest, year reflection, resolutions. In January: new habits, exercise. In spring: nature, energy.

Challenges should feel current and relevant to what people are experiencing right now, not generic.
Appropriate for all ages, no political, religious, sexual or violent connotations.
Each one: short motivating title, representative emoji, duration in days (7, 14, 21 or 30).
Reply ONLY with a valid JSON array, no extra text, no markdown.
Format: [{ "emoji": "🌊", "titulo": "Swim 20 minutes every day", "dias": 14 }]`

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }]
    })
  })

  const data = await response.json()
  const texto = data.choices[0].message.content
  return JSON.parse(texto)
}