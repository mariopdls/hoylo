const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function subirFoto(archivo) {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    throw new Error('Formato no permitido. Usa JPG, PNG o WebP.')
  }

  if (archivo.size > MAX_SIZE) {
    throw new Error('La foto no puede superar 10MB.')
  }

  const formData = new FormData()
  formData.append('file', archivo)
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Error al subir la foto')

  const data = await res.json()
  return data.secure_url
}