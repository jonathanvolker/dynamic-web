import { requireUser } from '@/features/auth/server/session'
import LivePreview from '@/features/editor/components/LivePreview'
export default async function Preview() { await requireUser(); return <LivePreview /> }
