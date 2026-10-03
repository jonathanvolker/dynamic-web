import { notFound } from 'next/navigation'
import { publicSite } from '@/features/sites/server/repository'
import SiteView from '@/features/website/components/SiteView'
export const dynamic = 'force-dynamic'
type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props) { const site = publicSite((await params).slug); return { title: site?.published?.settings.seoTitle || 'Sitio no disponible', description: site?.published?.settings.seoDescription } }
export default async function PublishedSite({ params }: Props) { const slug = (await params).slug; const site = publicSite(slug); if (!site?.published) notFound(); return <SiteView {...site.published} siteSlug={slug} /> }
