#!/usr/bin/env node
/**
 * SLOW 19 — галерея и magazineSpreads с studio1903.ru/slow19
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { filterGalleryFloorPlans } = require('./lib/project-director');

const root = path.join(__dirname, '..');
const projectsPath = path.join(root, 'data/projects.json');

function curl(url) {
  return execSync('curl -sL "' + url + '"', {
    encoding: 'utf8',
    maxBuffer: 25 * 1024 * 1024
  });
}

function extractGallery(html) {
  const found = [];
  const seen = new Set();
  const patterns = [
    /data-original="(https:\/\/static\.tildacdn\.com\/[^"]+)"/gi,
    /https:\/\/static\.tildacdn\.com\/tild[0-9a-f-]+\/[^"'\s>)]+?\.(jpg|jpeg|png|JPG|webp)/gi
  ];
  patterns.forEach(function (re) {
    let m;
    while ((m = re.exec(html))) {
      const url = (m[1] || m[0]).split('?')[0];
      if (/noroot|favicon|tildacopy/i.test(url)) continue;
      if (!/^https:\/\/static\.tildacdn\.com\/tild[0-9a-f-]+\/.+\.(jpg|jpeg|png|webp)$/i.test(url)) continue;
      if (!seen.has(url)) {
        seen.add(url);
        found.push(url);
      }
    }
  });
  return found;
}

function photo(url, room, caption) {
  return {
    url: url,
    orientation: 'portrait',
    w: 1680,
    h: 2100,
    room: room,
    caption: caption
  };
}

const html = curl('https://studio1903.ru/slow19');
const gallery = filterGalleryFloorPlans(extractGallery(html));

const rooms = [
  'Обложка', 'Гостиная', 'Кухня', 'Кухня', 'Спальня', 'Спальня',
  'Ванная', 'Ванная', 'Прихожая', 'Гардероб', 'Гостиная', 'Деталь',
  'Деталь', 'Коридор', 'Ясень · пол', 'Бумажная фактура · стены',
  'Спальня', 'Гостиная', 'Кухня', 'Ванная', 'Деталь', 'Прихожая',
  'Гардероб', 'Гостиная', 'Деталь', 'Кухня'
];

const captions = [
  '',
  'Гостиная без телевизора — только свет и ткань.',
  'Панорамные окна заливают пространство утренним светом.',
  'Кухня — где утренний свет собирается у окна.',
  'Низкая мебель держит взгляд ближе к полу — и ближе к покою.',
  'Постель на уровне пола — ритуал замедления.',
  'Тактильная керамика вместо глянца.',
  'Вода и камень — без блика и лишнего.',
  'Первый вдох тишины — сразу с порога.',
  'Закрытый ряд — открытое дыхание.',
  'Мягкий свет и лён — без декоративного шума.',
  'Деталь, которую замечаешь на ощупь.',
  'Фактура стены как второй свет.',
  'Коридор как переход между ритмами дня.',
  'Ясень · пол',
  'Бумажная фактура · стены',
  'Утро начинается с тишины и тёплого дерева.',
  'Диван смотрит в окно, а не на экран.',
  'Камень и дерево — южная аутентичность в центре города.',
  'Ванная как спа: камень, лён, рассеянный свет.',
  'Ручная керамика — единственный декоративный акцент.',
  'Прихожая собирает дом в одну линию.',
  'Гардероб без визуального шума — только порядок.',
  'Вечерний свет на песочных стенах.',
  'Тактильность важнее декора.',
  'Кухня как сердце дома — тихое и солнечное.'
];

function itemAt(i) {
  if (i < 0 || i >= gallery.length) return null;
  return photo(gallery[i], rooms[i] || 'Интерьер', captions[i] || '');
}

const taskText =
  'Задачей перед нашей студией была создать в центре Москвы оазис южного аутентичного дома. ' +
  'Песочные тона, натуральный камень, дерево и льняной текстиль стали основой всего интерьера. ' +
  'А благодаря высокому потолку и большим панорамным окнам пространство часто залито солнечными лучами.';

const solutionText =
  'Натуральные оттенки, тактильные поверхности, низкая мебель и рассеянный свет без бликов.';

const resultText =
  'Дом как место восстановления — без декоративного шума, с фокусом на ощущениях.';

const accentText =
  'Песочные тона и тактильные поверхности — язык, на котором говорит весь интерьер.';

const magazineSpreads = [
  { type: 'trio', items: [itemAt(1), itemAt(2), itemAt(3)] },
  { type: 'interlude', label: 'Задача', text: taskText },
  { type: 'duo', items: [itemAt(4), itemAt(5)] },
  { type: 'trio', items: [itemAt(6), itemAt(7), itemAt(8)] },
  { type: 'quote', text: resultText },
  { type: 'duo', items: [itemAt(9), itemAt(10)] },
  { type: 'interlude', label: 'Решение', text: solutionText },
  { type: 'trio', items: [itemAt(11), itemAt(12), itemAt(13)] },
  { type: 'materials' },
  { type: 'duo', items: [itemAt(16), itemAt(17)] },
  { type: 'interlude', label: 'Материалы', text: accentText },
  { type: 'trio', items: [itemAt(18), itemAt(19), itemAt(20)] },
  { type: 'duo', items: [itemAt(21), itemAt(22)] },
  { type: 'trio', items: [itemAt(23), itemAt(24), itemAt(25)] },
  { type: 'wide', items: [itemAt(2)] }
].map(function (spread) {
  if (spread.items) {
    spread.items = spread.items.filter(Boolean);
  }
  return spread;
}).filter(function (spread) {
  if (spread.type === 'materials') return true;
  if (spread.type === 'interlude' || spread.type === 'quote') return !!spread.text;
  return spread.items && spread.items.length;
});

const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
const idx = projects.findIndex(function (p) { return p.slug === 'slow19'; });
if (idx === -1) throw new Error('slow19 not found');

projects[idx] = Object.assign({}, projects[idx], {
  area: '109 м²',
  year: '2026',
  gallery: gallery,
  cover: gallery[0],
  heroImage: gallery[2] || gallery[0],
  about: {
    task: taskText,
    solution: solutionText,
    result: resultText
  },
  materials: [
    {
      image: gallery[14] || projects[idx].materials[0].image,
      caption: 'Ясень · пол',
      orientation: 'portrait',
      w: 1600,
      h: 2000
    },
    {
      image: gallery[15] || projects[idx].materials[1].image,
      caption: 'Бумажная фактура · стены',
      orientation: 'portrait',
      w: 1600,
      h: 2000
    },
    {
      image: gallery[16] || gallery[14],
      caption: 'Керамика · ручная',
      orientation: 'portrait',
      w: 1600,
      h: 2000
    },
    {
      image: gallery[20] || gallery[15],
      caption: 'Лён · текстиль',
      orientation: 'portrait',
      w: 1600,
      h: 2000
    }
  ],
  magazineSpreads: magazineSpreads,
  story: Object.assign({}, projects[idx].story, {
    layoutMode: 'magazine',
    publicationVersion: 7
  })
});

fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2) + '\n');
console.log('slow19: ' + gallery.length + ' photos, ' + magazineSpreads.length + ' spreads');
