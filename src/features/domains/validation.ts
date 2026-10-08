const hostnameLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

export function normalizeHostname(value: string): string | null {
  const hostname = value.trim().toLowerCase().replace(/\.$/, '')
  if (hostname.length < 7 || hostname.length > 253 || !hostname.startsWith('www.')) return null
  const labels = hostname.split('.')
  if (labels.length < 3 || labels.some(label => !hostnameLabel.test(label))) return null
  return hostname
}

export function normalizeDnsName(value: string): string | null {
  const name = value.trim().toLowerCase().replace(/\.$/, '')
  if (name.length < 1 || name.length > 253) return null
  return name.split('.').every(label => hostnameLabel.test(label)) ? name : null
}
