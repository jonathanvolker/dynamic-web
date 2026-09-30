import { requireUser } from '@/features/auth/server/session'
import { listSites } from '@/features/sites/server/repository'
import { DashboardView } from '@/features/sites/components/DashboardView'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const user = await requireUser()
  return <DashboardView user={user} sites={listSites(user.id)} />
}
