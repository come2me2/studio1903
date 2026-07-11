/**
 * STUDIO19.03 — портфолио: журнальная сетка (3 → 2 → 3 …)
 */
(function () {
  'use strict';

  function portraitCover(project) {
    return project.portfolioCover || project.coverPortrait || project.cover || project.coverLandscape;
  }

  function projectMeta(project) {
    return [project.city || 'Москва', project.rc, project.area, project.type].filter(Boolean).join(' · ');
  }

  function renderPortfolioHero(api, root, c) {
    api.setText('[data-s1903="portfolio.title"]', c.title);
    api.setText('[data-s1903="portfolio.subtitle"]', c.subtitle);

    var heroImg = root.querySelector('[data-s1903-img="portfolio.hero"]');
    var imgData = api.IMAGES.portfolioHero || api.IMAGES.hero;
    if (heroImg && imgData) {
      heroImg.src = imgData.src;
      heroImg.alt = imgData.alt || c.title;
      if (imgData.position) heroImg.style.objectPosition = imgData.position;
    }
  }

  function renderPortfolioCta(api, root, c) {
    api.setText('[data-s1903="portfolio.ctaTitle"]', c.ctaTitle);
    api.setText('[data-s1903="portfolio.cta"]', c.cta);

    var ctaImg = root.querySelector('[data-s1903-img="portfolio.cta"]');
    var imgData = api.IMAGES.portfolioCta || api.IMAGES.portfolioHero || api.IMAGES.hero;
    if (ctaImg && imgData) {
      ctaImg.src = imgData.src;
      ctaImg.alt = imgData.alt || '';
      if (imgData.position) ctaImg.style.objectPosition = imgData.position;
    }
  }

  function createCard(project, image, href, c, index) {
    var label = project.title + '. ' + projectMeta(project);
    var article = document.createElement('article');
    article.className = 's1903-portfolio-item';

    article.innerHTML =
      '<a class="s1903-portfolio-item__link" href="' +
      href +
      '" aria-label="' +
      label +
      '">' +
      '<div class="s1903-portfolio-item__media s1903-portfolio-item__media--portrait">' +
      '<img class="s1903-portfolio-item__img" src="' +
      image +
      '" alt="" loading="lazy" decoding="async" width="800" height="1000">' +
      '<div class="s1903-portfolio-item__overlay">' +
      '<div class="s1903-portfolio-item__overlay-inner">' +
      '<h2 class="s1903-portfolio-item__title">' +
      project.title +
      '</h2>' +
      '<p class="s1903-portfolio-item__meta">' +
      projectMeta(project) +
      '</p>' +
      '<span class="s1903-portfolio-item__more">' +
      (c.more || 'Смотреть проект') +
      '</span>' +
      '</div></div></div></a>';

    article.style.transitionDelay = Math.min(index * 0.04, 0.48) + 's';
    return article;
  }

  function renderFeed(api, root, c) {
    var projects = window.STUDIO1903_PROJECTS || [];
    var paths = window.STUDIO1903Paths || {};
    var feed = root.querySelector('[data-s1903="portfolio.feed"]');
    if (!feed) return;

    feed.innerHTML = '';
    feed.className = 's1903-portfolio-feed s1903-portfolio-feed--magazine s1903-container';

    var index = 0;
    var useTrio = true;

    while (index < projects.length) {
      var count = useTrio ? 3 : 2;
      var chunk = projects.slice(index, index + count);
      if (!chunk.length) break;

      var row = document.createElement('div');
      row.className = useTrio
        ? 's1903-portfolio-feed__trio s1903-reveal'
        : 's1903-portfolio-feed__duo s1903-reveal';
      row.style.transitionDelay = Math.min((index / 3) * 0.06, 0.36) + 's';

      chunk.forEach(function (project, chunkIdx) {
        var href = paths.projectHref ? paths.projectHref(project) : project.path;
        var image = portraitCover(project);
        if (!image) return;
        row.appendChild(createCard(project, image, href, c, index + chunkIdx));
      });

      if (row.children.length) {
        feed.appendChild(row);
      }

      index += chunk.length;
      useTrio = !useTrio;
    }

    api.observeReveal(feed.querySelectorAll('.s1903-reveal'));
  }

  function initTransitions(root) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    root.querySelectorAll('.s1903-portfolio-item__link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var href = link.getAttribute('href');
        if (!href || href.charAt(0) === '#') return;
        e.preventDefault();
        document.documentElement.classList.add('s1903-page-leaving');
        window.setTimeout(function () {
          window.location.href = href;
        }, 300);
      });
    });
  }

  window.STUDIO1903Core.boot(function (api, root) {
    var c = api.CONTENT.portfolio || {};
    renderPortfolioHero(api, root, c);
    renderFeed(api, root, c);
    renderPortfolioCta(api, root, c);
    initTransitions(root);
  });
})();
