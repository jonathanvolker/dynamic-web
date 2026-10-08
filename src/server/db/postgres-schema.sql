CREATE TABLE IF NOT EXISTS platform_schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

CREATE TABLE IF NOT EXISTS platform_sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  price INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'ARS',
  max_sites INTEGER NOT NULL DEFAULT 1,
  media_storage_bytes BIGINT NOT NULL DEFAULT 50000000,
  max_media_per_site INTEGER NOT NULL DEFAULT 25,
  allowed_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_domain BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS platform_sites (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  draft JSONB NOT NULL,
  published JSONB,
  updated_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS platform_media (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES platform_plans(id),
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  starts_at TIMESTAMPTZ NOT NULL,
  current_period_ends_at TIMESTAMPTZ NOT NULL,
  grace_period_ends_at TIMESTAMPTZ,
  provider TEXT NOT NULL CHECK (provider IN ('manual', 'mercadopago')),
  currency TEXT NOT NULL DEFAULT 'ARS',
  contracted_price INTEGER NOT NULL DEFAULT 0,
  external_customer_id TEXT,
  external_subscription_id TEXT,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_domains (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES platform_sites(id) ON DELETE CASCADE,
  hostname TEXT NOT NULL UNIQUE,
  verification_token TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'verified', 'active')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_leads (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES platform_sites(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('contact', 'newsletter')),
  form_id TEXT NOT NULL,
  values JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_lead_notifications (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES platform_leads(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES platform_users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS platform_billing_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_auth_login_rate_limits (
  email_hash TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  failures INTEGER NOT NULL,
  locked_until TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_distributed_rate_limits (
  bucket_hash TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_lead_rate_limits (
  bucket TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS platform_sessions_user ON platform_sessions(user_id);
CREATE INDEX IF NOT EXISTS platform_sites_owner ON platform_sites(owner_id);
CREATE INDEX IF NOT EXISTS platform_media_owner ON platform_media(owner_id);
CREATE INDEX IF NOT EXISTS platform_subscriptions_user ON platform_subscriptions(user_id, updated_at);
CREATE INDEX IF NOT EXISTS platform_domains_site ON platform_domains(site_id);
CREATE INDEX IF NOT EXISTS platform_leads_site ON platform_leads(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS platform_notifications_owner ON platform_lead_notifications(owner_id, read_at);
CREATE INDEX IF NOT EXISTS platform_external_subscription ON platform_subscriptions(external_subscription_id) WHERE external_subscription_id IS NOT NULL;
