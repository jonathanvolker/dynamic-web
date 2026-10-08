import { randomUUID } from 'node:crypto'
import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const password = 'Prueba-segura-123'

async function checkAccessibility(page: Page, name: string, selector?: string) {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa'])
  if (selector) builder.include(selector)
  const results = await builder.analyze()
  await test.info().attach(`axe-${name}`, {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  })
  const relevantViolations = results.violations.filter(({ impact }) => impact === 'critical')

  expect(relevantViolations, `${name} tiene problemas críticos de accesibilidad`).toEqual([])
}

async function register(page: Page) {
  const email = `a11y-${randomUUID()}@example.com`
  await page.goto('/register')
  await page.getByLabel('Tu nombre').fill('Cliente de accesibilidad')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: 'Crear mi cuenta' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  return email
}

async function createSite(page: Page, template = 'studio') {
  await page.goto(`/dashboard/new?template=${template}`)
  await page.getByLabel('¿Cómo se llama tu sitio?').fill('Sitio accesible')
  await page.getByRole('button', { name: 'Crear sitio y abrir editor ↗' }).click()
  await expect(page).toHaveURL(/\/editor\//)
  await expect(page.frameLocator('iframe').locator('h1')).toBeVisible()
}

test.describe('auditoría automática de accesibilidad', () => {
  test('login y dashboard', async ({ page }) => {
    await page.goto('/login')
    await checkAccessibility(page, 'login')

    const email = await register(page)
    await checkAccessibility(page, 'dashboard')

    await page.getByRole('button', { name: 'Salir' }).click()
    await expect(page).toHaveURL(/\/login$/)
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Contraseña').fill(password)
    await checkAccessibility(page, 'login con credenciales')
  })

  test('dashboard/editor y preview pública', async ({ page }) => {
    await register(page)
    await checkAccessibility(page, 'dashboard vacío')
    await createSite(page)
    await checkAccessibility(page, 'editor')

    await page.getByRole('button', { name: 'Publicar' }).click()
    await expect(page.getByRole('status')).toContainText('Tu web está publicada')
    const publicUrl = await page.getByRole('link', { name: 'Ver sitio' }).getAttribute('href')
    expect(publicUrl).toBeTruthy()
    await page.goto(publicUrl!)
    await checkAccessibility(page, 'preview pública publicada')
  })

  test('modal de proyectos y galería', async ({ page }) => {
    await page.goto('/templates/studio')
    await checkAccessibility(page, 'preview con proyectos')

    const project = page.locator('.project-card').first()
    await project.click()
    await expect(page.locator('.project-dialog[open]')).toBeVisible()
    await checkAccessibility(page, 'modal de proyecto', '.project-dialog[open]')
    await page.getByRole('button', { name: 'Cerrar proyecto' }).click()

    await page.goto('/templates/retreat')
    await checkAccessibility(page, 'preview con galería')
    await page.locator('.gallery-grid').focus()
    await page.keyboard.press('ArrowRight')
    await checkAccessibility(page, 'galería después de interacción', '.gallery-carousel')
  })

  test('formularios públicos', async ({ page }) => {
    await page.goto('/templates/restaurant')

    await checkAccessibility(page, 'formularios públicos')
    await checkAccessibility(page, 'formulario de contacto', '.lead-form')
    await checkAccessibility(page, 'formulario de newsletter', '.newsletter-block form')
  })
})
