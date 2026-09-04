import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const safePath = normalize(pathname === '/' ? '/index.html' : pathname).replace(/^([/\\])+/, '');
  try {
    const file = join(root, safePath);
    const contents = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' });
    response.end(contents);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
}).listen(4173, () => console.log('Preview: http://localhost:4173'));
