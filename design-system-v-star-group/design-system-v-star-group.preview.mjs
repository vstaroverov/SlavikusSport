import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.tsx':'text/plain; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.txt':'text/plain; charset=utf-8', '.json':'application/json; charset=utf-8', '.md':'text/plain; charset=utf-8' };
http.createServer(async (req,res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const filename = pathname === '/' ? 'design-system-v-star-group.html' : pathname.slice(1);
    const target = path.resolve(root,filename);
    const relative = path.relative(root,target);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !types[path.extname(target)]) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    const body = await readFile(target);
    res.writeHead(200, {'Content-Type':types[path.extname(target)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4178,'127.0.0.1', () => console.log('Design system: http://127.0.0.1:4178'));
