import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Forma App',
    short_name: 'Forma',
    description: 'Crea tu propia web sin escribir codigo.',
    id: '/',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#252620',
    theme_color: '#d6f76b',
    lang: 'es',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512-maskable.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
