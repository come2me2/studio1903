const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const css = [
  fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8'),
  fs.readFileSync(path.join(root, 'css/art-direction.css'), 'utf8'),
  fs.readFileSync(path.join(root, 'css/tilda-fixes.css'), 'utf8')
].join('\n');
const imagesRaw = fs.readFileSync(path.join(root, 'js/images.js'), 'utf8');
const logoUrls = require(path.join(root, 'tilda/logo-urls.js'));

let images = imagesRaw;
if (logoUrls.src) {
  images = images.replace(
    "src: '/assets/logo/logo-white.png'",
    "src: '" + logoUrls.src + "'"
  );
}
if (logoUrls.srcDark) {
  images = images.replace(
    "srcDark: '/assets/logo/logo-gray.png'",
    "srcDark: '" + logoUrls.srcDark + "'"
  );
}

const content = fs.readFileSync(path.join(root, 'js/content.js'), 'utf8');
const main = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const start = html.indexOf('<div id="studio1903">');
const endMarker = '<!-- ==================== END STUDIO19.03 ==================== -->';
const block = html.slice(start, html.indexOf(endMarker) + endMarker.length);

const out = `<!-- STUDIO19.03 — HTML Block для Tilda -->
<!-- ВАЖНО: разметка ПЕРВОЙ. Tilda удаляет HTML между </style> и <script>. -->
<!-- Логотипы: загрузите PNG в Tilda Files → пропишите URL в tilda/logo-urls.js → пересоберите -->

${block}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
${css}
</style>

<script>
${images}
${content}
${main}
</script>
`;

const outPath = path.join(root, 'tilda/tilda-block.html');
const splitCssPath = path.join(root, 'tilda/tilda-block-css-js.html');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out);

/* Запасной вариант, если один блок всё ещё не сохраняется */
const splitOut = `<!-- STUDIO19.03 — часть 2: стили и скрипты. Поставьте блок НИЖЕ блока с разметкой -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
${css}
</style>
<script>
${images}
${content}
${main}
</script>
`;
fs.writeFileSync(splitCssPath, splitOut);

const splitHtmlPath = path.join(root, 'tilda/tilda-block-html-only.html');
fs.writeFileSync(
  splitHtmlPath,
  `<!-- STUDIO19.03 — часть 1: только разметка. Поставьте блок ВЫШЕ блока со стилями -->\n\n${block}\n`
);

console.log('Built', outPath, '(' + (out.length / 1024).toFixed(1) + ' KB)');
console.log('Split fallback:', splitHtmlPath, '+', splitCssPath);
