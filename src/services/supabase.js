import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase-js usa navigator.locks para coordinar la sesión entre pestañas,
// pero esa API tiene soporte poco fiable en algunos navegadores (Opera Android
// entre ellos): el lock nunca se libera y deja las promesas de auth colgadas
// para siempre aunque la petición de red ya haya respondido. Sustituimos el
// lock por una versión que simplemente ejecuta la función sin bloquear nada.
const sinBloqueo = async (_nombre, _tiempoEspera, fn) => fn()

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { flowType: 'pkce', lock: sinBloqueo }
})