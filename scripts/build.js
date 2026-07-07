const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const partials = path.join(root, 'partials');
const tildaDir = path.join(root, 'tilda');
const pagesDir = path.join(root, 'pages');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function readPartial(name) {
  return fs.readFileSync(path.join(partials, name), 'utf8');
}

const cssBundle = [
  read('css/styles.css'),
  read('css/art-direction.css'),
  read('css/pages.css'),
  read('css/pages/portfolio.css'),
  read('css/pages/project.css'),
  read('css/pages/inner.css'),
  read('css/tilda-fixes.css')
].join('\n');

function cssBundleFor(extraFiles) {
  return [
    read('css/styles.css'),
    read('css/art-direction.css'),
    read('css/pages.css'),
    ...(extraFiles || []).map(function (f) {
      return read(f);
    }),
    read('css/tilda-fixes.css')
  ].join('\n');
}

const projects = JSON.parse(read('data/projects.json'));
const projectsVersion = fs.statSync(path.join(root, 'data/projects.json')).mtimeMs;
const projectsJs =
  '/**\n * STUDIO19.03 — каталог проектов (сгенерировано build.js)\n */\nwindow.STUDIO1903_PROJECTS = ' +
  JSON.stringify(projects, null, 2) +
  ';\n';
fs.writeFileSync(path.join(root, 'js/projects.js'), projectsJs);

const logoUrls = require(path.join(root, 'tilda/logo-urls.js'));
let imagesRaw = read('js/images.js');
if (logoUrls.src) {
  imagesRaw = imagesRaw.replace(
    /src: 'https:\/\/static\.tildacdn\.com\/tild3230[^']*'/,
    "src: '" + logoUrls.src + "'"
  );
}
if (logoUrls.srcDark) {
  imagesRaw = imagesRaw.replace(
    /srcDark: 'https:\/\/static\.tildacdn\.com\/tild3461[^']*'/,
    "srcDark: '" + logoUrls.srcDark + "'"
  );
}

const siteHead = `<!-- STUDIO19.03 — вставьте ОДИН РАЗ в Настройки сайта → HTML в head -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
${cssBundle}
</style>
`;
fs.writeFileSync(path.join(tildaDir, 'site-head.html'), siteHead);

const siteCore = `<!-- STUDIO19.03 — вставьте ОДИН РАЗ перед </body> в настройках сайта -->
<script>
${imagesRaw}
${read('js/paths.js')}
${read('js/content-shared.js')}
${read('js/core.js')}
${projectsJs}
</script>
`;
fs.writeFileSync(path.join(tildaDir, 'site-core.html'), siteCore);

function mergeContentScripts(extraFiles) {
  return (
    read('js/content-shared.js') +
    '\n' +
    extraFiles.map(function (f) {
      return read(f);
    }).join('\n') +
    "\nwindow.STUDIO1903_CONTENT = Object.assign({}, window.STUDIO1903_SHARED || {}, window.STUDIO1903_PAGE || {});\n"
  );
}

const tildaFonts = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
`;

function buildTildaBlock(name, bodyHtml, pageScripts, inlineCss) {
  const scripts = mergeContentScripts(pageScripts.content) + read('js/core.js') + pageScripts.runtime;
  const css = inlineCss ? '<style>\n' + cssBundle + '\n</style>\n' : '';
  const fonts = inlineCss
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
`
  : '';
  const core = inlineCss ? imagesRaw + '\n' + scripts : pageScripts.standalone || '';

  return `<!-- STUDIO19.03 — ${name} -->
<!-- Разметка ПЕРВОЙ. При site-head/site-core — только этот блок на странице. -->

<div id="studio1903">
${bodyHtml}
</div>

${fonts}${css}
<script>
${inlineCss ? core : scripts}
</script>
`;
}

function buildTildaStandalone(name, slug, bodyHtml, contentFiles, runtimeJs, extraCssFiles, extraJs) {
  const standaloneCss = cssBundleFor(extraCssFiles);
  const standaloneScripts =
    imagesRaw +
    '\n' +
    read('js/paths.js') +
    '\n' +
    mergeContentScripts(contentFiles) +
    (extraJs || '') +
    runtimeJs +
    read('js/core.js');

  const tildaStyles = `<!-- STUDIO19.03 — ${name}: БЛОК 1 из 2 (стили)
Добавьте T123 на страницу и вставьте этот код ПЕРВЫМ блоком. -->

${tildaFonts}<style>
${standaloneCss}
</style>
`;

  const tildaPage = `<!-- STUDIO19.03 — ${name}: БЛОК 2 из 2 (контент)
Второй T123 под блоком стилей. Отключите Header/Footer Tilda на странице. -->

<div id="studio1903">
${bodyHtml}
</div>

<script>
${standaloneScripts}
</script>
`;

  fs.writeFileSync(path.join(tildaDir, 'tilda-block-' + slug + '-tilda-styles.html'), tildaStyles);
  fs.writeFileSync(path.join(tildaDir, 'tilda-block-' + slug + '-tilda-page.html'), tildaPage);
}

function shellHeader(homeHeader) {
  return homeHeader ? readPartial('shell-header.html').replace('s1903-header--light', 's1903-header') : readPartial('shell-header.html');
}

function shellFooter() {
  return readPartial('shell-footer.html');
}

/* --- HOME (standalone full bundle for backward compat) --- */
const homeStart = read('index.html').indexOf('<div id="studio1903"');
const homeEnd = read('index.html').indexOf('<!-- ==================== END STUDIO19.03 ==================== -->');
const homeOpenEnd = read('index.html').indexOf('>', homeStart) + 1;
const homeBlock = read('index.html').slice(homeOpenEnd, homeEnd).trim();

const homeStandalone = `<!-- STUDIO19.03 — HTML Block для Tilda (главная, автономный) -->
<!-- ВАЖНО: разметка ПЕРВОЙ -->

<div id="studio1903" class="s1903-page s1903-page--home">
${homeBlock}
</div>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=STIX+Two+Text:wght@500&display=swap" rel="stylesheet">
<style>
${cssBundle}
${read('css/pages/home.css')}
</style>
<script>
${imagesRaw}
${projectsJs}
${read('js/paths.js')}
${read('js/content-shared.js')}
${read('js/content-home.js')}
window.STUDIO1903_CONTENT = Object.assign({}, window.STUDIO1903_SHARED || {}, window.STUDIO1903_HOME || {});
${read('js/core.js')}
${read('js/home.js')}
</script>
`;
fs.writeFileSync(path.join(tildaDir, 'tilda-block.html'), homeStandalone);

/* --- PORTFOLIO --- */
const portfolioBody = `${shellHeader(false)}
    <main class="s1903-page--inner s1903-portfolio-page">
      <section class="s1903-portfolio-hero" aria-labelledby="portfolio-title">
        <div class="s1903-portfolio-hero__media">
          <img class="s1903-portfolio-hero__img" data-s1903-img="portfolio.hero" alt="" width="1920" height="1080" fetchpriority="high">
        </div>
        <div class="s1903-portfolio-hero__scrim" aria-hidden="true"></div>
        <div class="s1903-container s1903-portfolio-hero__content">
          <h1 class="s1903-portfolio-hero__title s1903-reveal" id="portfolio-title" data-s1903="portfolio.title"></h1>
          <p class="s1903-portfolio-hero__subtitle s1903-reveal" data-s1903="portfolio.subtitle"></p>
        </div>
      </section>
      <section class="s1903-portfolio-feed" data-s1903="portfolio.feed" aria-label="Проекты"></section>
      <section class="s1903-portfolio-cta s1903-portfolio-cta--visual">
        <div class="s1903-portfolio-cta__media">
          <img class="s1903-portfolio-cta__img" data-s1903-img="portfolio.cta" alt="" width="1920" height="1080" loading="lazy">
        </div>
        <div class="s1903-portfolio-cta__scrim" aria-hidden="true"></div>
        <div class="s1903-portfolio-cta__content s1903-reveal">
          <p class="s1903-portfolio-cta__title" data-s1903="portfolio.ctaTitle"></p>
          <a class="s1903-btn" data-s1903="portfolio.cta" data-s1903-href="form" href="/contacts"></a>
        </div>
      </section>
    </main>
${shellFooter()}`;

fs.writeFileSync(
  path.join(tildaDir, 'tilda-block-portfolio.html'),
  buildTildaBlock('Портфолио', portfolioBody, {
    content: ['js/content-portfolio.js'],
    runtime: read('js/portfolio.js')
  })
);

/* --- PROJECT template --- */
const projectBodyTemplate = `${shellHeader(false)}
    <main class="s1903-project-page">
      <div class="s1903-project-nav-top s1903-container">
        <a class="s1903-ghost" data-s1903="project.back" href="/portfolio"></a>
      </div>
      <section class="s1903-project-hero" aria-labelledby="project-title">
        <div class="s1903-project-hero__media">
          <img class="s1903-project-hero__img" data-s1903-img="project.hero" alt="" width="1920" height="1080" fetchpriority="high">
        </div>
        <div class="s1903-project-hero__overlay" aria-hidden="true"></div>
        <div class="s1903-container s1903-project-hero__content">
          <h1 class="s1903-project-hero__title s1903-reveal" id="project-title" data-s1903="project.title"></h1>
          <p class="s1903-project-hero__meta s1903-reveal" data-s1903="project.meta"></p>
        </div>
      </section>
      <div class="s1903-project-story" data-s1903="project.story" aria-label="Галерея проекта"></div>
      <a class="s1903-project-next-hero" data-s1903="project.nextLink" href="#" aria-label="Следующий проект">
        <img class="s1903-project-next-hero__img" data-s1903-img="project.next" alt="" width="1920" height="1080" loading="lazy">
        <div class="s1903-project-next-hero__overlay" aria-hidden="true"></div>
        <div class="s1903-container s1903-project-next-hero__content s1903-reveal">
          <span class="s1903-project-next-hero__label" data-s1903="project.nextLabel">Следующий проект</span>
          <h2 class="s1903-project-next-hero__title" data-s1903="project.nextTitle"></h2>
          <span class="s1903-project-next-hero__city" data-s1903="project.nextCity"></span>
          <span class="s1903-project-next-hero__arrow" aria-hidden="true">→</span>
        </div>
      </a>
    </main>
${shellFooter()}`;

const projectsOutDir = path.join(tildaDir, 'projects');
fs.mkdirSync(projectsOutDir, { recursive: true });

const miniProjectsCatalog = projects.map(function (p) {
  return {
    slug: p.slug,
    title: p.title,
    city: p.city,
    path: p.path,
    heroImage: p.heroImage,
    cover: p.cover,
    coverLandscape: p.coverLandscape
  };
});

const miniProjectsJs =
  'window.STUDIO1903_PROJECTS = ' + JSON.stringify(miniProjectsCatalog) + ';\n';

const portfolioCatalog = projects.map(function (p) {
  return {
    slug: p.slug,
    title: p.title,
    city: p.city,
    area: p.area,
    type: p.type,
    path: p.path,
    portfolioCover: p.portfolioCover,
    coverPortrait: p.coverPortrait,
    cover: p.cover,
    coverLandscape: p.coverLandscape
  };
});

const portfolioProjectsJs =
  'window.STUDIO1903_PROJECTS = ' + JSON.stringify(portfolioCatalog) + ';\n';

projects.forEach(function (project) {
  const inlineProject =
    'window.STUDIO1903_CURRENT_PROJECT = ' + JSON.stringify(project) + ';\n';
  const block = buildTildaBlock('Проект ' + project.title, projectBodyTemplate, {
    content: ['js/content-project.js'],
    runtime: inlineProject + read('js/project.js')
  });
  fs.writeFileSync(path.join(projectsOutDir, project.slug + '.html'), block);

  /* Автономная страница Tilda без site-head/site-core (2 блока T123 < 100 KB) */
  const standaloneScripts =
    imagesRaw +
    '\n' +
    read('js/paths.js') +
    '\n' +
    mergeContentScripts(['js/content-project.js']) +
    miniProjectsJs +
    inlineProject +
    read('js/core.js') +
    read('js/project.js');

  const tildaStyles = `<!-- STUDIO19.03 — ${project.title}: БЛОК 1 из 2 (стили)
Добавьте T123 на страницу и вставьте этот код ПЕРВЫМ блоком. -->

${tildaFonts}<style>
${cssBundle}
</style>
`;

  const tildaPage = `<!-- STUDIO19.03 — ${project.title}: БЛОК 2 из 2 (контент)
Второй T123 под блоком стилей. Отключите Header/Footer Tilda на странице. -->

<div id="studio1903">
${projectBodyTemplate}
</div>

<script>
${standaloneScripts}
</script>
`;

  fs.writeFileSync(path.join(projectsOutDir, project.slug + '-tilda-styles.html'), tildaStyles);
  fs.writeFileSync(path.join(projectsOutDir, project.slug + '-tilda-page.html'), tildaPage);
});

/* --- STEPS --- */
const stepsBody = `${shellHeader(false)}
    <main class="s1903-page--inner">
      <section class="s1903-page-hero">
        <div class="s1903-container">
          <h1 class="s1903-title s1903-reveal" data-s1903="steps.title"></h1>
          <p class="s1903-subtitle s1903-reveal" data-s1903="steps.subtitle"></p>
        </div>
      </section>
      <section class="s1903-page-section">
        <div class="s1903-container">
          <div class="s1903-steps" data-s1903="steps.list"></div>
          <p class="s1903-steps__note s1903-reveal" data-s1903="steps.note"></p>
        </div>
      </section>
      <section class="s1903-page-cta">
        <div class="s1903-container s1903-reveal">
          <a class="s1903-btn" data-s1903-href="form" href="/contacts" data-s1903="steps.cta"></a>
          <p class="s1903-micro" data-s1903="steps.micro"></p>
        </div>
      </section>
    </main>
${shellFooter()}`;

fs.writeFileSync(
  path.join(tildaDir, 'tilda-block-steps.html'),
  buildTildaBlock('Этапы', stepsBody, { content: ['js/content-steps.js'], runtime: read('js/pages.js') })
);

/* --- PRICE --- */
const priceBody = `${shellHeader(false)}
    <main class="s1903-page--inner">
      <section class="s1903-page-hero">
        <div class="s1903-container">
          <h1 class="s1903-title s1903-reveal" data-s1903="price.title"></h1>
          <p class="s1903-subtitle s1903-reveal" data-s1903="price.subtitle"></p>
          <p class="s1903-price__fact s1903-reveal" data-s1903="price.fact"></p>
        </div>
      </section>
      <section class="s1903-page-section">
        <div class="s1903-container">
          <div class="s1903-price-cards" data-s1903="price.plans"></div>
        </div>
      </section>
      <section class="s1903-page-cta">
        <div class="s1903-container s1903-reveal">
          <a class="s1903-btn" data-s1903-href="form" href="/contacts" data-s1903="price.cta"></a>
          <p class="s1903-micro" data-s1903="price.micro"></p>
        </div>
      </section>
    </main>
${shellFooter()}`;

fs.writeFileSync(
  path.join(tildaDir, 'tilda-block-price.html'),
  buildTildaBlock('Цены', priceBody, { content: ['js/content-price.js'], runtime: read('js/pages.js') })
);

/* --- ABOUT --- */
const aboutBody = `${shellHeader(false)}
    <main class="s1903-page--inner">
      <section class="s1903-page-hero">
        <div class="s1903-container">
          <h1 class="s1903-title s1903-reveal" data-s1903="about.title"></h1>
          <p class="s1903-subtitle s1903-reveal" data-s1903="about.subtitle"></p>
          <div class="s1903-about-story s1903-reveal" data-s1903="about.story"></div>
          <p class="s1903-about-cta s1903-reveal"><a class="s1903-ghost" data-s1903-href="about.cta" href="/portfolio" data-s1903="about.cta"></a></p>
        </div>
      </section>
      <section class="s1903-page-section">
        <div class="s1903-container">
          <div class="s1903-about-founder__grid">
            <div class="s1903-reveal">
              <img class="s1903-about-founder__img" data-s1903-img="founder" alt="" width="800" height="1067" loading="lazy">
            </div>
            <div class="s1903-reveal s1903-founder-block__text">
              <h2 class="s1903-title" data-s1903="founder.title"></h2>
              <p class="s1903-subtitle" data-s1903="founder.subtitle"></p>
              <p class="s1903-subtitle" data-s1903="founder.text"></p>
              <a class="s1903-founder__phone s1903-founder-block__phone" data-s1903="founder.phone" data-s1903-href="header.phone" href="tel:+79662508450"></a>
              <p class="s1903-micro" data-s1903="founder.phoneMicro"></p>
            </div>
          </div>
          <div class="s1903-trust-grid" data-s1903="trust.items"></div>
        </div>
      </section>
    </main>
${shellFooter()}`;

fs.writeFileSync(
  path.join(tildaDir, 'tilda-block-about.html'),
  buildTildaBlock('О нас', aboutBody, { content: ['js/content-about.js'], runtime: read('js/pages.js') })
);

/* --- CONTACTS --- */
const contactsBody = `${shellHeader(false)}
    <main class="s1903-page--inner s1903-contacts-page">
      <section class="s1903-page-hero">
        <div class="s1903-container">
          <h1 class="s1903-title s1903-reveal" data-s1903="contacts.title"></h1>
          <p class="s1903-subtitle s1903-reveal" data-s1903="contacts.subtitle"></p>
        </div>
      </section>
      <section class="s1903-page-section">
        <div class="s1903-container">
          <div class="s1903-contacts-info">
            <div class="s1903-contacts-info__grid">
              <p class="s1903-contacts-info__item">
                <span class="s1903-contacts-info__label">Адрес</span>
                <span class="s1903-contacts-info__value" data-s1903="contacts.address"></span>
              </p>
              <p class="s1903-contacts-info__item">
                <span class="s1903-contacts-info__label">Телефон</span>
                <a class="s1903-contacts-info__value" data-s1903="contacts.phone" data-s1903-href="header.phone" href="tel:+79662508450"></a>
              </p>
              <p class="s1903-contacts-info__item">
                <span class="s1903-contacts-info__label">Email</span>
                <a class="s1903-contacts-info__value" data-s1903="contacts.email" href="mailto:info@studio1903.ru"></a>
              </p>
            </div>
          </div>
          <div class="s1903-advantages" data-s1903="contacts.advantages"></div>
        </div>
      </section>
      ${readPartial('form-block.html')}
    </main>
${shellFooter()}`;

fs.writeFileSync(
  path.join(tildaDir, 'tilda-block-contacts.html'),
  buildTildaBlock('Контакты', contactsBody, { content: ['js/content-contacts.js'], runtime: read('js/pages.js') })
);

/* --- Local HTML pages --- */
function pageHtml(title, desc, bodyMain, contentScript, runtimeScript, extraCss) {
  const cssLinks = [
    '../css/styles.css',
    '../css/art-direction.css',
    '../css/pages.css',
    ...(extraCss || []),
    '../css/tilda-fixes.css'
  ]
    .map(function (h) {
      return '  <link rel="stylesheet" href="' + h + '">';
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
${cssLinks}
</head>
<body>
  <div id="studio1903" class="s1903-page s1903-page--inner">
${bodyMain}
  </div>
  <script src="../js/images.js"></script>
  <script src="../js/projects.js?v=${projectsVersion}"></script>
  <script src="../js/paths.js"></script>
  <script src="../js/content-shared.js"></script>
  <script src="../js/${contentScript}"></script>
  <script src="../js/content.js"></script>
  <script src="../js/core.js"></script>
  <script src="../js/${runtimeScript}"></script>
</body>
</html>`;
}

fs.mkdirSync(pagesDir, { recursive: true });
fs.writeFileSync(
  path.join(pagesDir, 'portfolio.html'),
  pageHtml(
    'Портфолио — Studio19.03',
    'Реализованные интерьеры Studio19.03',
    portfolioBody,
    'content-portfolio.js',
    'portfolio.js',
    ['../css/pages/portfolio.css']
  )
);

fs.writeFileSync(
  path.join(pagesDir, 'project.html'),
  pageHtml(
    'Проект — Studio19.03',
    'Проект Studio19.03',
    projectBodyTemplate,
    'content-project.js',
    'project.js',
    ['../css/pages/project.css']
  )
);

fs.writeFileSync(
  path.join(pagesDir, 'steps.html'),
  pageHtml('Этапы — Studio19.03', 'Этапы работы Studio19.03', stepsBody, 'content-steps.js', 'pages.js', [
    '../css/pages/inner.css'
  ])
);

fs.writeFileSync(
  path.join(pagesDir, 'price.html'),
  pageHtml('Цены — Studio19.03', 'Стоимость услуг Studio19.03', priceBody, 'content-price.js', 'pages.js', [
    '../css/pages/inner.css'
  ])
);

fs.writeFileSync(
  path.join(pagesDir, 'about.html'),
  pageHtml('О нас — Studio19.03', 'О студии Studio19.03', aboutBody, 'content-about.js', 'pages.js', [
    '../css/pages/inner.css'
  ])
);

fs.writeFileSync(
  path.join(pagesDir, 'contacts.html'),
  pageHtml('Контакты — Studio19.03', 'Контакты Studio19.03', contactsBody, 'content-contacts.js', 'pages.js', [
    '../css/pages/inner.css'
  ])
);

/* --- Tilda standalone (2 блока без site-head/site-core) --- */
buildTildaStandalone('Портфолио', 'portfolio', portfolioBody, ['js/content-portfolio.js'], read('js/portfolio.js'), [
  'css/pages/portfolio.css'
], portfolioProjectsJs);
buildTildaStandalone('Этапы', 'steps', stepsBody, ['js/content-steps.js'], read('js/pages.js'), ['css/pages/inner.css']);
buildTildaStandalone('Цены', 'price', priceBody, ['js/content-price.js'], read('js/pages.js'), ['css/pages/inner.css']);
buildTildaStandalone('О нас', 'about', aboutBody, ['js/content-about.js'], read('js/pages.js'), ['css/pages/inner.css']);
buildTildaStandalone('Контакты', 'contacts', contactsBody, ['js/content-contacts.js'], read('js/pages.js'), [
  'css/pages/inner.css'
]);

console.log('Built site-head.html, site-core.html');
console.log('Built tilda-block.html + inner pages');
console.log('Built', projects.length, 'project blocks in tilda/projects/');
console.log('Built standalone Tilda blocks for portfolio, steps, price, about, contacts');
console.log('Built local pages in pages/');

/* --- ONREZA dist (static deploy) --- */
const distDir = path.join(root, 'dist');

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.readdirSync(src, { withFileTypes: true }).forEach(function (entry) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyRecursive(from, to);
    else fs.copyFileSync(from, to);
  });
}

function buildDist() {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  ['css', 'js', 'pages'].forEach(function (dir) {
    copyRecursive(path.join(root, dir), path.join(distDir, dir));
  });
  fs.copyFileSync(path.join(root, 'index.html'), path.join(distDir, 'index.html'));

  const manifestDir = path.join(distDir, '.onreza');
  fs.mkdirSync(manifestDir, { recursive: true });
  fs.writeFileSync(
    path.join(manifestDir, 'manifest.json'),
    JSON.stringify(
      {
        version: 1,
        layers: [{ name: 'site', target: 'STATIC', directory: '.' }],
        routes: [{ pattern: '^/.*$', layer: 'site', priority: 0 }]
      },
      null,
      2
    ) + '\n'
  );
}

function buildOnrezaRules() {
  const menuRoutes = [
    { id: 'portfolio', path: '/portfolio', target: '/pages/portfolio.html' },
    { id: 'steps', path: '/steps', target: '/pages/steps.html' },
    { id: 'price', path: '/price', target: '/pages/price.html' },
    { id: 'about', path: '/about', target: '/pages/about.html' },
    { id: 'contacts', path: '/contacts', target: '/pages/contacts.html' }
  ];

  let rules =
    '# Генерируется scripts/build.js — чистые URL для продакшена\n' +
    'schema = "EDGE_RULE_SET_V1"\n' +
    'source = { origin = "build" }\n\n';

  menuRoutes.forEach(function (route) {
    rules +=
      '[[rule]]\n' +
      'id = "rewrite-' +
      route.id +
      '"\n' +
      'when.path = { exact = "' +
      route.path +
      '" }\n' +
      'action.rewrite = { target = "' +
      route.target +
      '", if_no_file = false }\n\n';
  });

  projects.forEach(function (project) {
    const slug = project.path.replace(/^\//, '');
    rules +=
      '[[rule]]\n' +
      'id = "rewrite-project-' +
      project.slug +
      '"\n' +
      'when.path = { exact = "/' +
      slug +
      '" }\n' +
      'action.rewrite = { target = "/pages/project.html", if_no_file = false }\n\n';
  });

  fs.writeFileSync(path.join(root, 'onreza.rules.toml'), rules);
}

buildDist();
buildOnrezaRules();

const distFiles = [];
(function countFiles(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) countFiles(full);
    else distFiles.push(full);
  });
})(distDir);

console.log('Built dist/ for ONREZA (' + distFiles.length + ' files)');
console.log('Generated onreza.rules.toml');
