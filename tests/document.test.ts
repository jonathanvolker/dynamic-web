import assert from 'node:assert/strict'
import { test } from 'node:test'
import { migrateDocument, availableAnchor } from '../src/features/sites/document'
import { validateSite } from '../src/features/sites/validation'
import { templates } from '../src/features/templates/registry'
import { isSafeHref, resolveHref, sectionAnchors } from '../src/features/website/links'
import { blockDefinitions, blockTypes } from '../src/features/website/blocks'
import { mediaIdsInDocument } from '../src/features/sites/server/media-ownership'

test('legacy templates migrate without changing content, colors or public anchors', () => {
  for (const template of templates) {
    const legacy = { settings: template.settings, sections: [...template.sections, template.sections[0]] }
    const before = JSON.stringify(legacy)
    const migrated = migrateDocument(legacy)
    validateSite(migrated)
    assert.equal(migrated.schemaVersion, 1)
    assert.equal(migrated.familyId, template.familyId)
    assert.equal(migrated.templateId, template.id)
    assert.deepEqual(migrated.settings, legacy.settings)
    assert.deepEqual(sectionAnchors(migrated.sections), sectionAnchors(legacy.sections))
    assert.deepEqual(migrated.sections.map(({ id, anchor, ...section }) => section), legacy.sections)
    assert.equal(JSON.stringify(legacy), before)
    assert.deepEqual(migrateDocument(migrated), migrated)
  }
})

test('reorder and duplicate keep existing link destinations stable', () => {
  const document = migrateDocument(templates[0])
  const hero = document.sections[0]
  const duplicate = { ...hero, id: 'duplicate', anchor: availableAnchor('hero', document.sections) }
  document.sections.unshift(duplicate)
  assert.equal(duplicate.anchor, 'hero-2')
  assert.equal(hero.anchor, 'hero')
  assert.equal(resolveHref('#hero', sectionAnchors(document.sections)), '#hero')
  validateSite(document)
  document.sections = document.sections.filter(section => section.anchor !== 'contact')
  assert.equal(resolveHref('#contact', sectionAnchors(document.sections)), undefined)
})

test('future versions are rejected rather than silently downgraded', () => {
  assert.throws(() => migrateDocument({ ...templates[0], schemaVersion: 9 }), /más reciente/)
})

test('new design and media fields survive validation; malicious or inconsistent values fail', () => {
  const document = migrateDocument(templates[0])
  document.settings.design = { headingFont: 'serif', bodyFont: 'system', width: 'wide', spacing: 'airy' }
  document.settings.logo = { url: '/api/platform/media/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', alt: 'Logo' }
  document.sections[0].heroLayout = 'cover'
  document.sections[0].buttonHref = 'https://wa.me/5491112345678'
  validateSite(document)
  for (const update of [
    (next: typeof document) => { next.sections[0].buttonHref = 'javascript:alert(1)' },
    (next: typeof document) => { next.sections[1].anchor = next.sections[0].anchor },
    (next: typeof document) => { next.sections[1].id = next.sections[0].id },
    (next: typeof document) => { next.sections[0].anchor = 'main' },
    (next: typeof document) => { next.templateId = 'restaurant' },
    (next: typeof document) => { next.settings.logo!.url = '/api/platform/media/../../secret' },
    (next: typeof document) => { Object.assign(next.settings.design!, { headingFont: 'url(evil)' }) },
  ]) {
    const invalid = structuredClone(document)
    update(invalid)
    assert.throws(() => validateSite(invalid))
  }
})

test('legacy embedded images remain supported', () => {
  const document = migrateDocument(templates[0])
  document.sections.find(section => section.projects)!.projects![0].image = { url: 'data:image/png;base64,aGVsbG8=', alt: 'Anterior' }
  validateSite(document)
})

test('link protocols are restricted, including malformed protocol-relative destinations', () => {
  for (const href of ['#hero', '/servicios', 'https://example.com', 'mailto:hola@example.com', 'tel:+5491112345678']) assert.ok(isSafeHref(href), href)
  for (const href of ['javascript:alert(1)', '//evil.example', '/\\evil.example', 'data:text/html,evil', 'https://', 'https://user:password@example.com', ' https://example.com']) assert.equal(isSafeHref(href), false, href)
})

test('internal and supported action destinations resolve only to existing sections', () => {
  assert.equal(resolveHref('#contact', ['hero', 'contact']), '#contact')
  assert.equal(resolveHref('#removed', ['hero', 'contact']), undefined)
  assert.equal(resolveHref('https://example.com', []), 'https://example.com')
  assert.equal(resolveHref('mailto:hola@example.com', []), 'mailto:hola@example.com')
  assert.equal(resolveHref('tel:+5491112345678', []), 'tel:+5491112345678')
  assert.equal(resolveHref('https://wa.me/5491112345678', []), 'https://wa.me/5491112345678')
})

test('every registered block can be added to every template and saved', () => {
  for (const template of templates) {
    const document = migrateDocument({ settings: template.settings, sections: blockTypes.map(type => blockDefinitions[type].defaults) })
    validateSite(document)
    assert.equal(new Set(document.sections.map(section => section.anchor)).size, document.sections.length)
  }
})

test('gallery media and pricing actions are validated on the server', () => {
  const gallery = migrateDocument({ settings: templates[0].settings, sections: [blockDefinitions.gallery.defaults] })
  gallery.sections[0].gallery![0].image = { url: 'https://untrusted.example/image.svg', alt: 'Imagen' }
  assert.throws(() => validateSite(gallery), /galería/)
  const pricing = migrateDocument({ settings: templates[0].settings, sections: [blockDefinitions.pricing.defaults] })
  pricing.sections[0].plans![0].buttonHref = 'javascript:alert(1)'
  assert.throws(() => validateSite(pricing), /planes/)
  const wrongFamily = migrateDocument(templates.find(template => template.id === 'retreat')!)
  wrongFamily.familyId = 'editorial'
  assert.throws(() => validateSite(wrongFamily), /familia/)
})

test('catalog has three families with three templates each', () => {
  const counts = new Map<string, number>()
  for (const template of templates) counts.set(template.familyId, (counts.get(template.familyId) || 0) + 1)
  assert.deepEqual([...counts.keys()].sort(), ['editorial', 'immersive', 'modular'])
  assert.deepEqual([...counts.values()].sort(), [3, 3, 3])
})

test('media ownership collects logo, section, gallery, project, logo and team references', () => {
  const document = migrateDocument(templates[0])
  const media = (id: string) => ({ url: `/api/platform/media/${id}`, alt: '' })
  document.settings.logo = media('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
  document.sections.push({
    ...blockDefinitions.logos.defaults,
    image: media('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    logos: [{ name: 'Logo', image: media('cccccccc-cccc-cccc-cccc-cccccccccccc') }],
    team: [{ name: 'Persona', role: 'Rol', bio: 'Bio', image: media('dddddddd-dddd-dddd-dddd-dddddddddddd') }],
  })
  assert.deepEqual([...mediaIdsInDocument(document)], [
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
  ])
})
