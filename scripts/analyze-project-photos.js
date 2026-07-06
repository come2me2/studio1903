#!/usr/bin/env node
/**
 * STUDIO19.03 — анализ галерей и отчёт
 * node scripts/analyze-project-photos.js
 * node scripts/analyze-project-photos.js --validate
 * SKIP_PROBE=1
 */
const fs = require('fs');
const path = require('path');
const {
  directProject,
  formatAnalysisReport,
  validateSequence
} = require('./lib/project-director');

const root = path.join(__dirname, '..');
const projectsPath = path.join(root, 'data/projects.json');
const editorialPath = path.join(root, 'data/project-editorial.json');
const outPath = path.join(root, 'data/project-analysis.json');
const SKIP_PROBE = process.env.SKIP_PROBE === '1';
const VALIDATE = process.argv.includes('--validate');

const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
const editorial = JSON.parse(fs.readFileSync(editorialPath, 'utf8'));

console.log('Analyzing', projects.length, 'projects…', SKIP_PROBE ? '(cache)' : '');

const report = projects.map(function (p, i) {
  console.log(' ', i + 1 + '/' + projects.length, p.slug);
  const directed = directProject(p, editorial, { skipProbe: SKIP_PROBE });
  return {
    slug: p.slug,
    title: p.title,
    compositionMode: directed.compositionMode,
    analysis: directed.analysis,
    sequence: directed.story.sequence,
    materials: directed.materials,
    validation: directed.validation
  };
});

fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
console.log('Wrote', outPath);

['roche82', 'slow19'].forEach(function (slug) {
  const p = projects.find(function (x) {
    return x.slug === slug;
  });
  const d = report.find(function (x) {
    return x.slug === slug;
  });
  if (p && d) {
    console.log('\n' + formatAnalysisReport({ analysis: d.analysis, story: { sequence: d.sequence }, compositionMode: d.compositionMode }, p));
  }
});

if (VALIDATE) {
  let errors = 0;
  report.forEach(function (r) {
    const qa = validateSequence(r.sequence, r.compositionMode);
    const photoRows = r.sequence.filter(function (row) {
      return row.items && row.items.length;
    });
    photoRows.forEach(function (row) {
      if (row.composition === 'small' && row.items.length === 2) {
        const o0 = row.items[0].orientation;
        const o1 = row.items[1].orientation;
        if (o0 !== o1 && o0 !== 'square' && o1 !== 'square') {
          console.error('ORIENTATION MISMATCH', r.slug, row);
          errors += 1;
        }
      }
      row.items.forEach(function (item) {
        if (row.orientation === 'portrait' && item.orientation === 'landscape') {
          console.error('P in L container', r.slug, item.galleryIndex);
          errors += 1;
        }
        if (row.orientation === 'landscape' && item.orientation === 'portrait') {
          console.error('L in P container', r.slug, item.galleryIndex);
          errors += 1;
        }
      });
    });
  });
  if (errors) {
    console.error('Validation failed:', errors, 'issues');
    process.exit(1);
  }
  console.log('Validation OK for all projects');
}

report.forEach(function (r) {
  console.log(
    r.slug.padEnd(14),
    r.compositionMode.padEnd(8),
    'frames:' + r.sequence.filter((x) => x.items).length,
    'mat:' + (r.materials ? r.materials.length : 0)
  );
});
