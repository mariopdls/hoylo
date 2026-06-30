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

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    })
  })

  const data = await response.json()
  const texto = data.choices[0].message.content
  return JSON.parse(texto)
}