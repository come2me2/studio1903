#!/usr/bin/env node
/**
 * STUDIO19.03 — экспорт текстов портфолио и проектов в Markdown
 * node scripts/export-copy.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const projectsPath = path.join(root, 'data/projects.json');
const editorialPath = path.join(root, 'data/project-editorial.json');
const portfolioPath = path.join(root, 'js/content-portfolio.js');
const outPath = path.join(root, 'content/portfolio-and-projects.md');

const PORTFOLIO_KEYS = ['title', 'subtitle', 'more', 'ctaTitle', 'cta'];
const PROJECT_SCALAR_KEYS = ['title', 'type', 'city', 'rc', 'area', 'style', 'year', 'duration'];
const ABOUT_KEYS = ['task', 'solution', 'result'];

function readPortfolio() {
  const src = fs.readFileSync(portfolioPath, 'utf8');
  const portfolio = {};
  PORTFOLIO_KEYS.forEach(function (key) {
    const re = new RegExp(key + ":\\s*'((?:\\\\'|[^'])*)'");
    const match = src.match(re);
    portfolio[key] = match ? match[1].replace(/\\'/g, "'") : '';
  });
  return portfolio;
}

function materialCaptions(project, editorial) {
  const ed = editorial[project.slug];
  if (ed && ed.materialCaptions && ed.materialCaptions.length) {
    return ed.materialCaptions;
  }
  return (project.materials || []).map(function (m) {
    return m.caption;
  }).filter(Boolean);
}

function formatScalar(key, value) {
  const text = value == null ? '' : String(value);
  if (!text.includes('\n')) {
    return key + ': ' + text;
  }
  return key + ':\n' + text;
}

function formatBlock(key, value) {
  const text = (value || '').trimEnd();
  if (!text) {
    return key + ':';
  }
  return key + ':\n' + text;
}

function exportProject(project, editorial) {
  const lines = [];
  const about = project.about || {};

  PROJECT_SCALAR_KEYS.forEach(function (key) {
    let value = project[key];
    if ((key === 'area' || key === 'rc') && (value == null || value === '')) {
      value = '';
    }
    lines.push(formatScalar(key, value == null ? '' : value));
  });

  lines.push('');
  ABOUT_KEYS.forEach(function (key) {
    lines.push(formatBlock('about.' + key, about[key] || ''));
    lines.push('');
  });

  const materials = materialCaptions(project, editorial);
  lines.push('materials:');
  materials.forEach(function (caption) {
    lines.push('- ' + caption);
  });

  return lines.join('\n').trimEnd();
}

function main() {
  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  const editorial = JSON.parse(fs.readFileSync(editorialPath, 'utf8'));
  const portfolio = readPortfolio();

  const parts = [
    '# STUDIO19.03 — тексты для редактирования',
    '',
    '> Инструкция: меняйте только текст после «:». Заголовки ## и slug не трогайте.',
    '> Пустое значение после «:» = поле очищается. Многострочный текст — в блоке ниже ключа.',
    '',
    '## portfolio',
    '',
  ];

  PORTFOLIO_KEYS.forEach(function (key) {
    parts.push(formatScalar(key, portfolio[key] || ''));
  });

  projects.forEach(function (project, index) {
    parts.push('');
    parts.push('---');
    parts.push('');
    parts.push('## project: ' + project.slug);
    parts.push('');
    parts.push(exportProject(project, editorial));
    if (index < projects.length - 1) {
      parts.push('');
    }
  });

  parts.push('');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, parts.join('\n'));
  console.log('Exported', projects.length, 'projects to', path.relative(root, outPath));
}

main();
