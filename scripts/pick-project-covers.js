#!/usr/bin/env node
/**
 * STUDIO19.03 — подбор обложек по ориентации (portrait / landscape)
 * Требует macOS sips. Использование: node scripts/pick-project-covers.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '..', 'data/projects.json');

function imageSize(url) {
  try {
    const out = execSync(
      'curl -sL "' + url + '" -o /tmp/s1903-probe.jpg && sips -g pixelWidth -g pixelHeight /tmp/s1903-probe.jpg 2>/dev/null',
      { encoding: 'utf8' }
    );
    const w = parseInt((out.match(/pixelWidth:\s*(\d+)/) || [])[1], 10);
    const h = parseInt((out.match(/pixelHeight:\s*(\d+)/) || [])[1], 10);
    if (!w || !h) return null;
    return { w, h, ratio: w / h };
  } catch (e) {
    return null;
  }
}

function classify(size) {
  if (!size) return 'unknown';
  if (size.ratio > 1.08) return 'landscape';
  if (size.ratio < 0.92) return 'portrait';
  return 'square';
}

const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

const updated = projects.map(function (p) {
  const urls = p.gallery && p.gallery.length ? p.gallery : [p.cover];
  let coverPortrait = null;
  let coverLandscape = null;
  let bestPortraitScore = 0;
  let bestLandscapeScore = 0;
  const sizeByUrl = {};

  urls.forEach(function (url) {
    const size = imageSize(url);
    if (size) sizeByUrl[url] = size;
    const kind = classify(size);
    if (kind === 'portrait' && size && size.h / size.w > bestPortraitScore) {
      bestPortraitScore = size.h / size.w;
      coverPortrait = url;
    }
    if (kind === 'landscape' && size && size.ratio > bestLandscapeScore) {
      bestLandscapeScore = size.ratio;
      coverLandscape = url;
    }
    if (kind === 'square') {
      if (!coverPortrait) coverPortrait = url;
      if (!coverLandscape) coverLandscape = url;
    }
  });

  const fallback = p.cover || coverPortrait || coverLandscape;
  const primaryCover = coverPortrait || fallback;
  const landscapeCover = coverLandscape || fallback;
  const landscapeSize = sizeByUrl[landscapeCover] || imageSize(landscapeCover);
  const coverOrientation = classify(landscapeSize) === 'landscape' ? 'landscape' : 'portrait';

  return Object.assign({}, p, {
    cover: primaryCover,
    coverPortrait: coverPortrait || fallback,
    coverLandscape: landscapeCover,
    coverOrientation: coverOrientation,
    portfolioCover: coverPortrait || fallback
  });
});

fs.writeFileSync(projectsPath, JSON.stringify(updated, null, 2) + '\n');
console.log('Updated coverPortrait / coverLandscape for', updated.length, 'projects');
