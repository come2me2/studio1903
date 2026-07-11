#!/usr/bin/env node
/**
 * STUDIO19.03 — импорт текстов из Markdown
 * node scripts/import-copy.js [path/to/file.md]
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const defaultMdPath = path.join(root, 'content/portfolio-and-projects.md');
const projectsPath = path.join(root, 'data/projects.json');
const editorialPath = path.join(root, 'data/project-editorial.json');
const portfolioPath = path.join(root, 'js/content-portfolio.js');

const PORTFOLIO_KEYS = ['title', 'subtitle', 'more', 'ctaTitle', 'cta'];
const PROJECT_SCALAR_KEYS = ['title', 'type', 'city', 'rc', 'area', 'style', 'year', 'duration'];
const ABOUT_KEYS = ['task', 'solution', 'result'];

function escapeJs(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function parseSections(markdown) {
  const sections = [];
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let current = null;
  let body = [];

  function flush() {
    if (!current) return;
    sections.push({ id: current, body: body.join('\n').trim() });
    body = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      flush();
      current = heading[1].trim();
      continue;
    }
    if (current) {
      body.push(line);
    }
  }
  flush();
  return sections;
}

function isKeyLine(line) {
  return /^(?:about\.\w+|[\w.-]+):(?:\s|$)/.test(line);
}

function parseFields(body) {
  const fields = {};
  const lines = body.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.trim() === '---') {
      i++;
      continue;
    }

    const keyMatch = line.match(/^([\w.-]+):\s*(.*)$/);
    if (!keyMatch) {
      i++;
      continue;
    }

    const key = keyMatch[1];
    const inlineValue = keyMatch[2];

    if (key === 'materials') {
      const items = [];
      i++;
      while (i < lines.length) {
        const itemLine = lines[i];
        if (!itemLine.trim()) {
          i++;
          continue;
        }
        if (isKeyLine(itemLine)) break;
        const bullet = itemLine.match(/^-\s+(.*)$/);
        if (bullet) {
          items.push(bullet[1].trim());
        }
        i++;
      }
      fields.materials = items;
      continue;
    }

    if (inlineValue) {
      fields[key] = inlineValue;
      i++;
      continue;
    }

    const block = [];
    i++;
    while (i < lines.length) {
      const next = lines[i];
      if (isKeyLine(next)) break;
      block.push(next);
      i++;
    }
    fields[key] = block.join('\n').replace(/\s+$/g, '');
  }

  return fields;
}

function writePortfolio(portfolio) {
  const lines = [
    '/**',
    ' * STUDIO19.03 — тексты страницы портфолио',
    ' */',
    'window.STUDIO1903_PAGE = {',
    '  portfolio: {',
  ];

  PORTFOLIO_KEYS.forEach(function (key, index) {
    const suffix = index < PORTFOLIO_KEYS.length - 1 ? ',' : '';
    lines.push("    " + key + ": '" + escapeJs(portfolio[key] || '') + "'" + suffix);
  });

  lines.push('  }');
  lines.push('};');
  lines.push('');
  fs.writeFileSync(portfolioPath, lines.join('\n'));
}

function runNode(script, env) {
  const result = spawnSync(process.execPath, [path.join(root, script)], {
    cwd: root,
    stdio: 'inherit',
    env: Object.assign({}, process.env, env || {}),
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  const mdPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultMdPath;
  if (!fs.existsSync(mdPath)) {
    console.error('File not found:', mdPath);
    process.exit(1);
  }

  const markdown = fs.readFileSync(mdPath, 'utf8');
  const sections = parseSections(markdown);
  const byId = {};
  sections.forEach(function (section) {
    byId[section.id] = section;
  });

  if (!byId.portfolio) {
    console.error('Missing section: ## portfolio');
    process.exit(1);
  }

  const portfolioFields = parseFields(byId.portfolio.body);
  const portfolio = {};
  PORTFOLIO_KEYS.forEach(function (key) {
    portfolio[key] = portfolioFields[key] || '';
  });
  writePortfolio(portfolio);
  console.log('Updated', path.relative(root, portfolioPath));

  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  const editorial = JSON.parse(fs.readFileSync(editorialPath, 'utf8'));
  const seen = new Set();
  const warnings = [];

  projects.forEach(function (project) {
    const sectionId = 'project: ' + project.slug;
    const section = byId[sectionId];
    if (!section) {
      warnings.push('Missing section: ## ' + sectionId);
      return;
    }
    seen.add(sectionId);

    const fields = parseFields(section.body);

    if (fields.title != null) project.title = fields.title;
    if (fields.type != null) project.type = fields.type;
    if (fields.city != null) project.city = fields.city;
    if (fields.rc != null) project.rc = fields.rc || undefined;
    if (fields.area != null) project.area = fields.area || undefined;

    const ed = editorial[project.slug] || {};
    PROJECT_SCALAR_KEYS.forEach(function (key) {
      if (key === 'title' || key === 'type' || key === 'city' || key === 'rc' || key === 'area') return;
      if (fields[key] != null) ed[key] = fields[key];
    });

    ed.about = ed.about || {};
    ABOUT_KEYS.forEach(function (key) {
      if (fields['about.' + key] != null) {
        ed.about[key] = fields['about.' + key];
      }
    });
    if (!ed.about.task && !ed.about.solution && !ed.about.result) {
      delete ed.about;
    }

    if (fields.materials) {
      ed.materialCaptions = fields.materials;
    }

    if (fields.area != null && fields.area) {
      ed.area = fields.area;
    } else if (fields.area === '') {
      delete ed.area;
    }

    if (fields.rc != null && fields.rc) {
      ed.rc = fields.rc;
    } else if (fields.rc === '') {
      delete ed.rc;
    }

    editorial[project.slug] = ed;
  });

  Object.keys(byId).forEach(function (id) {
    if (id !== 'portfolio' && id.indexOf('project: ') === 0 && !seen.has(id)) {
      warnings.push('Unknown section ignored: ## ' + id);
    }
  });

  fs.writeFileSync(editorialPath, JSON.stringify(editorial, null, 2) + '\n');
  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2) + '\n');
  console.log('Updated', path.relative(root, editorialPath));
  console.log('Updated', path.relative(root, projectsPath));

  if (warnings.length) {
    warnings.forEach(function (warning) {
      console.warn('Warning:', warning);
    });
  }

  console.log('Running build-project-story.js…');
  runNode('scripts/build-project-story.js', { SKIP_PROBE: '1' });

  console.log('Running build.js…');
  runNode('scripts/build.js');

  console.log('Import complete.');
}

main();
