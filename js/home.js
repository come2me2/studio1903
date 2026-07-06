/**
 * STUDIO19.03 — главная страница
 */
(function () {
  'use strict';

  function initHome(api, root) {
    var c = api.CONTENT;
    var IMAGES = api.IMAGES;

    if (c.hero) {
      api.setText('[data-s1903="hero.title"]', c.hero.title);
      api.setText('[data-s1903="hero.subtitle"]', c.hero.subtitle);
      api.setText('[data-s1903="hero.location"]', c.hero.location);
      api.setText('[data-s1903="hero.cta"]', c.hero.cta);
      api.setText('[data-s1903="hero.micro"]', c.hero.micro);
    }
    if (c.founder) {
      api.setText('[data-s1903="founder.title"]', c.founder.title);
      api.setText('[data-s1903="founder.subtitle"]', c.founder.subtitle);
      api.setText('[data-s1903="founder.text"]', c.founder.text);
      api.setText('[data-s1903="founder.phone"]', c.founder.phone);
      api.setText('[data-s1903="founder.phoneMicro"]', c.founder.phoneMicro);
    }
    if (c.trust) {
      api.setText('[data-s1903="trust.title"]', c.trust.title);
      api.setText('[data-s1903="trust.subtitle"]', c.trust.subtitle);
      api.setText('[data-s1903="trust.cta"]', c.trust.cta);
      api.setText('[data-s1903="trust.micro"]', c.trust.micro);
      api.renderItems('[data-s1903="trust.items"]', c.trust.items);
    }
    if (c.expertise) {
      api.setText('[data-s1903="expertise.title"]', c.expertise.title);
      api.setText('[data-s1903="expertise.subtitle"]', c.expertise.subtitle);
      api.setText('[data-s1903="expertise.fact"]', c.expertise.fact);
      api.setText('[data-s1903="expertise.cta"]', c.expertise.cta);
      api.setText('[data-s1903="expertise.micro"]', c.expertise.micro);
      api.renderItems('[data-s1903="expertise.items"]', c.expertise.items);
    }
    if (c.process) {
      api.setText('[data-s1903="process.title"]', c.process.title);
      api.setText('[data-s1903="process.subtitle"]', c.process.subtitle);
      api.setText('[data-s1903="process.cta"]', c.process.cta);
      api.setText('[data-s1903="process.micro"]', c.process.micro);
      api.setText('[data-s1903="process.link"]', c.process.link);
      var processLink = root.querySelector('[data-s1903-href="process.link"]');
      if (processLink) processLink.href = c.process.linkHref;
      api.renderSteps('[data-s1903="process.steps"]', c.process.steps);
    }
    if (c.cases) {
      api.setText('[data-s1903="cases.title"]', c.cases.title);
      api.setText('[data-s1903="cases.subtitle"]', c.cases.subtitle);
      api.setText('[data-s1903="cases.cta"]', c.cases.cta);
      api.setText('[data-s1903="cases.micro"]', c.cases.micro);
      api.setText('[data-s1903="cases.link"]', c.cases.link);
      var casesLink = root.querySelector('[data-s1903-href="cases.link"]');
      if (casesLink) casesLink.href = c.cases.linkHref;
      renderCases(api, root, c.cases.items);
    }

    if (IMAGES.hero) {
      var heroImg = root.querySelector('[data-s1903-img="hero"]');
      if (heroImg) {
        heroImg.src = IMAGES.hero.src;
        heroImg.alt = IMAGES.hero.alt;
        if (IMAGES.hero.position) heroImg.style.objectPosition = IMAGES.hero.position;
      }
    }
    if (IMAGES.founder) {
      var founderImg = root.querySelector('[data-s1903-img="founder"]');
      if (founderImg) {
        founderImg.src = IMAGES.founder.src;
        founderImg.alt = IMAGES.founder.alt;
        if (IMAGES.founder.position) founderImg.style.objectPosition = IMAGES.founder.position;
      }
    }

    api.initForm();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(function () {
        root.classList.add('s1903--loaded');
      });
    }
  }

  function renderCases(api, root, items) {
    var wrap = root.querySelector('[data-s1903="cases.grid"]');
    var imgs = api.IMAGES.cases || [];
    var projects = window.STUDIO1903_PROJECTS || [];
    if (!wrap || !items) return;
    wrap.innerHTML = '';
    var paths = window.STUDIO1903Paths || {};
    items.forEach(function (item, i) {
      var imgData = imgs[i] || {};
      var project = projects.find(function (p) {
        return p.slug === item.slug || p.title === item.title;
      });
      var href = paths.projectHref ? paths.projectHref(project) : project ? project.path : imgData.href || '/portfolio';
      var src = project ? project.cover : imgData.src || '';
      var article = document.createElement('article');
      article.className = 's1903-case s1903-reveal';
      article.style.transitionDelay = i * 0.09 + 's';
      article.innerHTML =
        '<a class="s1903-case__link" href="' +
        href +
        '"><div class="s1903-case__media"><img class="s1903-case__img" src="' +
        src +
        '" alt="' +
        item.title +
        '" loading="lazy" width="800" height="1000"></div><h3 class="s1903-case__title">' +
        item.title +
        '</h3><p class="s1903-case__meta">' +
        item.meta +
        '</p></a>';
      wrap.appendChild(article);
    });
  }

  window.STUDIO1903Core.boot(initHome);
})();
