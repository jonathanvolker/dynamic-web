import Link from 'next/link'
import { currentUser } from '@/features/auth/server/session'

export const dynamic = 'force-dynamic'

export default async function PlatformHome() {
  const user = await currentUser()
  return (
    <div className="platform landing">
      <header className="p-header">
        <Link className="p-logo" href="/">forma<span>✳</span><small>web builder</small></Link>
        <Link className="p-button secondary" href={user ? '/dashboard' : '/login'}>{user ? 'Mis sitios ↗' : 'Iniciar sesión ↗'}</Link>
      </header>
      <main className="landing-main">
        <span className="p-kicker">TU IDEA. TU WEB. TU ESPACIO.</span>
        <h1>Tu próxima web.<br /><em>Hecha por vos.</em></h1>
        <p>Elegí una base, hacela tuya y publicala. Un espacio para construir tu presencia online, sin tocar código.</p>
        <div className="landing-actions">
          <Link className="p-button primary" href={user ? '/dashboard/new' : '/register'}>Crear mi web <span>↗</span></Link>
          <Link href="/templates" className="text-link">Explorar las plantillas →</Link>
        </div>
        <div className="landing-browser">
          <div className="browser-chrome"><span>● ● ●</span><span>tu-marca · una web con tu identidad</span><span>↗</span></div>
          <div className="landing-sample"><div><span>HECHO A TU MANERA</span><h2>Buenas ideas.<br />Tu propia forma.</h2><p>Una web que habla de vos.</p></div><div className="sample-star">✳</div></div>
        </div>
        <div className="landing-features"><span><b>01</b> Diseñá en vivo</span><span><b>02</b> Guardá tus cambios</span><span><b>03</b> Publicá tu sitio</span></div>
      </main>
      <footer className="landing-footer">Forma · Tu lugar en internet.<Link href="/templates">Explorar estilos y plantillas ↗</Link></footer>
    </div>
  )
}
