import sharp from 'sharp'

const sizes = [192, 512]

for (const size of sizes) {
  sharp('src/assets/logo2.png')
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 251, b: 242, alpha: 1 } })
    .toFile(`public/icon-${size}.png`)
    .then(() => console.log(`icon-${size}.png generado`))
    .catch(err => console.error(err))
}