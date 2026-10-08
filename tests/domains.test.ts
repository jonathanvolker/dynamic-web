import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeDnsName, normalizeHostname } from '../src/features/domains/validation'

test('normalizes only valid www hostnames', () => {
  assert.equal(normalizeHostname(' WWW.Example.com. '), 'www.example.com')
  assert.equal(normalizeHostname('example.com'), null)
  assert.equal(normalizeHostname('www.example'), null)
  assert.equal(normalizeHostname('www.example..com'), null)
  assert.equal(normalizeHostname('www.-example.com'), null)
  assert.equal(normalizeHostname('www.example-.com'), null)
  assert.equal(normalizeHostname('www.example.com/path'), null)
})

test('normalizes DNS CNAME names without weakening label rules', () => {
  assert.equal(normalizeDnsName('Forma.Example.com.'), 'forma.example.com')
  assert.equal(normalizeDnsName('forma example.com'), null)
  assert.equal(normalizeDnsName('forma..example.com'), null)
  assert.equal(normalizeDnsName(''), null)
})
