const RETOS_FALLBACK = {
  es: {
    actividad: [
      { emoji: '🏃', titulo: 'Camina 15 minutos', dias: 7 },
      { emoji: '🚶', titulo: 'Muévete un poco más hoy', dias: 7 },
      { emoji: '🎯', titulo: 'Haz 10 minutos de movimiento', dias: 7 },
      { emoji: '🚴', titulo: 'Date un paseo breve', dias: 7 },
      { emoji: '🧍', titulo: 'Haz 5 minutos de estiramientos', dias: 7 },
      { emoji: '🏋️', titulo: 'Sube escaleras o mueve el cuerpo', dias: 7 }
    ],
    constancia: [
      { emoji: '✅', titulo: 'Cumple tu hábito mínimo', dias: 7 },
      { emoji: '📅', titulo: 'Hazlo a la misma hora', dias: 7 },
      { emoji: '🧠', titulo: 'Sigue la rutina aunque sea pequeña', dias: 7 },
      { emoji: '🔁', titulo: 'Repite tu hábito sin saltarte días', dias: 7 },
      { emoji: '⏰', titulo: 'Pon una alarma para tu rutina', dias: 7 },
      { emoji: '📌', titulo: 'Marca un pequeño objetivo diario', dias: 7 }
    ],
    alimentacion: [
      { emoji: '🥗', titulo: 'Come una fruta hoy', dias: 7 },
      { emoji: '💧', titulo: 'Bebe 2 litros de agua', dias: 7 },
      { emoji: '🍽️', titulo: 'Haz una comida más equilibrada', dias: 7 },
      { emoji: '🥑', titulo: 'Añade un alimento saludable', dias: 7 },
      { emoji: '🍅', titulo: 'Come algo verde hoy', dias: 7 },
      { emoji: '🥤', titulo: 'Cambia una bebida por agua', dias: 7 }
    ],
    descanso: [
      { emoji: '😴', titulo: 'Descansa 30 minutos más', dias: 7 },
      { emoji: '🧘', titulo: 'Haz una pausa de relajación', dias: 7 },
      { emoji: '🌙', titulo: 'Apaga el móvil antes de dormir', dias: 7 },
      { emoji: '🛏️', titulo: 'Prepárate para dormir mejor', dias: 7 },
      { emoji: '🌊', titulo: 'Haz 5 minutos de calma', dias: 7 },
      { emoji: '💤', titulo: 'Ve a dormir 30 minutos antes', dias: 7 }
    ],
    mente: [
      { emoji: '🧘', titulo: 'Haz 5 minutos de respiración', dias: 7 },
      { emoji: '📝', titulo: 'Escribe cómo te sientes', dias: 7 },
      { emoji: '🌿', titulo: 'Ponte 10 minutos en calma', dias: 7 },
      { emoji: '🫧', titulo: 'Haz una pausa mental sin móvil', dias: 7 },
      { emoji: '🧩', titulo: 'Céntrate en una cosa sola', dias: 7 },
      { emoji: '💭', titulo: 'Anota una reflexión breve', dias: 7 }
    ],
    aprender: [
      { emoji: '📚', titulo: 'Lee 10 páginas', dias: 7 },
      { emoji: '🎧', titulo: 'Aprende algo nuevo 10 minutos', dias: 7 },
      { emoji: '✍️', titulo: 'Haz una pequeña práctica diaria', dias: 7 },
      { emoji: '🧪', titulo: 'Descubre un dato útil', dias: 7 },
      { emoji: '🧠', titulo: 'Aprende algo que te ayude hoy', dias: 7 },
      { emoji: '📖', titulo: 'Lee un capítulo corto', dias: 7 }
    ],
    default: [
      { emoji: '🌱', titulo: 'Haz una acción pequeña hoy', dias: 7 },
      { emoji: '💪', titulo: 'Mantén la constancia', dias: 7 },
      { emoji: '✨', titulo: 'Acierta con una rutina sencilla', dias: 7 },
      { emoji: '🌤️', titulo: 'Haz una cosa que te haga sentir mejor', dias: 7 },
      { emoji: '🧭', titulo: 'Elige un paso sencillo', dias: 7 },
      { emoji: '🔆', titulo: 'Da un pequeño paso positivo', dias: 7 }
    ]
  },
  en: {
    actividad: [
      { emoji: '🏃', titulo: 'Walk 15 minutes', dias: 7 },
      { emoji: '🚶', titulo: 'Move a little more today', dias: 7 },
      { emoji: '🎯', titulo: 'Do 10 minutes of movement', dias: 7 },
      { emoji: '🚴', titulo: 'Take a short walk', dias: 7 },
      { emoji: '🧍', titulo: 'Do 5 minutes of stretching', dias: 7 },
      { emoji: '🏋️', titulo: 'Use the stairs or move around', dias: 7 }
    ],
    constancia: [
      { emoji: '✅', titulo: 'Complete your minimum habit', dias: 7 },
      { emoji: '📅', titulo: 'Do it at the same time', dias: 7 },
      { emoji: '🧠', titulo: 'Keep the routine even if it is small', dias: 7 },
      { emoji: '🔁', titulo: 'Repeat your habit without skipping days', dias: 7 },
      { emoji: '⏰', titulo: 'Set an alarm for your routine', dias: 7 },
      { emoji: '📌', titulo: 'Set a small daily goal', dias: 7 }
    ],
    alimentacion: [
      { emoji: '🥗', titulo: 'Eat a fruit today', dias: 7 },
      { emoji: '💧', titulo: 'Drink 2 liters of water', dias: 7 },
      { emoji: '🍽️', titulo: 'Have a more balanced meal', dias: 7 },
      { emoji: '🥑', titulo: 'Add a healthy food', dias: 7 },
      { emoji: '🍅', titulo: 'Eat something green today', dias: 7 },
      { emoji: '🥤', titulo: 'Swap one drink for water', dias: 7 }
    ],
    descanso: [
      { emoji: '😴', titulo: 'Rest 30 minutes more', dias: 7 },
      { emoji: '🧘', titulo: 'Take a short relaxation break', dias: 7 },
      { emoji: '🌙', titulo: 'Put your phone away before sleep', dias: 7 },
      { emoji: '🛏️', titulo: 'Prepare for a better night sleep', dias: 7 },
      { emoji: '🌊', titulo: 'Take 5 minutes to calm down', dias: 7 },
      { emoji: '💤', titulo: 'Sleep 30 minutes earlier', dias: 7 }
    ],
    mente: [
      { emoji: '🧘', titulo: 'Do 5 minutes of breathing', dias: 7 },
      { emoji: '📝', titulo: 'Write down how you feel', dias: 7 },
      { emoji: '🌿', titulo: 'Take 10 minutes to calm down', dias: 7 },
      { emoji: '🫧', titulo: 'Take a screen-free mental pause', dias: 7 },
      { emoji: '🧩', titulo: 'Focus on one thing at a time', dias: 7 },
      { emoji: '💭', titulo: 'Write a quick reflection', dias: 7 }
    ],
    aprender: [
      { emoji: '📚', titulo: 'Read 10 pages', dias: 7 },
      { emoji: '🎧', titulo: 'Learn something new for 10 minutes', dias: 7 },
      { emoji: '✍️', titulo: 'Practice a small daily task', dias: 7 },
      { emoji: '🧪', titulo: 'Discover one useful fact', dias: 7 },
      { emoji: '🧠', titulo: 'Learn something that helps you today', dias: 7 },
      { emoji: '📖', titulo: 'Read a short chapter', dias: 7 }
    ],
    default: [
      { emoji: '🌱', titulo: 'Do one small thing today', dias: 7 },
      { emoji: '💪', titulo: 'Keep your consistency', dias: 7 },
      { emoji: '✨', titulo: 'Follow a simple routine', dias: 7 },
      { emoji: '🌤️', titulo: 'Do one thing that makes you feel better', dias: 7 },
      { emoji: '🧭', titulo: 'Choose one simple step', dias: 7 },
      { emoji: '🔆', titulo: 'Take one positive step forward', dias: 7 }
    ]
  }
}

function mezclar(array) {
  const copia = [...array]
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function construirRetosPorCategoria(respuestas, idioma = 'es') {
  const { racha, mejorar = [], constancia } = respuestas || {}
  const idiomaKey = idioma.startsWith('en') ? 'en' : 'es'
  const mapa = RETOS_FALLBACK[idiomaKey]
  const categorias = Array.isArray(mejorar) && mejorar.length > 0 ? mejorar : ['default']
  const retos = []
  const usados = new Set()

  categorias.forEach(categoria => {
    const opciones = mezclar(mapa[categoria] || mapa.default)
    opciones.forEach(reto => {
      const clave = `${reto.titulo}-${reto.emoji}`
      if (!usados.has(clave)) {
        usados.add(clave)
        retos.push({ ...reto, dias: reto.dias || 7 })
      }
    })
  })

  while (retos.length < 3) {
    const opcion = mezclar(mapa.default)[0]
    const clave = `${opcion.titulo}-${opcion.emoji}`
    if (!usados.has(clave)) {
      usados.add(clave)
      retos.push({ ...opcion, dias: opcion.dias || 7 })
    }
  }

  if (racha === 'mal') {
    return retos.slice(0, 3).map((reto, index) => ({
      ...reto,
      dias: index === 0 ? 7 : Math.min(reto.dias || 7, 7),
      titulo: idiomaKey === 'es' ? `Empieza con: ${reto.titulo}` : `Start with: ${reto.titulo}`
    }))
  }

  if (constancia === 'poco' || constancia === 'nose') {
    return retos.slice(0, 3).map(reto => ({ ...reto, dias: Math.min(reto.dias || 7, 7) }))
  }

  if (constancia === 'mucho') {
    return retos.slice(0, 3).map((reto, index) => ({
      ...reto,
      dias: index === 0 ? 14 : Math.min(reto.dias || 7, 14)
    }))
  }

  return retos.slice(0, 3)
}

function generarRetosLocales(respuestas, idioma = 'es') {
  return construirRetosPorCategoria(respuestas, idioma)
}

export function generarRetos(respuestas, idioma = 'es') {
  const { racha, mejorar, constancia } = respuestas || {}
  return generarRetosLocales({ racha, mejorar, constancia }, idioma)
}

export function generarRetosPorPerfil(respuestas, idioma = 'es') {
  const { racha, mejorar, constancia } = respuestas || {}
  return generarRetosLocales({ racha, mejorar, constancia }, idioma)
}

export function generarRetosDelMomento(idioma = 'es') {
  const lista = idioma.startsWith('en')
    ? [
        { emoji: '🌞', titulo: 'Get 10 minutes of sunlight', dias: 7 },
        { emoji: '💧', titulo: 'Drink water this afternoon', dias: 7 },
        { emoji: '🧘', titulo: 'Take a 5-minute break', dias: 7 },
        { emoji: '🚶', titulo: 'Go for a short walk', dias: 7 },
        { emoji: '📚', titulo: 'Read 5 pages', dias: 7 },
        { emoji: '🌿', titulo: 'Take a minute to breathe', dias: 7 }
      ]
    : [
        { emoji: '🌞', titulo: 'Saca 10 minutos de sol', dias: 7 },
        { emoji: '💧', titulo: 'Bebe agua esta tarde', dias: 7 },
        { emoji: '🧘', titulo: 'Haz una pausa de 5 minutos', dias: 7 },
        { emoji: '🚶', titulo: 'Sal a dar un paseo corto', dias: 7 },
        { emoji: '📚', titulo: 'Lee 5 páginas', dias: 7 },
        { emoji: '🌿', titulo: 'Respira un minuto tranquilo', dias: 7 }
      ]

  return lista
}