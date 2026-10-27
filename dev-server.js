import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env if present (without overwriting existing env)
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile();

// Import the Vercel serverless function handler
import chatHandler from './api/chat.js';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Route: /api/chat
  if (pathname === '/api/chat') {
    // Collect body
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', async () => {
      const rawBody = Buffer.concat(chunks).toString('utf8');
      let parsedBody = {};
      try {
        parsedBody = rawBody ? JSON.parse(rawBody) : {};
      } catch {
        parsedBody = rawBody;
      }

      req.body = parsedBody;

      // Polyfill Vercel response helper methods
      let statusCode = 200;
      res.status = (code) => {
        statusCode = code;
        res.statusCode = code;
        return res;
      };

      res.json = (data) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
        return res;
      };

      try {
        await chatHandler(req, res);
      } catch (err) {
        console.error('Handler error:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error.' }));
        }
      }
    });
    return;
  }

  // Static files handling
  let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const filePath = path.join(__dirname, relativePath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Access Denied');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('File Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

const PORT = parseInt(process.env.PORT, 10) || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Portfolio dev server running at: http://localhost:${PORT}`);
  console.log(`🤖 Groq Model: ${process.env.GROQ_MODEL || 'openai/gpt-oss-120b'}`);
  console.log(`🔑 Groq API Key: ${process.env.GROQ_API_KEY ? 'Configured' : 'Missing'}\n`);
});
