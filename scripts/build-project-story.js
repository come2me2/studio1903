#!/usr/bin/env node
/**
 * STUDIO19.03 — сборка story (SMALL / LARGE / FULL)
 * node scripts/build-project-story.js
 * SKIP_PROBE=1
 */
const fs = require('fs');
const path = require('path');
const { directProjectPublication } = require('./lib/project-director');

const root = path.join(__dirname, '..');
const projectsPath = path.join(root, 'data/projects.json');
const editorialPath = path.join(root, 'data/project-editorial.json');
const SKIP_PROBE = process.env.SKIP_PROBE === '1';

const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
const editorial = JSON.parse(fs.readFileSync(editorialPath, 'utf8'));

console.log('Publishing', projects.length, 'projects…', SKIP_PROBE ? '(cache)' : '');

const updated = projects.map(function (p, i) {
  console.log(' ', i + 1 + '/' + projects.length, p.slug);
  const directed = directProjectPublication(p, editorial, { skipProbe: SKIP_PROBE });
  const ed = editorial[p.slug] || {};

  return Object.assign({}, p, {
    city: p.city || 'Москва',
    rc: ed.rc || p.rc,
    area: directed.area || ed.area || p.area,
    style: ed.style || p.style || 'Современный минимализм',
    year: ed.year || p.year || '2022',
    duration: ed.duration || p.duration || '6 месяцев',
    excerpt: (ed.about && ed.about.task) || p.excerpt || p.description,
    about: ed.about ||
      p.about || {
        task: p.description,
        solution: 'Комплексное решение Studio19.03 — от планировки до реализации.',
        result: 'Интерьер, готовый к жизни с первого дня.'
      },
    compositionMode: directed.compositionMode,
    heroImage: directed.heroImage,
    materials: directed.materials,
    story: directed.story
  });
});

fs.writeFileSync(projectsPath, JSON.stringify(updated, null, 2) + '\n');

const modes = {};
updated.forEach(function (p) {
  modes[p.compositionMode] = (modes[p.compositionMode] || 0) + 1;
});
console.log('Composition modes:', modes);
console.log('Updated data/projects.json');
