import '@/features/website/styles/site.css'
import '@/features/website/styles/variants.css'
import '@/features/website/styles/customization.css'
import '@/features/website/styles/blocks.css'
import '@/features/website/styles/families.css'
import '@/features/platform/styles/platform.css'
import '@/features/editor/styles/editor.css'
import '@/features/templates/styles/templates.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>
}
