#!/usr/bin/env node
/**
 * STUDIO19.03 — сбор фото проектов с holl.tilda.ws
 * Использование: node scripts/scrape-project-images.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { filterGalleryFloorPlans, fileNameFromUrl } = require('./lib/project-director');

const root = path.join(__dirname, '..');
const projectsPath = path.join(root, 'data/projects.json');
const BASE_URL = 'https://holl.tilda.ws';

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

function extractUrlsFromBlock(chunk) {
  const found = [];
  const seen = new Set();
  const re = /data-original="(https:\/\/static\.tildacdn\.com\/[^"]+)"/gi;
  let m;
  while ((m = re.exec(chunk))) {
    const url = m[1].split('?')[0];
    if (/noroot|favicon|tildacopy/i.test(url)) continue;
    if (!seen.has(url)) {
      seen.add(url);
      found.push(url);
    }
  }
  return found;
}

function blockOverlap(a, b) {
  const setB = new Set(b);
  let common = 0;
  a.forEach(function (url) {
    if (setB.has(url)) common += 1;
  });
  return common / Math.min(a.length, b.length);
}

function uniqueFnames(urls) {
  const seen = new Set();
  const out = [];
  urls.forEach(function (url) {
    const f = fileNameFromUrl(url);
    if (!seen.has(f)) {
      seen.add(f);
      out.push(f);
    }
  });
  return out;
}

function isFnameSubset(subset, superset) {
  const sup = new Set(uniqueFnames(superset));
  return uniqueFnames(subset).every(function (f) {
    return sup.has(f);
  });
}

function looksLikeSeriesStart(url) {
  const fname = fileNameFromUrl(url);
  if (/^1\.(jpe?g|png|webp)$/i.test(fname)) return true;
  if (/^01_01_/i.test(fname)) return true;
  if (/^__1\.(jpe?g|png|webp)$/i.test(fname)) return true;
  return false;
}

function seriesStartScore(url) {
  const fname = fileNameFromUrl(url);
  if (looksLikeSeriesStart(url)) return 0;
  const m = fname.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 9999;
}

function pickBestBlock(blocks) {
  if (blocks.length === 1) return blocks[0];

  const subsetCandidates = blocks.filter(function (b) {
    return blocks.some(function (other) {
      return other.length > b.length && isFnameSubset(b, other);
    });
  });
  if (subsetCandidates.length) {
    return subsetCandidates.reduce(function (a, b) {
      return a.length <= b.length ? a : b;
    });
  }

  const hasSeriesStart = blocks.some(function (b) {
    return looksLikeSeriesStart(b[0]);
  });
  if (hasSeriesStart) {
    let best = blocks[0];
    for (let i = 1; i < blocks.length; i += 1) {
      const candidate = blocks[i];
      const aStart = looksLikeSeriesStart(best[0]);
      const bStart = looksLikeSeriesStart(candidate[0]);
      if (bStart && !aStart) {
        best = candidate;
      } else if (aStart === bStart) {
        const aScore = seriesStartScore(best[0]);
        const bScore = seriesStartScore(candidate[0]);
        if (bScore < aScore) best = candidate;
        else if (bScore === aScore && candidate.length < best.length) best = candidate;
      }
    }
    return best;
  }

  return blocks.reduce(function (a, b) {
    return a.length <= b.length ? a : b;
  });
}

function dedupeBlocks(blocks) {
  const unique = [];
  blocks.forEach(function (block) {
    const dup = unique.find(function (u) {
      return blockOverlap(u, block) > 0.9;
    });
    if (!dup) unique.push(block);
  });
  return unique;
}

function extractGalleryFromPage(html) {
  const parts = html.split(/id="rec\d+"/i);
  const blocks = [];
  for (let i = 1; i < parts.length; i += 1) {
    const urls = extractUrlsFromBlock(parts[i]);
    if (urls.length >= 5) blocks.push(urls);
  }

  if (!blocks.length) {
    const fallback = extractUrlsFromBlock(html);
    return filterGalleryFloorPlans(fallback.length >= 5 ? fallback : []);
  }

  const unique = dedupeBlocks(blocks);
  return filterGalleryFloorPlans(pickBestBlock(unique));
}

function extractFloorPlanFromPage(html) {
  const parts = html.split(/id="rec\d+"/i);
  let lastSingle = null;

  for (let i = 1; i < parts.length; i += 1) {
    const urls = extractUrlsFromBlock(parts[i]);
    if (urls.length === 1) lastSingle = urls[0];
  }

  return lastSingle;
}

const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

const updated = projects.map(function (p) {
  const html = curl(BASE_URL + p.path);
  const gallery = extractGalleryFromPage(html);
  const floorPlan = extractFloorPlanFromPage(html);
  const cover = gallery[0] || p.cover;
  const gal = gallery.length ? gallery : p.gallery || [cover];
  console.log(
    p.slug + ': ' + gal.length + ' photos' + (floorPlan ? ', floor plan' : '')
  );
  return Object.assign({}, p, { cover: cover, gallery: gal, floorPlan: floorPlan });
});

fs.writeFileSync(projectsPath, JSON.stringify(updated, null, 2) + '\n');
console.log('Updated data/projects.json');
