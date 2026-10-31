import http from 'http';
import handler from '../api/interactions';
import 'colors';

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  if (req.url === '/api/interactions' || req.url === '/' || req.url === '/interactions') {
    return handler(req, res);
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ⚡ UCBOT - VERCEL SERVERLESS DEV SERVER                    ║
║                                                              ║
║   📡 Endpoint local: http://localhost:${PORT}/api/interactions    ║
║                                                              ║
║   💡 Usa ngrok / cloudflared para exponer tu URL a Discord: ║
║      cloudflared tunnel --url http://localhost:${PORT}          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`.cyan);
});

