/**
 * STUDIO19.03 — общее ядро
 */
window.STUDIO1903Core = (function () {
  'use strict';

  var menuEscapeBound = false;

  function getRoot() {
    return document.getElementById('studio1903');
  }

  function bindMenu(root) {
    if (!root) return false;

    var burger = root.querySelector('.s1903-burger');
    var menu = root.querySelector('.s1903-menu');
    if (!burger || !menu) return false;
    if (burger.dataset.s1903MenuBound === '1') return true;

    burger.dataset.s1903MenuBound = '1';

    function close() {
      burger.classList.remove('s1903-burger--open');
      menu.classList.remove('s1903-menu--open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function open() {
      burger.classList.add('s1903-burger--open');
      menu.classList.add('s1903-menu--open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Закрыть меню');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function toggle(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (menu.classList.contains('s1903-menu--open')) close();
      else open();
    }

    burger.addEventListener('click', toggle);

    var menuClose = menu.querySelector('.s1903-menu__close');
    if (menuClose) {
      menuClose.addEventListener('click', function (event) {
        event.preventDefault();
        close();
      });
    }

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) close();
    });

    if (!menuEscapeBound) {
      menuEscapeBound = true;
      document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        var activeRoot = getRoot();
        var activeMenu = activeRoot && activeRoot.querySelector('.s1903-menu');
        if (activeMenu && activeMenu.classList.contains('s1903-menu--open')) {
          var activeBurger = activeRoot.querySelector('.s1903-burger');
          if (activeBurger) {
            activeBurger.classList.remove('s1903-burger--open');
            activeBurger.setAttribute('aria-expanded', 'false');
            activeBurger.setAttribute('aria-label', 'Открыть меню');
          }
          activeMenu.classList.remove('s1903-menu--open');
          activeMenu.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });
    }

    return true;
  }

  function ensureMenu(root) {
    if (bindMenu(root)) return;
    window.setTimeout(function () {
      bindMenu(getRoot());
    }, 0);
    window.setTimeout(function () {
      bindMenu(getRoot());
    }, 100);
  }

  function getContent() {
    return Object.assign(
      {},
      window.STUDIO1903_SHARED || {},
      window.STUDIO1903_HOME || {},
      window.STUDIO1903_PAGE || {},
      window.STUDIO1903_CONTENT || {}
    );
  }

  function createApi(root) {
    var CONTENT = getContent();
    var IMAGES = window.STUDIO1903_IMAGES || {};

    function setText(selector, text) {
      var el = root.querySelector(selector);
      if (el && text != null) el.textContent = text;
    }

    function setPlaceholder(id, text) {
      var el = root.querySelector(id);
      if (el) el.placeholder = text;
    }

    function applySharedContent() {
      var c = CONTENT;
      if (!c.header) return;

      setText('[data-s1903="header.logo"]', c.header.logo);
      setText('[data-s1903="header.phone"]', c.header.phone);
      setText('[data-s1903="header.cta"]', c.header.cta);
      setText('[data-s1903="header.menuAddress"]', c.header.menuAddress);

      root.querySelectorAll('[data-s1903-href="header.phone"]').forEach(function (a) {
        a.href = c.header.phoneHref;
      });

      var formHref = root.querySelector('#s1903-form') ? '#s1903-form' : '/contacts';
      root.querySelectorAll('[data-s1903-href="form"]').forEach(function (a) {
        a.href = formHref;
      });

      var navDesktop = root.querySelector('[data-s1903="nav.desktop"]');
      var navMobile = root.querySelector('[data-s1903="nav.mobile"]');
      if (navDesktop && c.header.nav) {
        navDesktop.innerHTML = '';
        c.header.nav.forEach(function (item) {
          var a = document.createElement('a');
          a.className = 's1903-nav__link';
          a.href = item.href;
          a.textContent = item.label;
          if (item.href === window.location.pathname) a.setAttribute('aria-current', 'page');
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
          privacyEl.innerHTML = c.form.privacy.replace(
            'политикой конфиденциальности',
            '<a href="' + c.form.privacyHref + '">политикой конфиденциальности</a>'
          );
        }
      }

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

    function applyLogos() {
      if (!IMAGES.logo || !IMAGES.logo.src) return;
      var logoAlt = IMAGES.logo.alt || (CONTENT.header && CONTENT.header.logo) || 'Studio19.03';
      var logoHeight = IMAGES.logo.height || 28;
      var imgLight = root.querySelector('[data-s1903-img="header.logo"]');
      var imgDark = root.querySelector('[data-s1903-img="header.logoDark"]');
      var logoText = root.querySelector('.s1903-header__logo-text');
      var logoLink = root.querySelector('.s1903-header__logo');
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
          '</span><div class="s1903-step__body"><h3 class="s1903-step__title">' +
          step.title +
          '</h3><p class="s1903-step__text">' +
          step.text +
          '</p></div>';
        wrap.appendChild(div);
      });
    }

    function renderPriceCards(selector, plans) {
      var wrap = root.querySelector(selector);
      if (!wrap || !plans) return;
      wrap.innerHTML = '';
      plans.forEach(function (plan, index) {
        var card = document.createElement('article');
        card.className = 's1903-price-card s1903-reveal';
        card.style.transitionDelay = index * 0.08 + 's';

        var html = '<h3 class="s1903-price-card__title">' + plan.title + '</h3>';
        html += '<p class="s1903-price-card__price">' + plan.price + '</p>';

        if (plan.tiers && plan.tiers.length) {
          html += '<ul class="s1903-price-card__tiers">';
          plan.tiers.forEach(function (tier) {
            html +=
              '<li class="s1903-price-card__tier">' +
              '<span class="s1903-price-card__tier-range">' + tier.range + '</span>' +
              '<span class="s1903-price-card__tier-value">' + tier.value + '</span>' +
              '</li>';
          });
          html += '</ul>';
        }

        if (plan.features && plan.features.length) {
          html += '<ul class="s1903-price-card__features">';
          plan.features.forEach(function (feature) {
            html += '<li>' + feature + '</li>';
          });
          html += '</ul>';
        }

        if (plan.note) {
          html += '<p class="s1903-price-card__note">' + plan.note + '</p>';
        }

        card.innerHTML = html;
        wrap.appendChild(card);
      });
    }

    function renderAdvantages(selector, items) {
      var wrap = root.querySelector(selector);
      if (!wrap || !items) return;
      wrap.innerHTML = '';
      items.forEach(function (item, index) {
        var div = document.createElement('div');
        div.className = 's1903-advantage s1903-reveal';
        div.style.transitionDelay = index * 0.08 + 's';
        div.innerHTML =
          '<p class="s1903-advantage__label">' +
          item.label +
          '</p><p class="s1903-advantage__text">' +
          item.text +
          '</p>';
        wrap.appendChild(div);
      });
    }

    function initHeader() {
      var header = root.querySelector('.s1903-header');
      if (!header) return;
      if (header.classList.contains('s1903-header--light')) {
        header.classList.add('s1903-header--scrolled');
        return;
      }
      function onScroll() {
        if (window.scrollY > 80) header.classList.add('s1903-header--scrolled');
        else header.classList.remove('s1903-header--scrolled');
      }
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    function initMenu() {
      ensureMenu(root);
    }

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

    function initReveal() {
      observeReveal(root.querySelectorAll('.s1903-reveal'));
    }

    function observeReveal(nodes) {
      if (!nodes || !nodes.length) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        nodes.forEach(function (el) {
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
      nodes.forEach(function (el, index) {
        if (el.classList.contains('s1903-reveal--visible')) return;
        el.style.transitionDelay = Math.min(index * 0.08, 0.48) + 's';
        observer.observe(el);
      });
    }

    function initForm(successScrollTarget) {
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
        } else if (phone.value.replace(/\D/g, '').length < 10) {
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
        form.hidden = true;
        if (success) success.hidden = false;
        formBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }

    return {
      CONTENT: CONTENT,
      IMAGES: IMAGES,
      setText: setText,
      applySharedContent: applySharedContent,
      applyLogos: applyLogos,
      renderItems: renderItems,
      renderSteps: renderSteps,
      renderPriceCards: renderPriceCards,
      renderAdvantages: renderAdvantages,
      initHeader: initHeader,
      initMenu: initMenu,
      initAnchors: initAnchors,
      initReveal: initReveal,
      observeReveal: observeReveal,
      initForm: initForm
    };
  }

  function initPage(pageInit) {
    var root = getRoot();
    if (!root) return false;
    var api = createApi(root);
    var firstBoot = !root.classList.contains('s1903-js-ready');

    api.applySharedContent();
    api.applyLogos();
    if (typeof pageInit === 'function' && firstBoot) pageInit(api, root);
    api.initHeader();
    api.initMenu();
    if (firstBoot) {
      api.initAnchors();
      api.initReveal();
      root.classList.add('s1903-js-ready');
      setTimeout(api.initReveal, 100);
    }
    return true;
  }

  function scheduleBoot(pageInit) {
    if (initPage(pageInit)) return;
    setTimeout(function () {
      if (initPage(pageInit)) return;
      setTimeout(function () {
        initPage(pageInit);
      }, 1000);
    }, 250);
  }

  function boot(pageInit) {
    if (typeof window.t_onReady === 'function') {
      window.t_onReady(function () {
        scheduleBoot(pageInit);
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        scheduleBoot(pageInit);
      });
    } else {
      scheduleBoot(pageInit);
    }
    window.addEventListener('load', function () {
      scheduleBoot(pageInit);
    });
  }

  return { boot: boot, initPage: initPage, getContent: getContent };
})();
