import { withPayload } from '@payloadcms/next/withPayload'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

export default (phase) => withPayload({
  // Development and production must never write to the same webpack output.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
})
