import { randomUUID } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import sharp from 'sharp'
import { defaultSections, defaultSettings } from '../../src/features/website/content/defaults'

async function register(page: Page) {
  const email = `test-${randomUUID()}@example.com`
  await page.goto('/register')
  await page.getByLabel('Tu nombre').fill('Cliente de prueba')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Contraseña').fill('Prueba-segura-123')
  await page.getByRole('button', { name: 'Crear mi cuenta' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  return email
}

async function createSite(page: Page, template = 'studio') {
  await page.goto(`/dashboard/new?template=${template}`)
  await page.getByLabel('Nombre de tu sitio').fill('Mi sitio de prueba')
  await page.getByRole('button', { name: 'Empezar a diseñar' }).click()
  await expect(page).toHaveURL(/\/editor\//)
  await expect(page.frameLocator('iframe').locator('h1')).toBeVisible()
}

test('edit, upload, preview, save, publish, isolate accounts and unpublish', async ({ page, browser }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await register(page)
  await createSite(page)
  const editorUrl = page.url()
  const preview = page.frameLocator('iframe')
  await page.getByLabel('Título', { exact: true }).fill('Una portada propia')
  await page.getByLabel('Composición de portada').selectOption('centered')
  await expect(preview.locator('.hero')).toHaveClass(/hero-layout-centered/)
  await page.getByLabel('Composición de portada').selectOption('cover')
  await page.getByLabel('Destino del botón · enlace', { exact: true }).fill('https://example.com/contacto')
  const png = await sharp({ create: { width: 40, height: 40, channels: 4, background: { r: 30, g: 80, b: 120, alpha: 0.4 } } }).png().toBuffer()
  await page.getByLabel('Imagen de la sección', { exact: true }).setInputFiles({ name: 'portada.png', mimeType: 'image/png', buffer: png })
  await expect(preview.locator('.hero-media img')).toHaveAttribute('src', /\/api\/platform\/media\//)
  const imageUrl = await preview.locator('.hero-media img').getAttribute('src')
  const storedImage = await page.request.get(imageUrl!)
  expect(storedImage.status()).toBe(200)
  expect((await sharp(await storedImage.body()).metadata()).hasAlpha).toBe(true)
   await page.getByRole('button', { name: 'Estilos', exact: true }).click()
  await page.getByLabel('Logo de marca', { exact: true }).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: png })
  await expect(preview.locator('.header .brand-image')).toBeVisible()
  await page.getByLabel('Tipografía de títulos').selectOption('serif')
  await page.getByLabel('Tipografía de textos').selectOption('system')
  await page.getByLabel('Ancho del contenido').selectOption('wide')
  await page.getByLabel('Espaciado entre secciones').selectOption('compact')
  await expect(preview.locator('.website-root')).toHaveAttribute('data-heading-font', 'serif')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.locator('.editor-status')).toContainText('Borrador guardado')
  await page.reload()
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Una portada propia')
  await expect(preview.locator('.hero-media img')).toHaveAttribute('src', imageUrl!)
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page.getByRole('status')).toContainText('Tu web está publicada')
  const publicUrl = await page.getByRole('link', { name: 'Ver sitio' }).getAttribute('href')
  const publicPage = await page.context().newPage()
  await publicPage.goto(publicUrl!)
  await expect(publicPage.locator('h1')).toHaveText('Una portada propia')
  await expect(publicPage.locator('.hero-copy .button')).toHaveAttribute('href', 'https://example.com/contacto')
  await expect(publicPage.locator('.hero')).toHaveClass(/hero-layout-cover/)
  // Saving a draft must not update the public snapshot.
  await page.getByLabel('Título', { exact: true }).fill('Solo en borrador')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Borrador guardado')
  await publicPage.reload()
  await expect(publicPage.locator('h1')).toHaveText('Una portada propia')
  // Reordering repeated sections preserves their identities and destinations.
  await page.getByRole('button', { name: 'Duplicar sección' }).click()
  await expect(preview.locator('#hero-2')).toBeVisible()
  await page.getByRole('button', { name: 'Subir Portada', exact: true }).nth(1).click()
  await expect(preview.locator('main > section').first()).toHaveAttribute('id', 'hero-2')
  await expect(preview.locator('#hero')).toHaveCount(1)
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Borrador guardado')
  const other = await browser.newContext()
  const otherPage = await other.newPage()
  await register(otherPage)
  const inaccessible = await otherPage.goto(editorUrl)
  expect(inaccessible?.status()).toBe(404)
  await createSite(otherPage)
  // Simulate a tampered upload response; the server must reject foreign media on save.
  await otherPage.route('**/api/platform/media', route => route.fulfill({ status: 201, json: { url: imageUrl, alt: 'Ajena' } }))
  await otherPage.getByLabel('Imagen de la sección', { exact: true }).setInputFiles({ name: 'ajena.png', mimeType: 'image/png', buffer: png })
  await expect(otherPage.frameLocator('iframe').locator('.hero-media img')).toHaveAttribute('src', imageUrl!)
  await otherPage.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(otherPage.locator('.editor-status')).toContainText('no pertenece a tu cuenta')
  await other.close()
  // Public composition also fits a phone without horizontal overflow.
  await publicPage.setViewportSize({ width: 390, height: 844 })
  expect(await publicPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await publicPage.screenshot({ path: test.info().outputPath('published-mobile.png'), fullPage: true })
  await page.goto('/dashboard')
  await page.getByRole('button', { name: 'Retirar publicación' }).click()
  await expect(page.getByText('○ Borrador')).toBeVisible()
  expect((await publicPage.goto(publicUrl!))?.status()).toBe(404)
  await page.getByRole('button', { name: 'Eliminar sitio' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar sitio' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(page.getByText('Mi sitio de prueba')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('legacy draft/publication remain distinct and reading never rewrites stored documents', async ({ page }) => {
  const email = await register(page)
  const db = new DatabaseSync(path.join(process.env.PLATFORM_DATA_DIR!, 'platform.sqlite'))
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as { id: string }
  const draft = JSON.stringify({ settings: defaultSettings, sections: [{ ...defaultSections[0], title: 'Borrador anterior' }, defaultSections[5]] })
  const published = JSON.stringify({ settings: defaultSettings, sections: [{ ...defaultSections[0], title: 'Publicación anterior' }, defaultSections[5]] })
  const id = randomUUID()
  db.prepare('INSERT INTO sites (id, owner_id, name, slug, draft, published, updated_at, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, user.id, 'Legacy', id, draft, published, new Date().toISOString(), new Date().toISOString())
  await page.goto(`/s/${id}`)
  await expect(page.locator('h1')).toHaveText('Publicación anterior')
  await page.goto(`/editor/${id}`)
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Borrador anterior')
  const stored = db.prepare('SELECT draft, published FROM sites WHERE id = ?').get(id)
  expect(stored?.draft).toBe(draft)
  expect(stored?.published).toBe(published)
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await expect(page.locator('.editor-status')).toContainText('Borrador guardado')
  const saved = db.prepare('SELECT draft, published FROM sites WHERE id = ?').get(id)
  expect(JSON.parse(saved?.draft as string).schemaVersion).toBe(1)
  expect(saved?.published).toBe(published)
  db.close()
})

test('catalog groups templates and mobile editor saves a restaurant site', async ({ page }) => {
  await page.goto('/templates')
  await expect(page.getByRole('heading', { name: 'Editorial creativo' })).toBeVisible()
  await expect(page.locator('.catalog-card')).toHaveCount(9)
  await expect(page.getByRole('heading', { name: 'Inmersivo fotográfico' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Modular producto' })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  await register(page)
  await createSite(page, 'restaurant')
  await page.getByRole('button', { name: 'Propiedades', exact: true }).click()
  await page.getByLabel('Composición de portada').selectOption('centered')
  await page.getByLabel('Título', { exact: true }).fill('Mi restaurante móvil')
  await page.getByRole('button', { name: 'Guardar', exact: true }).click()
  await page.getByRole('button', { name: 'Vista previa', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Borrador guardado')
  await expect(page.frameLocator('iframe').locator('h1')).toHaveText('Mi restaurante móvil')
  await page.reload()
  await expect(page.frameLocator('iframe').locator('h1')).toHaveText('Mi restaurante móvil')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('all public templates expose their intended composition blocks', async ({ page }) => {
  const compositions = {
    studio: ['.text-image', '.team-block', '.process-block', '.lead-block', '.newsletter-block'],
    restaurant: ['.menu-block', '.hours-block', '.lead-block', '.newsletter-block'],
    consultant: ['.process-block', '.logos-block', '.comparison-block', '.utility-cta', '.lead-block'],
    retreat: ['.text-image', '.process-block', '.hours-block', '.lead-block'],
    coast: ['.text-image', '.hours-block', '.lead-block'],
    atelier: ['.text-image', '.process-block', '.lead-block'],
    product: ['.video-block', '.stats-block', '.logos-block', '.comparison-block', '.newsletter-block', '.lead-block'],
    launch: ['.video-block', '.stats-block', '.logos-block', '.comparison-block', '.newsletter-block'],
    scale: ['.text-image', '.process-block', '.stats-block', '.comparison-block', '.lead-block'],
  } as const

  for (const [template, blocks] of Object.entries(compositions)) {
    await page.goto(`/templates/${template}`)
    for (const block of blocks) await expect(page.locator(block), `${template} should render ${block}`).toHaveCount(1)
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), template).toBe(true)
  }
})

test('editor adds and removes sections and can publish a hero-only site', async ({ page }) => {
  await register(page)
  await createSite(page, 'blank')
  const preview = page.frameLocator('iframe')
  await page.getByRole('button', { name: '+ Agregar', exact: true }).click()
  await page.locator('.block-library button').filter({ hasText: 'Testimonios' }).click()
  await expect(preview.locator('.testimonials')).toHaveCount(1)
  await page.getByRole('button', { name: 'Secciones', exact: true }).first().click()
  await page.getByRole('button', { name: 'Eliminar Testimonios' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar sección' }).click()
  await expect(preview.locator('.testimonials')).toHaveCount(0)
  await page.getByRole('button', { name: 'Eliminar Contacto' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Eliminar sección' }).click()
  await expect(preview.locator('h1')).toBeVisible()
  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page.locator('.editor-status')).toContainText('Tu web está publicada')
  const publicUrl = await page.getByRole('link', { name: 'Ver sitio' }).getAttribute('href')
  const publicPage = await page.context().newPage()
  await publicPage.goto(publicUrl!)
  await expect(publicPage.locator('h1')).toBeVisible()
  await expect(publicPage.locator('main > section')).toHaveCount(1)
})

test('all public template actions have a valid destination or documented interaction', async ({ page }) => {
  for (const template of ['studio', 'restaurant', 'consultant', 'retreat', 'coast', 'atelier', 'product', 'launch', 'scale']) {
    await page.goto(`/templates/${template}`)
    const links = await page.locator('a[href]').evaluateAll(elements => elements.map(element => ({ href: (element as HTMLAnchorElement).getAttribute('href'), text: element.textContent?.trim() })))
    expect(links.length, `${template} should expose actions`).toBeGreaterThan(3)
    for (const link of links) {
      expect(link.href, `${template} has an empty action: ${link.text}`).toBeTruthy()
      if (link.href?.startsWith('#')) {
        await expect(page.locator(link.href)).toHaveCount(1)
      } else {
        expect(link.href).toMatch(/^(https:\/\/|mailto:|tel:|\/) */)
      }
    }
    const project = page.locator('.project-card').first()
    if (await project.count()) {
      await project.click()
      await expect(page.locator('.project-dialog[open]')).toBeVisible()
      await page.getByRole('button', { name: 'Cerrar proyecto' }).click()
      await expect(page.locator('.project-dialog[open]')).toHaveCount(0)
    }
  }
})

test('draft autosaves after inactivity and can recover a local change', async ({ page }) => {
  await register(page)
  await createSite(page)
  const editorUrl = page.url()
  await page.getByLabel('Título', { exact: true }).fill('Guardado sin pulsar botón')
  await expect(page.getByRole('status')).toContainText('Borrador guardado automáticamente', { timeout: 8_000 })
  await page.reload()
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Guardado sin pulsar botón')

  await page.getByLabel('Título', { exact: true }).fill('Cambio local recuperable')
  await page.evaluate(() => new Promise(resolve => window.setTimeout(resolve, 300)))
  expect(await page.evaluate(() => Object.keys(localStorage).some(key => key.startsWith('forma:draft:')))).toBe(true)
  await page.reload()
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Cambio local recuperable')
  await expect(page.getByRole('status')).toContainText('Recuperamos cambios locales')
})

test('published contact form and newsletter persist leads', async ({ page }) => {
  await register(page)
  await createSite(page)

  await page.getByRole('button', { name: 'Publicar' }).click()
  await expect(page.getByRole('status')).toContainText('Tu web está publicada')
  const publicUrl = await page.getByRole('link', { name: 'Ver sitio' }).getAttribute('href')
  expect(publicUrl).toBeTruthy()

  const publicPage = await page.context().newPage()
  await publicPage.goto(publicUrl!)
  const contactForm = publicPage.locator('.lead-form')
  await contactForm.getByLabel('Nombre').fill('Ana Prueba')
  await contactForm.getByLabel('Email').fill('ana@example.com')
  await contactForm.getByLabel('Proyecto').fill('Quiero conocer la propuesta.')
  await contactForm.getByRole('button', { name: 'Enviar proyecto' }).click()
  await expect(contactForm.getByRole('status')).toHaveText('Gracias. Te escribimos para seguir la conversación.')

  const newsletter = publicPage.locator('.newsletter-block form')
  await newsletter.getByLabel('Tu email').fill('suscripta@example.com')
  await newsletter.getByLabel(/Acepto recibir notas/).check()
  await newsletter.getByRole('button', { name: 'Recibir notas' }).click()
  await expect(newsletter.getByRole('status')).toHaveText('Listo. La próxima nota llega pronto.')

  const siteId = page.url().match(/\/editor\/([^/?]+)/)?.[1]
  expect(siteId).toBeTruthy()
  const db = new DatabaseSync(path.join(process.env.PLATFORM_DATA_DIR!, 'platform.sqlite'))
  const leads = db.prepare('SELECT kind, values_json FROM leads WHERE site_id = ? ORDER BY created_at').all(siteId!) as { kind: string; values_json: string }[]
  expect(leads).toHaveLength(2)
  expect(leads.map(lead => lead.kind)).toEqual(['contact', 'newsletter'])
  expect(JSON.parse(leads[0].values_json)).toMatchObject({ name: 'Ana Prueba', email: 'ana@example.com', message: 'Quiero conocer la propuesta.' })
  expect(JSON.parse(leads[1].values_json)).toMatchObject({ email: 'suscripta@example.com', consent: 'on' })

  const invalidNewsletter = await publicPage.request.post('/api/public/leads', {
    data: { siteSlug: new URL(publicUrl!, publicPage.url()).pathname.split('/').pop(), kind: 'newsletter', formId: 'newsletter', values: { email: 'invalido' } },
  })
  expect(invalidNewsletter.status()).toBe(400)

  const honeypot = await publicPage.request.post('/api/public/leads', {
    data: { siteSlug: new URL(publicUrl!, publicPage.url()).pathname.split('/').pop(), kind: 'contact', formId: 'form', values: { website: 'bot', email: 'bot@example.com', message: 'spam' } },
  })
  expect(honeypot.status()).toBe(200)
  expect((await honeypot.json()).success).toBe(true)
  expect((db.prepare('SELECT COUNT(*) AS count FROM leads WHERE site_id = ?').get(siteId!) as { count: number }).count).toBe(2)
  db.close()
  await publicPage.close()
})

for (const variant of [
  { template: 'retreat', family: 'immersive', hero: 'cover', footer: '.immersive-footer', block: 'Galería', count: 3 },
  { template: 'product', family: 'modular', hero: 'centered', footer: '.modular-footer', block: 'Planes y precios', count: 3 },
]) {
  test(`${variant.template}: distinctive layout, editable new blocks and published mobile site`, async ({ page }) => {
    await page.goto(`/templates/${variant.template}`)
    await expect(page.locator(`.family-${variant.family}`)).toBeVisible()
    await expect(page.locator('.hero')).toHaveClass(new RegExp(`hero-layout-${variant.hero}`))
    await expect(page.locator(variant.footer)).toHaveCount(1)
    await page.screenshot({ path: test.info().outputPath(`${variant.template}-desktop.png`), fullPage: true })
    await register(page)
    await createSite(page, variant.template)
    const preview = page.frameLocator('iframe')
    await expect(preview.locator(`.family-${variant.family}`)).toBeVisible()
    await page.locator('.section-select').filter({ hasText: variant.block }).click()
    await page.getByLabel('Título', { exact: true }).fill('Un bloque hecho a mi medida')
    await page.locator('.row-detail summary').first().click()
    if (variant.template === 'retreat') {
      await page.getByLabel('Nombre', { exact: true }).first().fill('Mi espacio favorito')
      await expect(preview.locator('.gallery-item h3').first()).toHaveText('Mi espacio favorito')
      await expect(preview.locator('.gallery-item')).toHaveCount(variant.count)
    } else {
      await page.getByLabel('Precio o valor').first().fill('US$ 49')
      await page.getByLabel('Destino del plan · enlace', { exact: true }).first().fill('https://example.com/planes')
      await expect(preview.locator('.plan-price').first()).toHaveText('US$ 49')
      await expect(preview.locator('.pricing-card')).toHaveCount(variant.count)
    }
    // A new block is available across families, not only inside its initial template.
    await page.getByRole('button', { name: '+ Agregar', exact: true }).click()
    await page.locator('.block-library button').filter({ hasText: 'Testimonios' }).click()
    await expect(preview.locator('.testimonials')).toHaveCount(2)
    await page.getByRole('button', { name: 'Publicar' }).click()
    await expect(page.getByRole('status')).toContainText('Tu web está publicada')
    const publicUrl = await page.getByRole('link', { name: 'Ver sitio' }).getAttribute('href')
    await page.goto(publicUrl!)
    await expect(page.getByRole('heading', { name: 'Un bloque hecho a mi medida' })).toBeVisible()
    await expect(page.locator(variant.footer)).toHaveCount(1)
    if (variant.template === 'product') await expect(page.locator('.pricing-card .button').first()).toHaveAttribute('href', 'https://example.com/planes')
    await page.setViewportSize({ width: 390, height: 844 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.getByRole('button', { name: 'Menú' }).click()
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible()
    await page.getByRole('button', { name: 'Cerrar' }).click()
    await page.screenshot({ path: test.info().outputPath(`${variant.template}-mobile.png`), fullPage: true })
  })
}
