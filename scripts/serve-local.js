#!/usr/bin/env node
/**
 * Локальный preview с rewrite-правилами как на ONREZA.
 * node scripts/serve-local.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const root = path.join(__dirname, '..');
const port = Number(process.env.PORT) || 8080;

const menuRoutes = {
  '/portfolio': '/pages/portfolio.html',
  '/steps': '/pages/steps.html',
  '/price': '/pages/price.html',
  '/about': '/pages/about.html',
  '/contacts': '/pages/contacts.html',
  '/privacy': '/pages/privacy.html'
};

const projects = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8'));
const rewrites = Object.assign({}, menuRoutes);
projects.forEach(function (p) {
  if (p.path) rewrites[p.path] = '/pages/project.html';
});

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function contentType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function sendFile(filePath, res) {
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    res.end(data);
  });
}

const server = http.createServer(function (req, res) {
  const parsed = url.parse(req.url || '/');
  let pathname = decodeURIComponent(parsed.pathname || '/');

  if (pathname === '/') {
    sendFile(path.join(root, 'index.html'), res);
    return;
  }

  if (rewrites[pathname]) {
    sendFile(path.join(root, rewrites[pathname]), res);
    return;
  }

  const filePath = path.normalize(path.join(root, pathname));
  if (!filePath.startsWith(root)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, function (err, stat) {
    if (!err && stat.isFile()) {
      sendFile(filePath, res);
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
});

server.listen(port, function () {
  console.log('Local preview: http://localhost:' + port);
  console.log('Projects:     http://localhost:' + port + '/airhaus');
  console.log('Portfolio:    http://localhost:' + port + '/portfolio');
});
