import test from 'node:test'
import assert from 'node:assert/strict'
import { getPlan, minimumPlanForBlock, planCatalog } from '../src/features/billing/plans'

test('billing catalog exposes the three ARS plans', () => {
  assert.deepEqual(Object.keys(planCatalog), ['free', 'initial', 'professional'])
  assert.equal(planCatalog.free.currency, 'ARS')
  assert.equal(planCatalog.initial.currency, 'ARS')
  assert.equal(planCatalog.professional.currency, 'ARS')
})

test('free plan only enables hero and gallery', () => {
  assert.deepEqual(planCatalog.free.allowedBlocks, ['hero', 'gallery'])
  assert.equal(minimumPlanForBlock('hero'), 'Gratis')
  assert.equal(minimumPlanForBlock('services'), 'Inicial')
  assert.equal(minimumPlanForBlock('video'), 'Profesional')
})

test('unknown plan safely resolves to free', () => {
  assert.equal(getPlan('missing').id, 'free')
})
