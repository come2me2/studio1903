/**
 * STUDIO19.03 — страница проекта
 * Рендерер: hero → intro → фотолента → факты → следующий проект
 */
(function () {
  'use strict';

  /* ----------------------------------------------------------------
     Утилиты
  ---------------------------------------------------------------- */

  function getProject() {
    if (window.STUDIO1903_CURRENT_PROJECT) return window.STUDIO1903_CURRENT_PROJECT;
    var projects = window.STUDIO1903_PROJECTS || [];
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug') || '';
    if (!slug) {
      var last = window.location.pathname.replace(/\/$/, '').split('/').filter(Boolean).pop() || '';
      if (last !== 'project.html' && last !== 'project') slug = last;
    }
    return projects.find(function (p) {
      return p.slug === slug || p.path === '/' + slug || p.path === window.location.pathname;
    });
  }

  function revealDelay(el, idx) {
    el.style.transitionDelay = Math.min(idx * 0.06, 0.36) + 's';
  }

  function makeImg(src, alt, w, h, loading) {
    var img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    img.width = w || 1680;
    img.height = h || 2100;
    img.loading = loading || 'lazy';
    img.decoding = 'async';
    img.className = 's1903-feed__img';
    return img;
  }

  /* ----------------------------------------------------------------
     Not found
  ---------------------------------------------------------------- */

  function renderNotFound(root) {
    var main = root.querySelector('main');
    var paths = window.STUDIO1903Paths || {};
    var href = paths.portfolioHref ? paths.portfolioHref() : '/portfolio';
    if (main) {
      main.innerHTML =
        '<div class="s1903-container" style="padding:120px 0">' +
        '<p class="s1903-subtitle">Проект не найден.</p>' +
        '<p style="margin-top:32px"><a class="s1903-ghost" href="' + href + '">← Все проекты</a></p>' +
        '</div>';
    }
  }

  /* ----------------------------------------------------------------
     INTRO — описание проекта под hero
  ---------------------------------------------------------------- */

  function renderIntro(about, container, idx) {
    if (!about || (!about.task && !about.solution)) return;

    var sec = document.createElement('section');
    sec.className = 's1903-proj-intro s1903-reveal';
    revealDelay(sec, idx);

    var num = document.createElement('span');
    num.className = 's1903-proj-intro__num';
    num.textContent = '—';
    num.setAttribute('aria-hidden', 'true');
    sec.appendChild(num);

    if (about.task) {
      var task = document.createElement('p');
      task.className = 's1903-proj-intro__task';
      task.textContent = about.task;
      sec.appendChild(task);
    }

    if (about.solution) {
      var sol = document.createElement('p');
      sol.className = 's1903-proj-intro__solution';
      sol.textContent = about.solution;
      sec.appendChild(sol);
    }

    container.appendChild(sec);
  }

  /* ----------------------------------------------------------------
     EDITORIAL — факты проекта
  ---------------------------------------------------------------- */

  function renderEditorial(project, labels, container, idx) {
    var about = project.about || {};
    var lbl = labels || {};

    var facts = [
      { label: lbl.factArea     || 'Площадь',           value: project.area },
      { label: lbl.factCity     || 'Город',              value: project.city || 'Москва' },
      { label: lbl.factRc       || 'Жилой комплекс',     value: project.rc },
      { label: lbl.factYear     || 'Год',                value: project.year },
      { label: lbl.factStyle    || 'Стиль',              value: project.style },
      { label: lbl.factDuration || 'Срок реализации',    value: project.duration }
    ].filter(function (f) { return f.value; });

    var factsHtml = facts.map(function (f) {
      return (
        '<div class="s1903-proj-editorial__fact">' +
        '<span class="s1903-proj-editorial__fact-label">' + f.label + '</span>' +
        '<span class="s1903-proj-editorial__fact-value">' + f.value + '</span>' +
        '</div>'
      );
    }).join('');

    var sec = document.createElement('section');
    sec.className = 's1903-proj-editorial s1903-reveal';
    revealDelay(sec, idx);

    sec.innerHTML =
      '<div class="s1903-proj-editorial__inner">' +
        '<div class="s1903-proj-editorial__story">' +
          '<h2 class="s1903-proj-editorial__title">' + project.title + '</h2>' +
          (about.result
            ? '<p class="s1903-proj-editorial__result">' + about.result + '</p>'
            : '') +
        '</div>' +
        '<div class="s1903-proj-editorial__facts-col">' +
          '<div class="s1903-proj-editorial__divider"></div>' +
          '<div class="s1903-proj-editorial__facts">' + factsHtml + '</div>' +
        '</div>' +
      '</div>';

    container.appendChild(sec);
  }

  /* ----------------------------------------------------------------
     FEED — журнальная вёрстка
     Ритм задаётся самой историей проекта (large/small/full),
     а не механическим разбиением на пары.
       - large → «глава»: одна крупная фотография
       - small → пара фотографий, компактный ритм
       - full  → полноширинный кадр (кульминация/финал)
       - ландшафтное фото всегда полноширинное, вне зависимости от блока
  ---------------------------------------------------------------- */

  function makeFigure(item, altText, showCaption) {
    var fig = document.createElement('figure');
    fig.className = 's1903-feed__figure';

    var img = makeImg(item.url, item.room || altText, item.w, item.h);
    fig.appendChild(img);

    var captionText = item.caption;
    if (captionText && showCaption) {
      var cap = document.createElement('figcaption');
      cap.className = 's1903-feed__caption';
      cap.textContent = captionText;
      fig.appendChild(cap);
    }

    return fig;
  }

  function makeChapter(photo, altText) {
    var wrap = document.createElement('div');
    wrap.className = 's1903-feed__chapter';
    if (photo.orientation === 'landscape') {
      wrap.classList.add('s1903-feed__chapter--wide');
    }

    wrap.appendChild(makeFigure(photo, altText, false));

    if (photo.caption) {
      var note = document.createElement('p');
      note.className = 's1903-feed__chapter-note';
      note.textContent = photo.caption;
      wrap.appendChild(note);
    }

    return wrap;
  }

  function makePair(photoA, photoB, altText) {
    var wrap = document.createElement('div');
    wrap.className = 's1903-feed__pair';
    wrap.appendChild(makeFigure(photoA, altText, true));
    wrap.appendChild(makeFigure(photoB, altText, true));
    return wrap;
  }

  function makeTrio(items, altText) {
    var wrap = document.createElement('div');
    wrap.className = 's1903-feed__trio';
    items.forEach(function (item) {
      wrap.appendChild(makeFigure(item, altText, true));
    });
    return wrap;
  }

  function makeDuo(items, altText) {
    var wrap = document.createElement('div');
    wrap.className = 's1903-feed__duo';
    items.forEach(function (item) {
      wrap.appendChild(makeFigure(item, altText, true));
    });
    return wrap;
  }

  function makeInterlude(spread) {
    if (!spread || !spread.text) return null;

    var sec = document.createElement('section');
    sec.className = 's1903-feed__interlude';

    if (spread.label) {
      var label = document.createElement('span');
      label.className = 's1903-feed__interlude-label';
      label.textContent = spread.label;
      sec.appendChild(label);
    }

    var text = document.createElement('p');
    text.className = 's1903-feed__interlude-text';
    text.textContent = spread.text;
    sec.appendChild(text);

    return sec;
  }

  function makeWide(photo, altText) {
    var wrap = document.createElement('div');
    wrap.className = 's1903-feed__wide';
    wrap.appendChild(makeFigure(photo, altText, true));
    return wrap;
  }

  function makeQuote(text) {
    if (!text) return null;

    var wrap = document.createElement('blockquote');
    wrap.className = 's1903-feed__quote';

    var mark = document.createElement('span');
    mark.className = 's1903-feed__quote-mark';
    mark.textContent = '\u201C';
    mark.setAttribute('aria-hidden', 'true');
    wrap.appendChild(mark);

    var quoteText = document.createElement('p');
    quoteText.className = 's1903-feed__quote-text';
    quoteText.textContent = text;
    wrap.appendChild(quoteText);

    return wrap;
  }

  function makeMaterials(materials) {
    if (!materials || !materials.length) return null;

    var sec = document.createElement('div');
    sec.className = 's1903-feed__materials';

    var label = document.createElement('span');
    label.className = 's1903-feed__materials-label';
    label.textContent = 'Материалы';
    sec.appendChild(label);

    var row = document.createElement('div');
    row.className = 's1903-feed__materials-row';

    materials.forEach(function (m) {
      var item = document.createElement('figure');
      item.className = 's1903-feed__material';

      var img = makeImg(m.image, m.caption, m.w, m.h);
      img.className = 's1903-feed__img';
      item.appendChild(img);

      if (m.caption) {
        var cap = document.createElement('figcaption');
        cap.className = 's1903-feed__material-caption';
        cap.textContent = m.caption;
        item.appendChild(cap);
      }

      row.appendChild(item);
    });

    sec.appendChild(row);
    return sec;
  }

  function renderMagazineFeed(project, container, startIdx) {
    var spreads = project.magazineSpreads || [];
    var feed = document.createElement('div');
    feed.className = 's1903-feed s1903-feed--magazine';

    var alt = project.title;
    var groupIndex = startIdx;

    function appendGroup(el) {
      if (!el) return;
      el.classList.add('s1903-reveal');
      revealDelay(el, groupIndex);
      groupIndex += 1;
      feed.appendChild(el);
    }

    spreads.forEach(function (spread) {
      var el = null;
      if (spread.type === 'trio' && spread.items && spread.items.length) {
        el = makeTrio(spread.items, alt);
      } else if (spread.type === 'duo' && spread.items && spread.items.length) {
        el = makeDuo(spread.items, alt);
      } else if (spread.type === 'interlude') {
        el = makeInterlude(spread);
      } else if (spread.type === 'quote') {
        el = makeQuote(spread.text);
      } else if (spread.type === 'materials') {
        el = makeMaterials(project.materials);
      } else if (spread.type === 'wide' && spread.items && spread.items.length) {
        el = makeWide(spread.items[0], alt);
      }
      appendGroup(el);
    });

    container.appendChild(feed);
  }

  function renderPhotoFeed(project, container, startIdx) {
    if (project.magazineSpreads && project.magazineSpreads.length) {
      renderMagazineFeed(project, container, startIdx);
      return;
    }

    var sequence = (project.story && project.story.sequence) || [];
    var about = project.about || {};
    var feed = document.createElement('div');
    feed.className = 's1903-feed';

    var alt = project.title;
    var groupIndex = startIdx;
    var largeBlocksSeen = 0;
    var materialsInserted = false;
    var quoteInserted = false;
    var totalLargeBlocks = sequence.filter(function (b) {
      return b.composition === 'large';
    }).length;
    var renderableBlocks = sequence.filter(function (b) {
      return b.items && b.items.length && b.composition;
    }).length;
    var blockIndex = 0;

    function appendGroup(el) {
      el.classList.add('s1903-reveal');
      revealDelay(el, groupIndex);
      groupIndex += 1;
      feed.appendChild(el);
    }

    function maybeInsertQuote() {
      blockIndex += 1;
      if (!quoteInserted && about.result &&
          blockIndex >= Math.ceil(renderableBlocks * 2 / 3)) {
        var quoteEl = makeQuote(about.result);
        if (quoteEl) {
          appendGroup(quoteEl);
          quoteInserted = true;
        }
      }
    }

    sequence.forEach(function (block) {
      if (!block.items || !block.items.length) return;
      var comp = block.composition;
      var items = block.items;

      if (comp === 'large' || comp === 'asymmetric') {
        items.forEach(function (photo) {
          appendGroup(makeChapter(photo, alt));
        });
        largeBlocksSeen += 1;

        // Вставляем материалы примерно на середине истории — один раз
        if (!materialsInserted && totalLargeBlocks > 1 &&
            largeBlocksSeen === Math.ceil(totalLargeBlocks / 2)) {
          var materialsEl = makeMaterials(project.materials);
          if (materialsEl) {
            appendGroup(materialsEl);
            materialsInserted = true;
          }
        }

        maybeInsertQuote();
      } else if (comp === 'small' || comp === 'quad') {
        for (var i = 0; i < items.length; i += 2) {
          if (items[i + 1]) {
            appendGroup(makePair(items[i], items[i + 1], alt));
          } else {
            chapterNum += 1;
            appendGroup(makeChapter(items[i], alt, chapterNum));
          }
        }
        maybeInsertQuote();
      } else if (comp === 'full') {
        items.forEach(function (photo) {
          appendGroup(makeWide(photo, alt));
        });
        maybeInsertQuote();
      } else {
        items.forEach(function (photo) {
          if (photo.orientation === 'landscape') {
            appendGroup(makeWide(photo, alt));
          } else {
            chapterNum += 1;
            appendGroup(makeChapter(photo, alt, chapterNum));
          }
        });
        maybeInsertQuote();
      }
    });

    // Материалы не были вставлены (мало «глав») — добавляем перед финалом
    if (!materialsInserted) {
      var fallbackMaterials = makeMaterials(project.materials);
      if (fallbackMaterials) appendGroup(fallbackMaterials);
    }

    // Цитата не вставилась — добавляем перед финалом
    if (!quoteInserted && about.result) {
      var fallbackQuote = makeQuote(about.result);
      if (fallbackQuote) appendGroup(fallbackQuote);
    }

    container.appendChild(feed);
  }

  /* ----------------------------------------------------------------
     HERO
  ---------------------------------------------------------------- */

  function populateHero(project, root) {
    var heroImg = root.querySelector('[data-s1903-img="project.hero"]');
    if (heroImg) {
      heroImg.src = project.heroImage || project.cover;
      heroImg.alt = project.title;
    }
  }

  /* ----------------------------------------------------------------
     NEXT PROJECT
  ---------------------------------------------------------------- */

  function populateNext(project, root, paths, labels) {
    var projects = window.STUDIO1903_PROJECTS || [];
    var idx = projects.findIndex(function (p) { return p.slug === project.slug; });
    var next = projects[(idx + 1) % projects.length];
    if (!next) return;

    var nextLink = root.querySelector('[data-s1903="project.nextLink"]');
    var nextImg  = root.querySelector('[data-s1903-img="project.next"]');
    var href = paths.projectHref ? paths.projectHref(next) : next.path;

    if (nextLink) {
      nextLink.href = href;
      nextLink.setAttribute('aria-label', 'Следующий проект: ' + next.title);
    }
    if (nextImg) {
      nextImg.src = next.heroImage || next.coverLandscape || next.cover;
      nextImg.alt = next.title;
    }

    var setText = function (sel, val) {
      var el = root.querySelector(sel);
      if (el) el.textContent = val;
    };
    setText('[data-s1903="project.nextTitle"]', next.title);
    setText('[data-s1903="project.nextCity"]',  next.city || 'Москва');
    setText('[data-s1903="project.nextLabel"]',  (labels && labels.nextLabel) || 'Следующий проект');
  }

  /* ----------------------------------------------------------------
     BOOT
  ---------------------------------------------------------------- */

  function renderProject(api, root) {
    var project = getProject();
    if (!project) { renderNotFound(root); return; }

    var paths  = window.STUDIO1903Paths || {};
    var labels = (api.CONTENT && api.CONTENT.project) || {};
    var sequence = (project.story && project.story.sequence) || [];
    var about  = project.about || {};

    document.title = project.title + ' — Studio19.03';

    var main = root.querySelector('.s1903-project-page') || root.querySelector('main');
    if (main && project.story && project.story.publicationVersion) {
      main.setAttribute('data-publication-version', String(project.story.publicationVersion));
    }

    /* Hero */
    populateHero(project, root);

    var setText = function (sel, val) {
      var el = root.querySelector(sel);
      if (el) el.textContent = val;
    };
    setText('[data-s1903="project.title"]', project.title);
    setText('[data-s1903="project.meta"]',
      [project.city || 'Москва', project.rc, project.type, project.area].filter(Boolean).join(' · '));

    /* Back link */
    var backLink = root.querySelector('[data-s1903="project.back"]');
    if (backLink) {
      backLink.href = paths.portfolioHref ? paths.portfolioHref() : '/portfolio';
      backLink.textContent = (labels && labels.backLabel) || '← Все проекты';
    }

    /* Story area */
    var storyRoot = root.querySelector('[data-s1903="project.story"]');
    if (storyRoot) {
      storyRoot.innerHTML = '';

      var blockIdx = 0;

      /* 1. Intro: описание проекта */
      renderIntro(about, storyRoot, blockIdx++);

      /* 2. Фотолента: главы, пары, материалы, финал */
      var hasPhotos = (project.magazineSpreads && project.magazineSpreads.length) ||
        sequence.some(function (b) { return b.items && b.items.length; });
      if (hasPhotos) {
        renderPhotoFeed(project, storyRoot, blockIdx);
        blockIdx += 20; // резерв индексов для delay внутри ленты
      }

      /* 3. Editorial: факты */
      if (sequence.some(function (b) { return b.type === 'editorial'; })) {
        renderEditorial(project, labels, storyRoot, blockIdx++);
      }
    }

    /* Next project */
    populateNext(project, root, paths, labels);

    /* Reveal animations */
    api.observeReveal(root.querySelectorAll('.s1903-reveal'));
  }

  window.STUDIO1903Core.boot(function (api, root) {
    renderProject(api, root);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(function () { root.classList.add('s1903--loaded'); });
    }
  });

})();
