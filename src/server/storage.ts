import path from 'node:path'

export function dataDirectory() {
  return process.env.PLATFORM_DATA_DIR || path.join(process.cwd(), 'data')
}
