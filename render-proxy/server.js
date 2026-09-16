import http from 'node:http';
import https from 'node:https';

const port = Number(process.env.PORT || 10000);

const server = http.createServer(function (req, res) {
  if (req.method === 'GET' && (req.url === '/' || req.url === '')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'studio1903-telegram-proxy' }));
    return;
  }

  const headers = {
    host: 'api.telegram.org'
  };
  const contentType = req.headers['content-type'];
  if (contentType) headers['content-type'] = contentType;
  const contentLength = req.headers['content-length'];
  if (contentLength) headers['content-length'] = contentLength;

  const options = {
    hostname: 'api.telegram.org',
    servername: 'api.telegram.org',
    path: req.url,
    method: req.method,
    headers: headers
  };

  const proxyReq = https.request(options, function (proxyRes) {
    const outHeaders = { 'Content-Type': proxyRes.headers['content-type'] || 'application/json' };
    res.writeHead(proxyRes.statusCode || 502, outHeaders);
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
