/**
 * Проверка разбора статей журнала. node scripts/test-journal.js
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const journal = require('./lib/journal');

const header = '<header data-test="header"></header>';
const footer = '<footer data-test="footer"></footer>';

function articleSource(overrides) {
  const fields = Object.assign(
    {
      title: 'Заголовок окна — Studio19.03',
      description: 'Короткое описание для поиска и соцсетей, без разметки.',
      h1: 'Свет у окна',
      excerpt: 'Карточка: одна фраза о свете.',
      date: '2026-03-01',
      cover: '/images/journal/svet/cover.jpg',
      coverAlt: 'Окно гостиной'
    },
    overrides || {}
  );
  const lines = ['---'];
  Object.keys(fields).forEach(function (key) {
    if (key === 'body' || fields[key] === undefined) return;
    lines.push(key + ': ' + fields[key]);
  });
  lines.push('---', '', fields.body || defaultBody());
  return lines.join('\n');
}

function defaultBody() {
  return [
    'Первый абзац со ссылкой на [портфолио](/portfolio) и **акцент**.',
    '',
    '## Раздел',
    '',
    'Текст раздела и *курсив*.',
    '',
    '### Деталь',
    '',
    '- Первый пункт',
    '- Второй пункт',
    '',
    '![Подпись к кадру](/images/journal/svet/detail.jpg "Крупный план штор")',
    '',
    ':::faq',
    'Когда решать свет?',
    '',
    'До начала ремонта, вместе с [планом](/steps).',
    '',
    'Нужен ли диммер?',
    '',
    'Да, если вечером свет кажется жёстким.',
    ':::'
  ].join('\n');
}

function mustThrow(fn, re) {
  let threw = false;
  try {
    fn();
  } catch (err) {
    threw = true;
    if (re) assert.match(err.message, re);
  }
  assert.strictEqual(threw, true);
}

const parsed = journal.parseArticle('svet', articleSource(), { checkAssets: false });
assert.strictEqual(parsed.slug, 'svet');
assert.strictEqual(parsed.h1, 'Свет у окна');
assert.ok(parsed.html.indexOf('<h2>Раздел</h2>') !== -1);
assert.ok(parsed.html.indexOf('<h3>Деталь</h3>') !== -1);
assert.ok(parsed.html.indexOf('href="/portfolio"') !== -1);
assert.ok(parsed.html.indexOf('<strong>акцент</strong>') !== -1);
assert.ok(parsed.html.indexOf('<em>курсив</em>') !== -1);
assert.ok(parsed.html.indexOf('<figcaption>Подпись к кадру</figcaption>') !== -1);
assert.ok(parsed.html.indexOf('alt="Крупный план штор"') !== -1);
assert.ok(parsed.html.indexOf('class="s1903-journal-figure"') !== -1);
assert.ok(parsed.html.indexOf('object-fit') === -1);
assert.strictEqual(parsed.faq.length, 2);
assert.strictEqual(parsed.faq[0].q, 'Когда решать свет?');
assert.ok(parsed.faq[0].a.indexOf('планом') !== -1);
assert.ok(parsed.faq[0].a.indexOf('<a') === -1);
assert.deepStrictEqual(parsed.images, ['/images/journal/svet/cover.jpg', '/images/journal/svet/detail.jpg']);

const tricky = journal.parseArticle(
  'amp',
  articleSource({
    title: 'A & B "кавычки" <tag>',
    h1: 'Заголовок <script>',
    description: 'Описание & ещё',
    excerpt: 'Анонс <b>нет</b>',
    body: 'Ссылка [внутренняя](/journal/amp) и внешняя [сайт](https://example.com).'
  }),
  { checkAssets: false }
);
const page = journal.renderArticlePage({ article: tricky, header: header, footer: footer });
assert.ok(page.indexOf('<title>A &amp; B &quot;кавычки&quot; &lt;tag&gt;</title>') !== -1);
assert.ok(page.indexOf('content="Описание &amp; ещё"') !== -1);
assert.ok(page.indexOf('<h1 class="s1903-title s1903-reveal">Заголовок &lt;script&gt;</h1>') !== -1);
assert.ok(page.indexOf('<script>alert') === -1);
assert.ok(page.indexOf('rel="canonical" href="https://studio1903.ru/journal/amp"') !== -1);
assert.ok(page.indexOf('property="og:type" content="article"') !== -1);
assert.ok(page.indexOf('property="og:image" content="https://studio1903.ru/images/journal/svet/cover.jpg"') !== -1);
assert.ok(page.indexOf('"@type":"Article"') !== -1);
assert.ok(page.indexOf('<script>') === -1);
const ld = JSON.parse(page.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.strictEqual(ld['@graph'][0]['@type'], 'Article');
assert.strictEqual(ld['@graph'][0].headline, 'Заголовок <script>');
assert.strictEqual(ld['@graph'].length, 1);
const faqPage = journal.renderArticlePage({ article: parsed, header: header, footer: footer });
const faqLd = JSON.parse(faqPage.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.strictEqual(faqLd['@graph'][1]['@type'], 'FAQPage');
assert.strictEqual(faqLd['@graph'][1].mainEntity.length, 2);
const cardList = journal.renderListPage({
  articles: [tricky],
  page: 1,
  totalPages: 1,
  header: header,
  footer: footer
});
assert.ok(cardList.indexOf('Анонс &lt;b&gt;нет&lt;/b&gt;') !== -1);
assert.ok(page.indexOf('href="/journal/amp"') !== -1);
assert.ok(page.indexOf('href="https://example.com"') !== -1);
assert.ok(page.indexOf('object-fit: contain') === -1);
assert.ok(page.indexOf('s1903-journal-cover') !== -1);
assert.ok(page.indexOf('fetchpriority="high"') !== -1);

mustThrow(function () {
  journal.parseArticle('svet', articleSource({ body: 'Смотри [злое](javascript:alert(1)).' }), { checkAssets: false });
}, /недопустимая ссылка/);

mustThrow(function () {
  journal.parseArticle('page', articleSource(), { checkAssets: false });
}, /зарезервирован/);

mustThrow(function () {
  journal.parseArticle('svet', articleSource({ date: '2026-13-01' }), { checkAssets: false });
}, /date/);

mustThrow(function () {
  journal.parseArticle('svet', articleSource({ slug: 'drugoi' }), { checkAssets: false });
}, /не совпадает/);

const dates = ['2026-01-01', '2026-06-15', '2025-12-01'];
const many = dates.map(function (date, index) {
  return journal.parseArticle('n' + index, articleSource({ date: date, h1: 'Статья ' + date }), {
    checkAssets: false,
    file: 'n' + index + '.md'
  });
});
many.sort(function (a, b) {
  return a.date < b.date ? 1 : -1;
});
assert.strictEqual(journal.pageArticles(many, 1)[0].date, '2026-06-15');

const thirteen = [];
for (let n = 1; n <= 13; n += 1) {
  const day = String(n).padStart(2, '0');
  thirteen.push(
    journal.parseArticle('d' + day, articleSource({ date: '2026-01-' + day, h1: 'День ' + n, excerpt: 'Анонс ' + n }), {
      checkAssets: false
    })
  );
}
thirteen.sort(function (a, b) {
  return a.date < b.date ? 1 : -1;
});
assert.strictEqual(journal.PER_PAGE, 12);
assert.strictEqual(journal.totalPagesFor(13), 2);
assert.strictEqual(journal.totalPagesFor(0), 1);
assert.strictEqual(journal.totalPagesFor(12), 1);
assert.strictEqual(journal.pageArticles(thirteen, 1).length, 12);
assert.strictEqual(journal.pageArticles(thirteen, 1)[0].h1, 'День 13');
assert.strictEqual(journal.pageArticles(thirteen, 2).length, 1);
assert.strictEqual(journal.pageArticles(thirteen, 2)[0].h1, 'День 1');

const list = journal.renderListPage({
  articles: thirteen,
  page: 1,
  totalPages: 2,
  header: header,
  footer: footer
});
assert.ok(list.indexOf('rel="canonical" href="https://studio1903.ru/journal"') !== -1);
assert.ok(list.indexOf('rel="next" href="https://studio1903.ru/journal/page/2"') !== -1);
assert.ok(list.indexOf('name="robots"') === -1);
assert.ok(list.indexOf('>День 13</h2>') !== -1);
assert.ok(list.indexOf('>День 1</h2>') === -1);
assert.ok(list.indexOf('href="/journal/page/2"') !== -1);
assert.strictEqual((list.match(/s1903-journal-card s1903-reveal/g) || []).length, 12);
assert.ok(list.indexOf('loading="lazy"') !== -1);

const list2 = journal.renderListPage({
  articles: thirteen,
  page: 2,
  totalPages: 2,
  header: header,
  footer: footer
});
assert.ok(list2.indexOf('rel="canonical" href="https://studio1903.ru/journal/page/2"') !== -1);
assert.ok(list2.indexOf('<title>Журнал — страница 2 — Studio19.03</title>') !== -1);
assert.ok(list2.indexOf('>День 1</h2>') !== -1);
assert.strictEqual((list2.match(/s1903-journal-card s1903-reveal/g) || []).length, 1);

const empty = journal.renderListPage({
  articles: [],
  page: 1,
  totalPages: 1,
  header: header,
  footer: footer
});
assert.ok(empty.indexOf(journal.LIST_COPY.empty) !== -1);
assert.ok(empty.indexOf('name="robots" content="noindex"') !== -1);
assert.ok(empty.indexOf('s1903-journal-card') === -1);
assert.ok(empty.indexOf('href="/journal"') !== -1 || empty.indexOf('Журнал') !== -1);

const routes = journal.journalRoutes(thirteen.slice().sort(function (a, b) {
  return a.slug < b.slug ? -1 : 1;
}));
assert.ok(routes.some(function (route) {
  return route.path === '/journal' && route.target === '/pages/journal.html';
}));
assert.ok(routes.some(function (route) {
  return route.path === '/journal/page/2';
}));
assert.strictEqual(
  routes.filter(function (route) {
    return route.path.indexOf('/journal/d') === 0;
  }).length,
  13
);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'journal-'));
fs.mkdirSync(path.join(tmp, 'content', 'journal'), { recursive: true });
fs.mkdirSync(path.join(tmp, 'images', 'journal', 'live'), { recursive: true });
fs.writeFileSync(path.join(tmp, 'images', 'journal', 'live', 'cover.jpg'), 'img');
fs.writeFileSync(path.join(tmp, 'content', 'journal', 'README.md'), 'не статья');
fs.writeFileSync(
  path.join(tmp, 'content', 'journal', 'live.md'),
  articleSource({
    date: '2026-02-02',
    cover: '/images/journal/live/cover.jpg',
    body: 'Только абзац.'
  })
);
fs.writeFileSync(
  path.join(tmp, 'content', 'journal', 'hidden.md'),
  articleSource({
    date: '2026-08-08',
    draft: true,
    cover: '/images/journal/live/cover.jpg',
    h1: 'Черновик',
    body: 'Не публиковать.'
  })
);
const loaded = journal.loadArticles(tmp);
assert.strictEqual(loaded.length, 1);
assert.strictEqual(loaded[0].slug, 'live');
assert.strictEqual(loaded[0].faq.length, 0);
const noFaq = journal.renderArticlePage({ article: loaded[0], header: header, footer: footer });
assert.ok(noFaq.indexOf('FAQPage') === -1);
assert.ok(noFaq.indexOf('"@type":"Article"') !== -1);

fs.writeFileSync(path.join(tmp, 'content', 'journal', 'Bad Name.md'), '---\n---\n');
mustThrow(function () {
  journal.loadArticles(tmp);
}, /slug/);

fs.unlinkSync(path.join(tmp, 'content', 'journal', 'Bad Name.md'));
fs.unlinkSync(path.join(tmp, 'images', 'journal', 'live', 'cover.jpg'));
mustThrow(function () {
  journal.loadArticles(tmp);
}, /файл не найден/);

const css = fs.readFileSync(path.join(__dirname, '../css/pages/journal.css'), 'utf8');
assert.ok(css.indexOf('object-fit: contain') !== -1);
assert.ok(css.indexOf('height: auto') !== -1);
assert.ok(css.indexOf('object-fit: cover') === -1);

console.log('journal tests ok');
