import 'server-only'
import { postgresQuery } from '@/server/db/postgres'

export function platformAdminEmails() {
  return new Set(`${process.env.PLATFORM_ADMIN_EMAILS || ''},${process.env.PLATFORM_ADMIN_EMAIL || ''}`.split(',').map(email => email.trim().toLowerCase()).filter(Boolean))
}

export function isPlatformAdmin(email: string, role?: string) {
  return role === 'admin' || platformAdminEmails().has(email.toLowerCase())
}

export async function adminStats() {
  const [users, sites, published, subscriptions, plans, usersList] = await Promise.all([
    postgresQuery<{ count: string }>('SELECT COUNT(*) AS count FROM platform_users'),
    postgresQuery<{ count: string }>('SELECT COUNT(*) AS count FROM platform_sites'),
    postgresQuery<{ count: string }>('SELECT COUNT(*) AS count FROM platform_sites WHERE published IS NOT NULL'),
    postgresQuery<{ count: string }>("SELECT COUNT(*) AS count FROM platform_subscriptions WHERE status IN ('trialing', 'active', 'past_due')"),
    postgresQuery('SELECT plans.id, plans.name, plans.price, plans.currency, COUNT(subscriptions.id) AS subscribers FROM platform_plans plans LEFT JOIN platform_subscriptions subscriptions ON subscriptions.plan_id = plans.id GROUP BY plans.id ORDER BY plans.price'),
    postgresQuery(`SELECT users.id, users.name, users.email, COALESCE(subscriptions.plan_id, 'none') AS plan_id,
      COALESCE(subscriptions.status, 'none') AS subscription_status, subscriptions.current_period_ends_at,
      COUNT(sites.id) AS site_count, COUNT(sites.id) FILTER (WHERE sites.published IS NOT NULL) AS published_count
      FROM platform_users users LEFT JOIN platform_subscriptions subscriptions ON subscriptions.user_id = users.id
      LEFT JOIN platform_sites sites ON sites.owner_id = users.id GROUP BY users.id, subscriptions.plan_id, subscriptions.status, subscriptions.current_period_ends_at ORDER BY users.name COLLATE "C"`),
  ])
  return {
    users: Number(users.rows[0]?.count || 0), sites: Number(sites.rows[0]?.count || 0), published: Number(published.rows[0]?.count || 0), subscriptions: Number(subscriptions.rows[0]?.count || 0),
    plans: plans.rows as { id: string; name: string; price: number; currency: string; subscribers: number }[],
    usersList: usersList.rows as { id: string; name: string; email: string; plan_id: string; subscription_status: string; current_period_ends_at: string | null; site_count: number; published_count: number }[],
  }
}
