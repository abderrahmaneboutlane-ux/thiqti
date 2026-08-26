const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json'
};
const PORT = process.env.PORT || 8080;
http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p === '/' || p === '/index.html') p = '/single.html';
  try {
    const buf = fs.readFileSync(path.join(root, p));
    const ext = path.extname(p).toLowerCase();
    s.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'no-cache, must-revalidate'
    });
    s.end(buf);
  } catch (e) { s.statusCode = 404; s.end('404 - Introuvable'); }
}).listen(PORT, () => {
  console.log('Thiqti tourne sur http://localhost:' + PORT);
});
