const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 8787);
const OWNER_ACCESS_CODE = process.env.OWNER_ACCESS_CODE || '';
const ROOT = __dirname;
const projects = new Map();
const jobs = new Map();

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; if (data.length > 1_000_000) reject(new Error('payload_too_large')); });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('invalid_json')); } });
    req.on('error', reject);
  });
}

function createJob(payload) {
  const id = crypto.randomUUID();
  const job = { id, type: payload.type || 'story', status: 'queued', progress: 0, createdAt: new Date().toISOString() };
  jobs.set(id, job);
  setTimeout(() => { const current = jobs.get(id); if (current) { current.status = 'processing'; current.progress = 35; } }, 600);
  setTimeout(() => { const current = jobs.get(id); if (current) { current.status = 'completed'; current.progress = 100; current.result = { message: 'Demo üretim tamamlandı' }; } }, 1800);
  return job;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return send(res, 200, { ok: true, mode: 'demo', time: new Date().toISOString() });
    if (req.method === 'GET' && url.pathname === '/api/projects') return send(res, 200, [...projects.values()]);
    if (req.method === 'POST' && url.pathname === '/api/projects') {
      const body = await readJson(req);
      const project = { id: crypto.randomUUID(), name: body.name || 'Yeni proje', story: body.story || '', createdAt: new Date().toISOString() };
      projects.set(project.id, project);
      return send(res, 201, project);
    }
    if (req.method === 'POST' && url.pathname === '/api/jobs') return send(res, 202, createJob(await readJson(req)));
    if (req.method === 'POST' && url.pathname === '/api/owner/verify') {
      const body = await readJson(req);
      return send(res, 200, { valid: Boolean(OWNER_ACCESS_CODE && body.code && body.code === OWNER_ACCESS_CODE) });
    }
    if (req.method === 'GET' && url.pathname.startsWith('/api/jobs/')) {
      const job = jobs.get(url.pathname.split('/').pop());
      return job ? send(res, 200, job) : send(res, 404, { error: 'job_not_found' });
    }
    if (req.method === 'GET') {
      const filePath = url.pathname === '/' ? path.join(ROOT, 'index.html') : path.join(ROOT, url.pathname.replace(/^\//, ''));
      if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath)) return send(res, 404, { error: 'not_found' });
      const ext = path.extname(filePath); const type = ext === '.html' ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8';
      return send(res, 200, fs.readFileSync(filePath), type);
    }
    return send(res, 405, { error: 'method_not_allowed' });
  } catch (error) { return send(res, error.message === 'payload_too_large' ? 413 : 400, { error: error.message }); }
});

server.listen(PORT, () => console.log(`Hikâye Atölyesi çalışıyor: http://localhost:${PORT}`));
