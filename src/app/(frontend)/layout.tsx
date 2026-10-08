import '@/features/website/styles/site.css'
import '@/features/website/styles/variants.css'
import '@/features/website/styles/customization.css'
import '@/features/website/styles/blocks.css'
import '@/features/website/styles/families.css'
import '@/features/platform/styles/platform.css'
import '@/features/editor/styles/editor.css'
import '@/features/templates/styles/templates.css'
import type { Metadata, Viewport } from 'next'
import { ServiceWorkerRegistration } from '@/features/platform/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'Forma App',
  description: 'Crea tu propia web sin escribir codigo.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#d6f76b',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body><ServiceWorkerRegistration />{children}</body></html>
}
