#!/usr/bin/env node
/**
 * STUDIO19.03 — сбор фото проектов со studio1903.ru
 * Использование: node scripts/scrape-project-images.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const projectsPath = path.join(root, 'data/projects.json');

function curl(url) {
  try {
    return execSync('curl -sL "' + url + '"', {
      encoding: 'utf8',
      maxBuffer: 25 * 1024 * 1024
    });
  } catch (e) {
    return '';
  }
}

function extractGallery(html) {
  const found = [];
  const seen = new Set();
  const re = /data-original="(https:\/\/static\.tildacdn\.com\/[^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    const url = m[1].split('?')[0];
    if (/noroot|favicon|tildacopy/i.test(url)) continue;
    if (!seen.has(url)) {
      seen.add(url);
      found.push(url);
    }
  }
  if (found.length) return found;
  const re2 = /https:\/\/static\.tildacdn\.com\/tild[0-9a-f-]+\/[^"'\s>)]+?\.(jpg|jpeg|png|JPG|webp)/gi;
  while ((m = re2.exec(html))) {
    const url = m[0].split('?')[0];
    if (/noroot|favicon|tildacopy/i.test(url)) continue;
    if (!seen.has(url)) {
      seen.add(url);
      found.push(url);
    }
  }
  return found;
}

const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

const updated = projects.map(function (p) {
  const html = curl('https://studio1903.ru' + p.path);
  const gallery = extractGallery(html);
  const cover = gallery[0] || p.cover;
  const gal = gallery.length ? gallery.slice(0, 16) : p.gallery || [cover];
  console.log(p.slug + ': ' + gal.length + ' photos');
  return Object.assign({}, p, { cover: cover, gallery: gal });
});

fs.writeFileSync(projectsPath, JSON.stringify(updated, null, 2) + '\n');
console.log('Updated data/projects.json');
