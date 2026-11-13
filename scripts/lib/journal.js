/**
 * STUDIO19.03 — журнал.
 * Статьи: content/journal/<slug>.md. Сборка: scripts/build.js.
 * Без зависимостей: свой разбор markdown-подмножества.
 */
const fs = require('fs');
const path = require('path');

const SITE_ORIGIN = 'https://studio1903.ru';
const PER_PAGE = 12;
const RESERVED_SLUGS = { page: true };
const SLUG_FILE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;
const KNOWN_KEYS = {
  slug: true,
  title: true,
  description: true,
  h1: true,
  excerpt: true,
  date: true,
  updated: true,
  cover: true,
  coverAlt: true,
  draft: true
};

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря'
];

const LIST_COPY = {
  h1: 'Журнал',
  subtitle: 'О пространстве, материалах и ходе проекта — коротко и по делу.',
  empty: 'Пока в журнале нет статей.',
  description:
    'Журнал Studio19.03: заметки о пространстве, материалах и о том, как проект доходит до реализации.'
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function jsonScript(data) {
  return (
    '<script type="application/ld+json">' +
    JSON.stringify(data).replace(/</g, '\\u003c') +
    '</script>'
  );
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parts = value.split('-').map(function (n) {
    return Number(n);
  });
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return (
    dt.getUTCFullYear() === parts[0] &&
    dt.getUTCMonth() === parts[1] - 1 &&
    dt.getUTCDate() === parts[2]
  );
}

function formatDate(iso) {
  const parts = iso.split('-').map(function (n) {
    return Number(n);
  });
  return parts[2] + ' ' + MONTHS[parts[1] - 1] + ' ' + parts[0];
}

function sanitizeUrl(url, fileLabel) {
  const value = String(url || '').trim();
  if (value.startsWith('/') && !value.startsWith('//') && value.indexOf('..') === -1 && value.indexOf('\\') === -1) {
    return value;
  }
  if (/^https?:\/\//i.test(value)) return value;
  if (/^(mailto:|tel:)/i.test(value)) return value;
  throw new Error(fileLabel + ': недопустимая ссылка «' + value + '»');
}

function sanitizeAssetUrl(url, fileLabel) {
  const value = sanitizeUrl(url, fileLabel);
  if (/^(mailto:|tel:)/i.test(value)) {
    throw new Error(fileLabel + ': картинка должна быть путём от корня сайта или https-адресом');
  }
  return value;
}

function assertLocalAsset(root, url, fileLabel) {
  if (!root || /^https?:\/\//i.test(url) || /^(mailto:|tel:)/i.test(url)) return;
  const rel = url.replace(/^\/+/, '');
  const abs = path.resolve(root, rel);
  const imagesRoot = path.resolve(root);
  if (abs !== imagesRoot && abs.indexOf(imagesRoot + path.sep) !== 0) {
    throw new Error(fileLabel + ': путь выходит за пределы сайта: ' + url);
  }
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    throw new Error(fileLabel + ': файл не найден: ' + url);
  }
}

function plainInline(text) {
  return String(text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function renderInline(text, fileLabel, depth) {
  const source = String(text);
  const level = depth || 0;
  const re =
    level > 0
      ? /\*\*([^*]+)\*\*|\*([^*]+)\*/g
      : /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let out = '';
  let last = 0;
  let match;
  while ((match = re.exec(source))) {
    out += escapeHtml(source.slice(last, match.index));
    if (level === 0 && match[1] != null && match[2] != null) {
      const href = sanitizeUrl(match[2], fileLabel);
      out += '<a href="' + escapeAttr(href) + '">' + renderInline(match[1], fileLabel, level + 1) + '</a>';
    } else {
      const bold = level === 0 ? match[3] : match[1];
      const italic = level === 0 ? match[4] : match[2];
      if (bold != null) out += '<strong>' + escapeHtml(bold) + '</strong>';
      else out += '<em>' + escapeHtml(italic) + '</em>';
    }
    last = match.index + match[0].length;
  }
  out += escapeHtml(source.slice(last));
  return out;
}

function isBlockStart(line) {
  const value = line.trim();
  return (
    value.startsWith('## ') ||
    value.startsWith('### ') ||
    value === ':::faq' ||
    /^!\[([^\]]*)\]\(/.test(value) ||
    value.startsWith('- ')
  );
}

function renderFigure(caption, src, alt, fileLabel) {
  const url = sanitizeAssetUrl(src, fileLabel);
  const altText = alt || caption || '';
  let html = '<figure class="s1903-journal-figure"><img src="' + escapeAttr(url) + '" alt="' + escapeAttr(altText) + '" loading="lazy">';
  if (caption) html += '<figcaption>' + escapeHtml(caption) + '</figcaption>';
  html += '</figure>';
  return { html: html, src: url };
}

function renderFaq(lines, fileLabel, faqItems, index) {
  const text = lines.join('\n').trim();
  const chunks = text
    ? text.split(/\n\s*\n/).map(function (chunk) {
        return chunk.trim();
      }).filter(Boolean)
    : [];
  if (!chunks.length || chunks.length % 2 !== 0) {
    throw new Error(fileLabel + ': в :::faq чередуйте вопрос и ответ через пустую строку');
  }
  const headingId = 's1903-journal-faq-' + index;
  let html =
    '<section class="s1903-journal-faq" aria-labelledby="' +
    headingId +
    '"><h2 id="' +
    headingId +
    '">Вопросы и ответы</h2>';
  for (let i = 0; i < chunks.length; i += 2) {
    const question = chunks[i].replace(/\s+/g, ' ').trim();
    const answerLines = chunks[i + 1]
      .split('\n')
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean);
    if (!question || !answerLines.length) {
      throw new Error(fileLabel + ': в FAQ пустой вопрос или ответ');
    }
    faqItems.push({
      q: plainInline(question),
      a: answerLines.map(plainInline).join(' ')
    });
    html += '<div class="s1903-journal-faq__item"><h3>' + renderInline(question, fileLabel) + '</h3>';
    answerLines.forEach(function (line) {
      html += '<p>' + renderInline(line, fileLabel) + '</p>';
    });
    html += '</div>';
  }
  html += '</section>';
  return html;
}

function renderMarkdown(md, fileLabel) {
  const lines = String(md || '').replace(/\r\n/g, '\n').split('\n');
  const html = [];
  const images = [];
  const faq = [];
  let faqCount = 0;
  let i = 0;

  while (i < lines.length) {
    if (!lines[i].trim()) {
      i += 1;
      continue;
    }

    const trimmed = lines[i].trim();

    if (trimmed === ':::faq') {
      i += 1;
      const faqLines = [];
      while (i < lines.length && lines[i].trim() !== ':::') {
        faqLines.push(lines[i]);
        i += 1;
      }
      if (i >= lines.length) throw new Error(fileLabel + ': не закрыт блок :::faq');
      i += 1;
      faqCount += 1;
      html.push(renderFaq(faqLines, fileLabel, faq, faqCount));
      continue;
    }

    if (trimmed.startsWith('### ')) {
      html.push('<h3>' + renderInline(trimmed.slice(4).trim(), fileLabel) + '</h3>');
      i += 1;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      html.push('<h2>' + renderInline(trimmed.slice(3).trim(), fileLabel) + '</h2>');
      i += 1;
      continue;
    }

    const image = trimmed.match(/^!\[([^\]]*)\]\(\s*(\S+?)(?:\s+"([^"]*)")?\s*\)$/);
    if (image) {
      const figure = renderFigure(image[1], image[2], image[3], fileLabel);
      images.push(figure.src);
      html.push(figure.html);
      i += 1;
      continue;
    }

    if (trimmed.startsWith('- ')) {
      const items = [];
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push('<li>' + renderInline(lines[i].trim().slice(2).trim(), fileLabel) + '</li>');
        i += 1;
      }
      html.push('<ul>' + items.join('') + '</ul>');
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      para.push(lines[i].trim());
      i += 1;
    }
    html.push('<p>' + renderInline(para.join(' '), fileLabel) + '</p>');
  }

  return { html: html.join('\n'), images: images, faq: faq };
}

function splitFrontmatter(source, fileLabel) {
  const text = String(source || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) {
    throw new Error(fileLabel + ': в начале файла нужен блок --- … ---');
  }
  let end = text.indexOf('\n---\n', 3);
  let bodyStart;
  if (end !== -1) {
    bodyStart = end + 5;
  } else if (text.endsWith('\n---')) {
    end = text.length - 3;
    bodyStart = text.length;
  } else {
    throw new Error(fileLabel + ': закройте шапку строкой ---');
  }
  return {
    frontmatter: text.slice(4, end),
    body: text.slice(bodyStart).replace(/^\n/, '')
  };
}

function parseFrontmatter(fmText, fileLabel) {
  const data = {};
  fmText.split('\n').forEach(function (line) {
    if (!line.trim() || line.trim().charAt(0) === '#') return;
    const match = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!match) throw new Error(fileLabel + ': непонятная строка шапки: ' + line);
    const key = match[1];
    if (!KNOWN_KEYS[key]) throw new Error(fileLabel + ': неизвестное поле «' + key + '»');
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      throw new Error(fileLabel + ': поле «' + key + '» указано дважды');
    }
    let value = match[2].trim();
    if (
      (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ||
      (value.charAt(0) === "'" && value.charAt(value.length - 1) === "'")
    ) {
      value = value.slice(1, -1);
    }
    if (key === 'draft') {
      if (value !== 'true' && value !== 'false') {
        throw new Error(fileLabel + ': draft — только true или false');
      }
      data.draft = value === 'true';
      return;
    }
    data[key] = value;
  });
  return data;
}

function requireText(data, key, fileLabel, max) {
  const value = data[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(fileLabel + ': заполните поле ' + key);
  }
  if (max && value.trim().length > max) {
    throw new Error(fileLabel + ': поле ' + key + ' длиннее ' + max + ' символов');
  }
  return value.trim();
}

function parseArticle(slug, source, options) {
  const opts = options || {};
  const fileLabel = opts.file || slug + '.md';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(fileLabel + ': slug — латиница в нижнем регистре, цифры и дефис');
  }
  if (RESERVED_SLUGS[slug]) throw new Error(fileLabel + ': slug «' + slug + '» зарезервирован');

  const parts = splitFrontmatter(source, fileLabel);
  const data = parseFrontmatter(parts.frontmatter, fileLabel);
  if (data.slug && data.slug !== slug) {
    throw new Error(fileLabel + ': slug в шапке не совпадает с именем файла');
  }

  const article = {
    slug: slug,
    title: requireText(data, 'title', fileLabel, 180),
    description: requireText(data, 'description', fileLabel, 320),
    h1: requireText(data, 'h1', fileLabel, 200),
    excerpt: requireText(data, 'excerpt', fileLabel, 400),
    date: requireText(data, 'date', fileLabel),
    updated: data.updated ? String(data.updated).trim() : '',
    cover: requireText(data, 'cover', fileLabel),
    coverAlt: requireText(data, 'coverAlt', fileLabel, 300),
    draft: data.draft === true
  };

  if (!isValidDate(article.date)) {
    throw new Error(fileLabel + ': date в формате ГГГГ-ММ-ДД');
  }
  if (article.updated) {
    if (!isValidDate(article.updated)) throw new Error(fileLabel + ': updated в формате ГГГГ-ММ-ДД');
    if (article.updated < article.date) throw new Error(fileLabel + ': updated раньше date');
  }

  article.cover = sanitizeAssetUrl(article.cover, fileLabel);
  const rendered = renderMarkdown(parts.body, fileLabel);
  article.html = rendered.html;
  article.faq = rendered.faq;
  article.images = [article.cover].concat(rendered.images);

  if (opts.root && opts.checkAssets !== false) {
    article.images.forEach(function (url) {
      assertLocalAsset(opts.root, url, fileLabel);
    });
  }

  return article;
}

function loadArticles(root) {
  const dir = path.join(root, 'content', 'journal');
  if (!fs.existsSync(dir)) return [];
  const articles = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
    if (!entry.isFile()) return;
    const name = entry.name;
    if (name.charAt(0) === '.' || name.charAt(0) === '_') return;
    if (/^readme\.md$/i.test(name)) return;
    if (!SLUG_FILE.test(name)) {
      throw new Error(
        'content/journal/' + name + ': имя файла — slug латиницей в нижнем регистре (например, svet-v-gostinoi.md)'
      );
    }
    const slug = name.replace(/\.md$/, '');
    const source = fs.readFileSync(path.join(dir, name), 'utf8');
    const article = parseArticle(slug, source, { root: root, file: 'content/journal/' + name });
    if (!article.draft) articles.push(article);
  });
  articles.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
  return articles;
}

function totalPagesFor(count) {
  if (!count) return 1;
  return Math.ceil(count / PER_PAGE);
}

function pageArticles(articles, page) {
  const start = (page - 1) * PER_PAGE;
  return articles.slice(start, start + PER_PAGE);
}

function listPath(page) {
  return page <= 1 ? '/journal' : '/journal/page/' + page;
}

function articlePath(slug) {
  return '/journal/' + slug;
}

function absoluteUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;
  return SITE_ORIGIN + (url.charAt(0) === '/' ? url : '/' + url);
}

function cssLinks() {
  return [
    '/css/styles.css',
    '/css/art-direction.css',
    '/css/pages.css',
    '/css/pages/journal.css',
    '/css/typography.css',
    '/css/tilda-fixes.css'
  ]
    .map(function (href) {
      return '  <link rel="stylesheet" href="' + href + '">';
    })
    .join('\n');
}

function documentHtml(options) {
  const canonical = SITE_ORIGIN + options.canonicalPath;
  const head = [
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '  <title>' + escapeHtml(options.title) + '</title>',
    '  <meta name="description" content="' + escapeAttr(options.description) + '">',
    '  <link rel="canonical" href="' + escapeAttr(canonical) + '">'
  ];
  if (options.robots) head.push('  <meta name="robots" content="' + escapeAttr(options.robots) + '">');
  if (options.prev) head.push('  <link rel="prev" href="' + escapeAttr(absoluteUrl(options.prev)) + '">');
  if (options.next) head.push('  <link rel="next" href="' + escapeAttr(absoluteUrl(options.next)) + '">');
  head.push('  <meta property="og:locale" content="ru_RU">');
  head.push('  <meta property="og:site_name" content="Studio19.03">');
  head.push('  <meta property="og:type" content="' + escapeAttr(options.ogType || 'website') + '">');
  head.push('  <meta property="og:title" content="' + escapeAttr(options.ogTitle || options.title) + '">');
  head.push('  <meta property="og:description" content="' + escapeAttr(options.description) + '">');
  head.push('  <meta property="og:url" content="' + escapeAttr(canonical) + '">');
  if (options.image) {
    head.push('  <meta property="og:image" content="' + escapeAttr(absoluteUrl(options.image)) + '">');
    if (options.imageAlt) {
      head.push('  <meta property="og:image:alt" content="' + escapeAttr(options.imageAlt) + '">');
    }
  }
  if (options.published) {
    head.push('  <meta property="article:published_time" content="' + escapeAttr(options.published) + '">');
  }
  if (options.modified) {
    head.push('  <meta property="article:modified_time" content="' + escapeAttr(options.modified) + '">');
  }
  if (options.jsonLd) head.push('  ' + jsonScript(options.jsonLd));
  head.push('  <link rel="preconnect" href="https://fonts.googleapis.com">');
  head.push('  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
  head.push(
    '  <link href="https://fonts.googleapis.com/css2?family=STIX+Two+Text:wght@500&display=swap" rel="stylesheet">'
  );

  return (
    '<!DOCTYPE html>\n<html lang="ru">\n<head>\n' +
    head.join('\n') +
    '\n' +
    cssLinks() +
    '\n</head>\n<body>\n  <div id="studio1903" class="s1903-page s1903-page--inner s1903-page--journal">\n' +
    options.header +
    '\n' +
    options.main +
    '\n' +
    options.footer +
    '\n  </div>\n' +
    '  <script src="/js/images.js"></script>\n' +
    '  <script src="/js/paths.js"></script>\n' +
    '  <script src="/js/content-shared.js"></script>\n' +
    '  <script src="/js/content.js"></script>\n' +
    '  <script src="/js/core.js"></script>\n' +
    '  <script src="/js/journal.js"></script>\n' +
    '</body>\n</html>\n'
  );
}

function renderCard(article, eager) {
  const imgAttr = eager
    ? ' fetchpriority="high"'
    : ' loading="lazy"';
  return (
    '        <article class="s1903-journal-card s1903-reveal">\n' +
    '          <a class="s1903-journal-card__link" href="' +
    escapeAttr(articlePath(article.slug)) +
    '">\n' +
    '            <img class="s1903-journal-card__img" src="' +
    escapeAttr(article.cover) +
    '" alt="' +
    escapeAttr(article.coverAlt) +
    '"' +
    imgAttr +
    '>\n' +
    '            <div class="s1903-journal-card__body">\n' +
    '              <p class="s1903-journal-card__date"><time datetime="' +
    escapeAttr(article.date) +
    '">' +
    escapeHtml(formatDate(article.date)) +
    '</time></p>\n' +
    '              <h2 class="s1903-journal-card__title">' +
    escapeHtml(article.h1) +
    '</h2>\n' +
    '              <p class="s1903-journal-card__excerpt">' +
    escapeHtml(article.excerpt) +
    '</p>\n' +
    '            </div>\n' +
    '          </a>\n' +
    '        </article>'
  );
}

function renderPager(page, totalPages) {
  if (totalPages < 2) return '';
  let html = '        <nav class="s1903-journal-pager" aria-label="Страницы журнала">\n';
  if (page > 1) {
    html +=
      '          <a class="s1903-journal-pager__prev" href="' +
      escapeAttr(listPath(page - 1)) +
      '" rel="prev">Назад</a>\n';
  }
  html += '          <ol class="s1903-journal-pager__pages">\n';
  for (let n = 1; n <= totalPages; n += 1) {
    const current = n === page ? ' aria-current="page"' : '';
    html +=
      '            <li><a href="' +
      escapeAttr(listPath(n)) +
      '"' +
      current +
      '>' +
      n +
      '</a></li>\n';
  }
  html += '          </ol>\n';
  if (page < totalPages) {
    html +=
      '          <a class="s1903-journal-pager__next" href="' +
      escapeAttr(listPath(page + 1)) +
      '" rel="next">Дальше</a>\n';
  }
  html += '        </nav>\n';
  return html;
}

function renderListPage(options) {
  const articles = options.articles || [];
  const page = options.page;
  const totalPages = options.totalPages;
  const slice = pageArticles(articles, page);
  const title =
    page > 1 ? 'Журнал — страница ' + page + ' — Studio19.03' : 'Журнал — Studio19.03';
  const description =
    page > 1 ? LIST_COPY.description + ' Страница ' + page + '.' : LIST_COPY.description;
  let listHtml;
  if (!articles.length) {
    listHtml =
      '        <p class="s1903-journal-empty s1903-reveal">' + escapeHtml(LIST_COPY.empty) + '</p>\n';
  } else {
    listHtml =
      '        <div class="s1903-journal-list">\n' +
      slice
        .map(function (article, index) {
          return renderCard(article, page === 1 && index === 0);
        })
        .join('\n') +
      '\n        </div>\n' +
      renderPager(page, totalPages);
  }

  const pageNote =
    page > 1
      ? '\n          <p class="s1903-journal-page-note s1903-reveal">Страница ' + page + '</p>'
      : '';

  const main =
    '    <main class="s1903-page--inner s1903-journal-page">\n' +
    '      <section class="s1903-page-hero" aria-labelledby="journal-title">\n' +
    '        <div class="s1903-container">\n' +
    '          <h1 class="s1903-title s1903-reveal" id="journal-title">' +
    escapeHtml(LIST_COPY.h1) +
    '</h1>\n' +
    '          <p class="s1903-subtitle s1903-reveal">' +
    escapeHtml(LIST_COPY.subtitle) +
    '</p>' +
    pageNote +
    '\n' +
    '        </div>\n' +
    '      </section>\n' +
    '      <section class="s1903-page-section" aria-label="Статьи">\n' +
    '        <div class="s1903-container">\n' +
    listHtml +
    '        </div>\n' +
    '      </section>\n' +
    '    </main>';

  const first = slice[0];
  return documentHtml({
    title: title,
    description: description,
    canonicalPath: listPath(page),
    robots: articles.length ? '' : 'noindex',
    prev: page > 1 ? listPath(page - 1) : '',
    next: page < totalPages && articles.length ? listPath(page + 1) : '',
    ogType: 'website',
    image: first ? first.cover : '',
    imageAlt: first ? first.coverAlt : '',
    header: options.header,
    footer: options.footer,
    main: main
  });
}

function articleJsonLd(article) {
  const url = absoluteUrl(articlePath(article.slug));
  const graph = [
    {
      '@type': 'Article',
      headline: article.h1,
      description: article.description,
      image: [absoluteUrl(article.cover)],
      datePublished: article.date,
      dateModified: article.updated || article.date,
      inLanguage: 'ru-RU',
      mainEntityOfPage: url,
      author: {
        '@type': 'Organization',
        name: 'Studio19.03',
        url: SITE_ORIGIN + '/'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Studio19.03',
        url: SITE_ORIGIN + '/'
      }
    }
  ];
  if (article.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: article.faq.map(function (item) {
        return {
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a
          }
        };
      })
    });
  }
  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

function renderArticlePage(options) {
  const article = options.article;
  const main =
    '    <main class="s1903-page--inner s1903-journal-article">\n' +
    '      <article>\n' +
    '        <header class="s1903-page-hero">\n' +
    '          <div class="s1903-container">\n' +
    '            <p class="s1903-journal-kicker s1903-reveal"><a href="/journal">Журнал</a></p>\n' +
    '            <h1 class="s1903-title s1903-reveal">' +
    escapeHtml(article.h1) +
    '</h1>\n' +
    '            <p class="s1903-journal-date s1903-reveal"><time datetime="' +
    escapeAttr(article.date) +
    '">' +
    escapeHtml(formatDate(article.date)) +
    '</time></p>\n' +
    '          </div>\n' +
    '        </header>\n' +
    '        <div class="s1903-journal-body">\n' +
    '          <div class="s1903-container">\n' +
    '            <figure class="s1903-journal-cover">\n' +
    '              <img src="' +
    escapeAttr(article.cover) +
    '" alt="' +
    escapeAttr(article.coverAlt) +
    '" fetchpriority="high">\n' +
    '            </figure>\n' +
    '            <div class="s1903-journal-prose">\n' +
    article.html +
    '\n            </div>\n' +
    '          </div>\n' +
    '        </div>\n' +
    '      </article>\n' +
    '    </main>';

  return documentHtml({
    title: article.title,
    description: article.description,
    canonicalPath: articlePath(article.slug),
    ogType: 'article',
    ogTitle: article.title,
    image: article.cover,
    imageAlt: article.coverAlt,
    published: article.date,
    modified: article.updated || article.date,
    jsonLd: articleJsonLd(article),
    header: options.header,
    footer: options.footer,
    main: main
  });
}

function journalRoutes(articles) {
  const routes = [
    { id: 'journal', path: '/journal', target: '/pages/journal.html' }
  ];
  const pages = totalPagesFor(articles.length);
  for (let page = 2; page <= pages; page += 1) {
    routes.push({
      id: 'journal-page-' + page,
      path: '/journal/page/' + page,
      target: '/pages/journal/page/' + page + '.html'
    });
  }
  articles.forEach(function (article) {
    routes.push({
      id: 'journal-' + article.slug,
      path: '/journal/' + article.slug,
      target: '/pages/journal/' + article.slug + '.html'
    });
  });
  return routes;
}

module.exports = {
  SITE_ORIGIN: SITE_ORIGIN,
  PER_PAGE: PER_PAGE,
  LIST_COPY: LIST_COPY,
  loadArticles: loadArticles,
  parseArticle: parseArticle,
  totalPagesFor: totalPagesFor,
  pageArticles: pageArticles,
  listPath: listPath,
  articlePath: articlePath,
  renderListPage: renderListPage,
  renderArticlePage: renderArticlePage,
  journalRoutes: journalRoutes,
  formatDate: formatDate
};
