import { notFound } from 'next/navigation'
import { requireUser } from '@/features/auth/server/session'
import { findSite } from '@/features/sites/server/repository'
import Editor from '@/features/editor/components/Editor'
import { getEntitlements } from '@/features/billing/server/access'
export const dynamic = 'force-dynamic'
export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) { const user = await requireUser(); const entitlements = getEntitlements(user.id); const site = findSite((await params).id, user.id); if (!site) notFound(); return <Editor site={site} access={{ canEdit: entitlements.canEdit, canPublish: entitlements.canPublish, availableBlocks: entitlements.plan.allowedBlocks === 'all' ? null : entitlements.plan.allowedBlocks, planName: entitlements.plan.name, status: entitlements.subscription.status, graceDaysRemaining: entitlements.graceDaysRemaining }} /> }
