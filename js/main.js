/**
 * STUDIO19.03 — главный скрипт
 * Vanilla JS: контент, изображения, меню, скролл, форма
 */
(function () {
  'use strict';

  var root = document.getElementById('studio1903');
  if (!root) return;

  var CONTENT = window.STUDIO1903_CONTENT || {};
  var IMAGES = window.STUDIO1903_IMAGES || {};

  /* ========== УТИЛИТЫ ========== */

  function setText(selector, text) {
    var el = root.querySelector(selector);
    if (el && text != null) el.textContent = text;
  }

  function setHTML(selector, html) {
    var el = root.querySelector(selector);
    if (el && html != null) el.innerHTML = html;
  }

  function createArrow() {
    var span = document.createElement('span');
    span.className = 's1903-arrow';
    span.setAttribute('aria-hidden', 'true');
    span.textContent = '→';
    return span;
  }

  /* ========== КОНТЕНТ ========== */

  function applyContent() {
    var c = CONTENT;
    if (!c.header) return;

    setText('[data-s1903="header.logo"]', c.header.logo);
    setText('[data-s1903="header.phone"]', c.header.phone);
    setText('[data-s1903="header.cta"]', c.header.cta);
    setText('[data-s1903="header.menuAddress"]', c.header.menuAddress);

    var phoneLinks = root.querySelectorAll('[data-s1903-href="header.phone"]');
    phoneLinks.forEach(function (a) {
      a.href = c.header.phoneHref;
    });

    var ctaLinks = root.querySelectorAll('[data-s1903-href="form"]');
    ctaLinks.forEach(function (a) {
      a.href = '#s1903-form';
    });

    /* Nav */
    var navDesktop = root.querySelector('[data-s1903="nav.desktop"]');
    var navMobile = root.querySelector('[data-s1903="nav.mobile"]');
    if (navDesktop && c.header.nav) {
      navDesktop.innerHTML = '';
      c.header.nav.forEach(function (item) {
        var a = document.createElement('a');
        a.className = 's1903-nav__link';
        a.href = item.href;
        a.textContent = item.label;
        navDesktop.appendChild(a);
      });
    }
    if (navMobile && c.header.nav) {
      navMobile.innerHTML = '';
      c.header.nav.forEach(function (item) {
        var a = document.createElement('a');
        a.className = 's1903-menu__link';
        a.href = item.href;
        a.textContent = item.label;
        navMobile.appendChild(a);
      });
    }

    /* Hero */
    if (c.hero) {
      setText('[data-s1903="hero.title"]', c.hero.title);
      setText('[data-s1903="hero.subtitle"]', c.hero.subtitle);
      setText('[data-s1903="hero.location"]', c.hero.location);
      setText('[data-s1903="hero.cta"]', c.hero.cta);
      setText('[data-s1903="hero.micro"]', c.hero.micro);
    }

    /* Founder */
    if (c.founder) {
      setText('[data-s1903="founder.title"]', c.founder.title);
      setText('[data-s1903="founder.subtitle"]', c.founder.subtitle);
      setText('[data-s1903="founder.text"]', c.founder.text);
      setText('[data-s1903="founder.phone"]', c.founder.phone);
      setText('[data-s1903="founder.phoneMicro"]', c.founder.phoneMicro);
    }

    /* Trust */
    if (c.trust) {
      setText('[data-s1903="trust.title"]', c.trust.title);
      setText('[data-s1903="trust.subtitle"]', c.trust.subtitle);
      setText('[data-s1903="trust.cta"]', c.trust.cta);
      setText('[data-s1903="trust.micro"]', c.trust.micro);
      renderItems('[data-s1903="trust.items"]', c.trust.items);
    }

    /* Expertise */
    if (c.expertise) {
      setText('[data-s1903="expertise.title"]', c.expertise.title);
      setText('[data-s1903="expertise.subtitle"]', c.expertise.subtitle);
      setText('[data-s1903="expertise.fact"]', c.expertise.fact);
      setText('[data-s1903="expertise.cta"]', c.expertise.cta);
      setText('[data-s1903="expertise.micro"]', c.expertise.micro);
      renderItems('[data-s1903="expertise.items"]', c.expertise.items);
    }

    /* Process */
    if (c.process) {
      setText('[data-s1903="process.title"]', c.process.title);
      setText('[data-s1903="process.subtitle"]', c.process.subtitle);
      setText('[data-s1903="process.cta"]', c.process.cta);
      setText('[data-s1903="process.micro"]', c.process.micro);
      setText('[data-s1903="process.link"]', c.process.link);
      var processLink = root.querySelector('[data-s1903-href="process.link"]');
      if (processLink) processLink.href = c.process.linkHref;
      renderSteps('[data-s1903="process.steps"]', c.process.steps);
    }

    /* Cases */
    if (c.cases) {
      setText('[data-s1903="cases.title"]', c.cases.title);
      setText('[data-s1903="cases.subtitle"]', c.cases.subtitle);
      setText('[data-s1903="cases.cta"]', c.cases.cta);
      setText('[data-s1903="cases.micro"]', c.cases.micro);
      setText('[data-s1903="cases.link"]', c.cases.link);
      var casesLink = root.querySelector('[data-s1903-href="cases.link"]');
      if (casesLink) casesLink.href = c.cases.linkHref;
      renderCases('[data-s1903="cases.grid"]', c.cases.items);
    }

    /* Form */
    if (c.form) {
      setText('[data-s1903="form.title"]', c.form.title);
      setText('[data-s1903="form.subtitle"]', c.form.subtitle);
      setText('[data-s1903="form.text"]', c.form.text);
      setText('[data-s1903="form.submit"]', c.form.submit);
      setText('[data-s1903="form.phone"]', c.form.phone);
      setText('[data-s1903="form.email"]', c.form.email);
      var emailLink = root.querySelector('[data-s1903-href="form.email"]');
      if (emailLink) emailLink.href = 'mailto:' + c.form.email;
      setText('[data-s1903="form.address"]', c.form.address);
      setText('[data-s1903="form.phoneMicro"]', c.form.phoneMicro);
      setText('[data-s1903-label="form.name"]', c.form.fields.name.label);
      setText('[data-s1903-label="form.phone"]', c.form.fields.phone.label);
      setText('[data-s1903-label="form.area"]', c.form.fields.area.label);
      setPlaceholder('#s1903-name', c.form.fields.name.placeholder);
      setPlaceholder('#s1903-phone', c.form.fields.phone.placeholder);
      setPlaceholder('#s1903-area', c.form.fields.area.placeholder);
      setText('[data-s1903="form.success.title"]', c.form.success.title);
      setText('[data-s1903="form.success.subtitle"]', c.form.success.subtitle);
      setText('[data-s1903="form.success.text"]', c.form.success.text);
      setText('[data-s1903="form.success.cta"]', c.form.success.cta);
      var privacyEl = root.querySelector('[data-s1903="form.privacy"]');
      if (privacyEl && c.form.privacy) {
        privacyEl.innerHTML =
          c.form.privacy.replace(
            'политикой конфиденциальности',
            '<a href="' + c.form.privacyHref + '">политикой конфиденциальности</a>'
          );
      }
    }

    /* Footer */
    if (c.footer) {
      setText('[data-s1903="footer.logo"]', c.header.logo);
      setText('[data-s1903="footer.copyright"]', c.footer.copyright);
      setText('[data-s1903="footer.address"]', c.footer.address);
      setText('[data-s1903="footer.policy"]', c.footer.policy);
      var policyLink = root.querySelector('[data-s1903-href="footer.policy"]');
      if (policyLink) policyLink.href = c.footer.policyHref;
      var socialWrap = root.querySelector('[data-s1903="footer.social"]');
      if (socialWrap && c.footer.social) {
        socialWrap.innerHTML = '';
        c.footer.social.forEach(function (s, i) {
          if (i > 0) socialWrap.appendChild(document.createTextNode(' · '));
          var a = document.createElement('a');
          a.href = s.href;
          a.className = 's1903-footer__social-link';
          a.textContent = s.label;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          socialWrap.appendChild(a);
        });
      }
    }
  }

  function setPlaceholder(id, text) {
    var el = root.querySelector(id);
    if (el) el.placeholder = text;
  }

  function renderItems(selector, items) {
    var wrap = root.querySelector(selector);
    if (!wrap || !items) return;
    wrap.innerHTML = '';
    items.forEach(function (item, index) {
      var div = document.createElement('div');
      div.className = 's1903-item s1903-reveal';
      div.style.transitionDelay = index * 0.1 + 's';
      div.innerHTML =
        '<p class="s1903-item__label">' +
        item.label +
        '</p><p class="s1903-item__text">' +
        item.text +
        '</p>';
      wrap.appendChild(div);
    });
  }

  function renderSteps(selector, steps) {
    var wrap = root.querySelector(selector);
    if (!wrap || !steps) return;
    wrap.innerHTML = '';
    steps.forEach(function (step, index) {
      var div = document.createElement('div');
      div.className = 's1903-step s1903-reveal';
      div.style.transitionDelay = index * 0.07 + 's';
      div.innerHTML =
        '<span class="s1903-step__num">' +
        step.num +
        '</span>' +
        '<div class="s1903-step__body">' +
        '<h3 class="s1903-step__title">' +
        step.title +
        '</h3>' +
        '<p class="s1903-step__text">' +
        step.text +
        '</p>' +
        '</div>';
      wrap.appendChild(div);
    });
  }

  function renderCases(selector, items) {
    var wrap = root.querySelector(selector);
    var imgs = IMAGES.cases || [];
    if (!wrap || !items) return;
    wrap.innerHTML = '';
    items.forEach(function (item, i) {
      var imgData = imgs[i] || {};
      var article = document.createElement('article');
      article.className = 's1903-case s1903-reveal';
      article.style.transitionDelay = i * 0.09 + 's';
      article.innerHTML =
        '<a class="s1903-case__link" href="' +
        (imgData.href || '/portfolio') +
        '">' +
        '<div class="s1903-case__media">' +
        '<img class="s1903-case__img" src="' +
        (imgData.src || '') +
        '" alt="' +
        (imgData.alt || item.title) +
        '" loading="lazy" width="800" height="1000">' +
        '</div>' +
        '<h3 class="s1903-case__title">' +
        item.title +
        '</h3>' +
        '<p class="s1903-case__meta">' +
        item.meta +
        '</p>' +
        '</a>';
      wrap.appendChild(article);
    });
  }

  /* ========== ИЗОБРАЖЕНИЯ ========== */

  function applyImages() {
    if (IMAGES.logo && IMAGES.logo.src) {
      var logoLink = root.querySelector('.s1903-header__logo');
      var logoAlt =
        IMAGES.logo.alt || (CONTENT.header && CONTENT.header.logo) || 'Studio19.03';
      var logoHeight = IMAGES.logo.height || 28;
      var imgLight = root.querySelector('[data-s1903-img="header.logo"]');
      var imgDark = root.querySelector('[data-s1903-img="header.logoDark"]');
      var logoText = root.querySelector('.s1903-header__logo-text');

      if (imgLight) {
        imgLight.src = IMAGES.logo.src;
        imgLight.alt = logoAlt;
        imgLight.height = logoHeight;
        imgLight.removeAttribute('width');
        imgLight.removeAttribute('hidden');
      }
      if (imgDark) {
        imgDark.src = IMAGES.logo.srcDark || IMAGES.logo.src;
        imgDark.alt = logoAlt;
        imgDark.height = logoHeight;
        imgDark.removeAttribute('width');
        imgDark.removeAttribute('hidden');
      }
      if (logoText) logoText.setAttribute('hidden', '');
      if (logoLink) {
        logoLink.setAttribute('aria-label', logoAlt);
        logoLink.style.setProperty('--s1903-logo-height', logoHeight + 'px');
      }
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
  }

  /* ========== HEADER SCROLL ========== */

  function initHeader() {
    var header = root.querySelector('.s1903-header');
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 80) {
        header.classList.add('s1903-header--scrolled');
      } else {
        header.classList.remove('s1903-header--scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ========== MOBILE MENU ========== */

  function initMenu() {
    var burger = root.querySelector('.s1903-burger');
    var menu = root.querySelector('.s1903-menu');
    if (!burger || !menu) return;

    function close() {
      burger.classList.remove('s1903-burger--open');
      menu.classList.remove('s1903-menu--open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    function open() {
      burger.classList.add('s1903-burger--open');
      menu.classList.add('s1903-menu--open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    burger.addEventListener('click', function () {
      if (menu.classList.contains('s1903-menu--open')) close();
      else open();
    });

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ========== SMOOTH SCROLL ========== */

  function initAnchors() {
    root.querySelectorAll('a[href^="#s1903"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var headerH = parseInt(
          getComputedStyle(root).getPropertyValue('--s1903-header-height') || '72',
          10
        );
        var top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ========== SCROLL REVEAL ========== */

  function initReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.querySelectorAll('.s1903-reveal').forEach(function (el) {
        el.classList.add('s1903-reveal--visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('s1903-reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );

    root.querySelectorAll('.s1903-reveal').forEach(function (el, index) {
      el.style.transitionDelay = Math.min(index * 0.08, 0.48) + 's';
      observer.observe(el);
    });
  }

  /* ========== HERO ENTRANCE ========== */

  function initHeroEntrance() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    requestAnimationFrame(function () {
      root.classList.add('s1903--loaded');
    });
  }

  /* ========== FORM ========== */

  function initForm() {
    var form = root.querySelector('#s1903-form-element');
    var formBlock = root.querySelector('#s1903-form');
    var success = root.querySelector('#s1903-form-success');
    if (!form || !formBlock) return;

    var errors = (CONTENT.form && CONTENT.form.errors) || {};

    function showError(id, msg) {
      var input = root.querySelector('#' + id);
      var err = root.querySelector('[data-error-for="' + id + '"]');
      if (input) input.classList.add('s1903-input--error');
      if (err) err.textContent = msg;
    }

    function clearErrors() {
      form.querySelectorAll('.s1903-input').forEach(function (i) {
        i.classList.remove('s1903-input--error');
      });
      form.querySelectorAll('.s1903-field__error').forEach(function (e) {
        e.textContent = '';
      });
    }

    function validatePhone(val) {
      var digits = val.replace(/\D/g, '');
      return digits.length >= 10;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();
      var valid = true;

      var name = root.querySelector('#s1903-name');
      var phone = root.querySelector('#s1903-phone');
      var area = root.querySelector('#s1903-area');
      var privacy = root.querySelector('#s1903-privacy');

      if (!name.value.trim()) {
        showError('s1903-name', errors.name || '');
        valid = false;
      }
      if (!phone.value.trim()) {
        showError('s1903-phone', errors.phone || '');
        valid = false;
      } else if (!validatePhone(phone.value)) {
        showError('s1903-phone', errors.phoneFormat || '');
        valid = false;
      }
      if (!area.value.trim()) {
        showError('s1903-area', errors.area || '');
        valid = false;
      }
      if (!privacy.checked) {
        var privacyErr = root.querySelector('[data-error-for="s1903-privacy"]');
        if (privacyErr) privacyErr.textContent = errors.privacy || '';
        valid = false;
      }

      if (!valid) return;

      /*
       * TILDA: подключите отправку через форму Tilda.
       * Замените блок ниже на вызов tildaForm или action вашей CRM.
       */
      form.hidden = true;
      if (success) success.hidden = false;
      formBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    var backBtn = root.querySelector('[data-s1903="form.success.cta"]');
    if (backBtn) {
      backBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var cases = root.querySelector('#s1903-cases');
        if (cases) cases.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  /* ========== INIT ========== */

  function init() {
    applyContent();
    applyImages();
    initHeader();
    initMenu();
    initAnchors();
    initReveal();
    initHeroEntrance();
    initForm();

    root.classList.add('s1903-js-ready');

    /* Повторный reveal для динамических элементов */
    setTimeout(initReveal, 100);
    return true;
  }

  function boot() {
    if (!document.getElementById('studio1903')) {
      return false;
    }
    init();
    return true;
  }

  function scheduleBoot() {
    if (boot()) return;
    setTimeout(function () {
      if (boot()) return;
      setTimeout(boot, 1000);
    }, 250);
  }

  if (typeof window.t_onReady === 'function') {
    window.t_onReady(scheduleBoot);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleBoot);
  } else {
    scheduleBoot();
  }

  window.addEventListener('load', scheduleBoot);
})();
