import assert from 'node:assert/strict'
import { createHmac, randomUUID } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { mock, test } from 'node:test'

const dataDirectory = mkdtempSync(path.join(tmpdir(), 'web-dinamica-routes-'))
process.env.PLATFORM_DATA_DIR = dataDirectory

type TestUser = { id: string; name: string; email: string; role: string }
let loggedInUser: TestUser | null = null

mock.module('server-only', { namedExports: {} })
mock.module(pathToUrl('src/features/auth/server/session.ts'), {
  namedExports: { currentUser: async () => loggedInUser },
})

const { db, closeDatabase } = await import('../src/server/db/sqlite')
const { migrateDocument } = await import('../src/features/sites/document')
const { blockDefinitions } = await import('../src/features/website/blocks')
const { templates } = await import('../src/features/templates/registry')
const { createTrial, activatePlan, findSubscription } = await import('../src/features/billing/server/repository')
const { createSite } = await import('../src/features/sites/server/repository')
const { createDomain } = await import('../src/features/domains/server/repository')
const { POST: uploadMedia } = await import('../src/app/(frontend)/api/platform/media/route')
const { GET: getMedia } = await import('../src/app/(frontend)/api/platform/media/[id]/route')
const { POST: postLead } = await import('../src/app/(frontend)/api/public/leads/route')
const { POST: mercadopagoWebhook } = await import('../src/app/(frontend)/api/billing/mercadopago/route')
const { GET: mercadopagoReturn } = await import('../src/app/(frontend)/api/billing/mercadopago/return/route')
const { GET: allowDomain } = await import('../src/app/(frontend)/api/domains/allow/route')
const { POST: verifyDomain } = await import('../src/app/(frontend)/api/domains/[id]/verify/route')

const ownerA: TestUser = { id: 'owner-a', name: 'A', email: 'a@example.com', role: 'user' }
const ownerB: TestUser = { id: 'owner-b', name: 'B', email: 'b@example.com', role: 'user' }
const hostHeaders = { host: 'localhost:3000', origin: 'http://localhost:3000' }

function pathToUrl(relative: string) {
  return new URL(relative, `file://${process.cwd()}/`).href
}

function seedUser(user: TestUser) {
  db().prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)')
    .run(user.id, user.name, user.email, 'test', user.role)
  createTrial(user.id)
  activatePlan(user.id, 'professional', 'manual')
}

function seedPublishedForm(owner: TestUser) {
  const id = createSite(owner.id, `${owner.name} site`, 'studio')
  const document = migrateDocument({
    settings: structuredClone(templates[0].settings),
    sections: [structuredClone(blockDefinitions.form.defaults)],
  })
  db().prepare('UPDATE sites SET published = ?, published_at = ? WHERE id = ?')
    .run(JSON.stringify(document), new Date().toISOString(), id)
  return { id, formId: document.sections[0].id }
}

function jsonRequest(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) })
}

test.before(() => {
  seedUser(ownerA)
  seedUser(ownerB)
})

test.after(() => {
  closeDatabase()
  rmSync(dataDirectory, { recursive: true, force: true })
})

test('media routes enforce origin/auth, store an image, and serve it', async () => {
  const unauthenticated = await uploadMedia(new Request('http://localhost:3000/api/platform/media', { method: 'POST', headers: hostHeaders }))
  assert.equal(unauthenticated.status, 401)

  loggedInUser = ownerA
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64')
  const form = new FormData()
  form.set('file', new File([png], 'pixel.png', { type: 'image/png' }))
  const uploaded = await uploadMedia(new Request('http://localhost:3000/api/platform/media', { method: 'POST', headers: hostHeaders, body: form }))
  assert.equal(uploaded.status, 201)
  const media = await uploaded.json() as { url: string }
  const image = await getMedia(new Request(`http://localhost:3000${media.url}`), { params: Promise.resolve({ id: media.url.split('/').pop()! }) })
  assert.equal(image.status, 200)
  assert.equal(image.headers.get('content-type'), 'image/webp')
  assert.equal((await image.arrayBuffer()).byteLength > 0, true)

  const foreign = db().prepare('SELECT owner_id FROM media WHERE id = ?').get(media.url.split('/').pop()!) as { owner_id: string }
  assert.equal(foreign.owner_id, ownerA.id)
  loggedInUser = null
})

test('lead route validates the published form and persists only allowed fields', async () => {
  const site = seedPublishedForm(ownerA)
  const seededSite = db().prepare('SELECT slug FROM sites WHERE id = ?').get(site.id) as { slug: string }
  const response = await postLead(jsonRequest('http://localhost:3000/api/public/leads', {
    siteSlug: seededSite.slug,
    kind: 'contact', formId: site.formId, values: { name: 'Ada', email: 'ada@example.com', message: 'Hola', ignored: 'drop' },
  }, { 'x-real-ip': 'lead-test' }))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { success: true })
  const lead = db().prepare('SELECT values_json FROM leads WHERE site_id = ?').get(site.id) as { values_json: string }
  assert.deepEqual(JSON.parse(lead.values_json), { name: 'Ada', email: 'ada@example.com', message: 'Hola' })

  const wrongKind = await postLead(jsonRequest('http://localhost:3000/api/public/leads', { siteSlug: 'missing', kind: 'newsletter', formId: site.formId, values: {} }))
  assert.equal(wrongKind.status, 400)
})

test('Mercado Pago webhook verifies signature, activates once, and is idempotent', async () => {
  process.env.MERCADOPAGO_WEBHOOK_SECRET = 'webhook-secret'
  process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-token'
  const externalId = `mp-${randomUUID()}`
  const subscription = findSubscription(ownerA.id)!
  const payload = JSON.stringify({ type: 'subscription_preapproval', action: 'updated', data: { id: externalId } })
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const requestId = 'request-1'
  const signature = createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET).update(`id:${externalId};request-id:${requestId};ts:${timestamp};`).digest('hex')
  const oldFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ id: externalId, status: 'authorized', external_reference: `${ownerA.id}:initial` }), { status: 200 })
  try {
    const request = () => new Request(`http://localhost:3000/api/billing/mercadopago`, { method: 'POST', headers: { 'x-signature': `ts=${timestamp},v1=${signature}`, 'x-request-id': requestId }, body: payload })
    assert.equal((await mercadopagoWebhook(request())).status, 200)
    assert.equal((findSubscription(ownerA.id) as { plan_id: string }).plan_id, 'initial')
    assert.equal((await mercadopagoWebhook(request())).status, 200)
    assert.equal((db().prepare('SELECT COUNT(*) AS count FROM billing_events').get() as { count: number }).count, 1)
    const invalid = await mercadopagoWebhook(new Request('http://localhost:3000/api/billing/mercadopago?id=x', { method: 'POST', headers: { 'x-signature': 'ts=1,v1=no' }, body: '{}' }))
    assert.equal(invalid.status, 401)
  } finally {
    globalThis.fetch = oldFetch
  }
})

test('Mercado Pago return refuses a subscription belonging to another account', async () => {
  loggedInUser = ownerA
  process.env.MERCADOPAGO_ACCESS_TOKEN = 'test-token'
  const oldFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ id: 'foreign-sub', status: 'authorized', external_reference: `${ownerB.id}:professional` }), { status: 200 })
  try {
    const response = await mercadopagoReturn(new Request('http://localhost:3000/api/billing/mercadopago/return?preapproval_id=foreign-sub'))
    assert.equal(response.status, 307)
    assert.match(response.headers.get('location')!, /suscripci%C3%B3n\+no\+corresponde/)
  } finally {
    globalThis.fetch = oldFetch
    loggedInUser = null
  }
})

test('domain routes expose only verified hosts and reject another account', async () => {
  activatePlan(ownerA.id, 'professional', 'manual')
  const siteA = seedPublishedForm(ownerA)
  const domain = createDomain(siteA.id, 'www.owner-a.example.com') as { id: string; hostname: string }
  db().prepare("UPDATE domains SET status = 'verified' WHERE id = ?").run(domain.id)
  const allowed = await allowDomain(new Request(`http://localhost:3000/api/domains/allow?domain=${domain.hostname}:443`))
  assert.equal(allowed.status, 200)
  const forbidden = await allowDomain(new Request('http://localhost:3000/api/domains/allow?domain=www.unknown.example.com'))
  assert.equal(forbidden.status, 403)

  loggedInUser = ownerB
  const crossAccount = await verifyDomain(new Request('http://localhost:3000/api/domains/verify', { method: 'POST' }), { params: Promise.resolve({ id: domain.id }) })
  assert.equal(crossAccount.status, 403)
  loggedInUser = null
})
