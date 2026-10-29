// Serves rendered/ as the desk sees it: plain files, no build step. `npm run serve [port]`.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('../rendered/', import.meta.url).pathname;
const port = Number(process.argv[2] ?? process.env.PORT ?? 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path === '/') return res.writeHead(302, { location: '/kb/' }).end();
  if (!extname(path) && !path.endsWith('/')) return res.writeHead(301, { location: `${path}/` }).end();
  const file = join(root, normalize(path.endsWith('/') ? `${path}index.html` : path));
  if (!file.startsWith(root)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end(`not rendered: ${path}`);
  }
}).listen(port, () => console.log(`rendered/ at http://localhost:${port}/kb/`));
