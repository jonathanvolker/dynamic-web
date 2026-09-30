import { notFound } from 'next/navigation'
import { requireUser } from '@/features/auth/server/session'
import { findSite } from '@/features/sites/server/repository'
import Editor from '@/features/editor/components/Editor'
export const dynamic = 'force-dynamic'
export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) { const user = await requireUser(); const site = findSite((await params).id, user.id); if (!site) notFound(); return <Editor site={site} /> }
