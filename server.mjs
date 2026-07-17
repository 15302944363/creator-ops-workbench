import { createReadStream, existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'

const root = join(process.cwd(), 'dist')
const types = { '.css': 'text/css', '.js': 'text/javascript', '.html': 'text/html', '.svg': 'image/svg+xml' }

createServer((request, response) => {
  const target = request.url === '/' ? 'index.html' : decodeURIComponent(request.url || '').replace(/^\/+/, '')
  const file = join(root, target)
  const fallback = join(root, 'index.html')
  const path = existsSync(file) ? file : fallback
  response.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' })
  createReadStream(path).pipe(response)
}).listen(5173, '127.0.0.1')
