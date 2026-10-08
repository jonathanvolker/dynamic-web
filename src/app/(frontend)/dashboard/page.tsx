import { requireUser } from '@/features/auth/server/session'
import { listSites } from '@/features/sites/server/repository'
import { DashboardView } from '@/features/sites/components/DashboardView'
import { getEntitlements } from '@/features/billing/server/access'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const user = await requireUser()
  const entitlements = getEntitlements(user.id)
  return <DashboardView user={user} sites={listSites(user.id)} entitlements={entitlements} />
}
