const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_DIMENSION = 1600
const TAMAÑO_SIN_COMPRIMIR = 1.5 * 1024 * 1024
const CALIDAD_JPEG = 0.8

async function comprimirImagen(archivo) {
  if (archivo.type === 'image/heic') return archivo // el canvas no decodifica HEIC de forma fiable

  try {
    const bitmap = await createImageBitmap(archivo)
    const escala = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))

    if (escala === 1 && archivo.size < TAMAÑO_SIN_COMPRIMIR) return archivo

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * escala)
    canvas.height = Math.round(bitmap.height * escala)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', CALIDAD_JPEG))
    return blob || archivo
  } catch {
    return archivo
  }
}

export async function subirFoto(archivo) {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    throw new Error('Formato no permitido. Usa JPG, PNG o WebP.')
  }

  if (archivo.size > MAX_SIZE) {
    throw new Error('La foto no puede superar 10MB.')
  }

  const archivoFinal = await comprimirImagen(archivo)

  const formData = new FormData()
  formData.append('file', archivoFinal)
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) throw new Error('Error al subir la foto')

  const data = await res.json()
  return data.secure_url
}