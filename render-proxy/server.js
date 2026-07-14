import http from 'node:http';
import https from 'node:https';

const port = Number(process.env.PORT || 10000);

const server = http.createServer(function (req, res) {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'studio1903-telegram-proxy' }));
    return;
  }

  const options = {
    hostname: 'api.telegram.org',
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = https.request(options, function (proxyRes) {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', function (err) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: String(err) }));
  });

  req.pipe(proxyReq);
});

server.listen(port, function () {
  console.log('Telegram proxy listening on', port);
});
