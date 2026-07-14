/**
 * STUDIO19.03 — внутренние страницы
 */
(function () {
  'use strict';

  window.STUDIO1903Core.boot(function (api, root) {
    var c = api.CONTENT;

    if (c.steps) {
      api.setText('[data-s1903="steps.title"]', c.steps.title);
      api.setText('[data-s1903="steps.subtitle"]', c.steps.subtitle);
      api.setText('[data-s1903="steps.note"]', c.steps.note);
      api.setText('[data-s1903="steps.cta"]', c.steps.cta);
      api.setText('[data-s1903="steps.micro"]', c.steps.micro);
      api.renderSteps('[data-s1903="steps.list"]', c.steps.steps);
    }

    if (c.price) {
      api.setText('[data-s1903="price.title"]', c.price.title);
      api.setText('[data-s1903="price.subtitle"]', c.price.subtitle);
      api.setText('[data-s1903="price.cta"]', c.price.cta);
      api.setText('[data-s1903="price.micro"]', c.price.micro);
      api.renderPriceCards('[data-s1903="price.plans"]', c.price.plans);
    }

    if (c.about) {
      api.setText('[data-s1903="about.title"]', c.about.title);
      api.setText('[data-s1903="about.subtitle"]', c.about.subtitle);
      api.setText('[data-s1903="about.cta"]', c.about.cta);
      var aboutCta = root.querySelector('[data-s1903-href="about.cta"]');
      if (aboutCta) aboutCta.href = c.about.ctaHref;

      var storyEl = root.querySelector('[data-s1903="about.story"]');
      if (storyEl && c.about.story) {
        storyEl.innerHTML = c.about.story
          .split('\n\n')
          .map(function (p) {
            return '<p class="s1903-about-story__p">' + p + '</p>';
          })
          .join('');
      }

      if (c.founder) {
        api.setText('[data-s1903="founder.title"]', c.founder.title);
        api.setText('[data-s1903="founder.subtitle"]', c.founder.subtitle);
        api.setText('[data-s1903="founder.text"]', c.founder.text);
        api.setText('[data-s1903="founder.phone"]', c.founder.phone);
        api.setText('[data-s1903="founder.phoneMicro"]', c.founder.phoneMicro);
      }
      if (c.trust) api.renderItems('[data-s1903="trust.items"]', c.trust.items);

      var founderImg = root.querySelector('[data-s1903-img="founder"]');
      if (founderImg && api.IMAGES.founder) {
        founderImg.src = api.IMAGES.founder.src;
        founderImg.alt = api.IMAGES.founder.alt;
      }
    }

    if (c.contacts) {
      api.setText('[data-s1903="contacts.title"]', c.contacts.title);
      api.setText('[data-s1903="contacts.subtitle"]', c.contacts.subtitle);
      api.setText('[data-s1903="contacts.address"]', c.contacts.address);
      api.setText('[data-s1903="contacts.phone"]', c.contacts.phone);
      api.setText('[data-s1903="contacts.email"]', c.contacts.email);
      var contactsEmail = root.querySelector('[data-s1903="contacts.email"]');
      if (contactsEmail) contactsEmail.href = 'mailto:' + c.contacts.email;
      api.renderAdvantages('[data-s1903="contacts.advantages"]', c.contacts.advantages);
      api.initForm();
    }

    if (c.privacy) {
      api.setText('[data-s1903="privacy.title"]', c.privacy.title);
      var legalEl = root.querySelector('[data-s1903="privacy.body"]');
      if (legalEl && c.privacy.sections) {
        legalEl.innerHTML = c.privacy.sections
          .map(function (section) {
            var html = '<section class="s1903-legal__section s1903-reveal">';
            if (section.title) {
              html += '<h2 class="s1903-legal__heading">' + section.title + '</h2>';
            }
            if (section.paragraphs) {
              section.paragraphs.forEach(function (p) {
                html += '<p class="s1903-legal__p">' + p + '</p>';
              });
            }
            if (section.definitions) {
              html += '<dl class="s1903-legal__definitions">';
              section.definitions.forEach(function (def) {
                html +=
                  '<div class="s1903-legal__def"><dt class="s1903-legal__term">' +
                  def[0] +
                  '</dt><dd class="s1903-legal__desc">— ' +
                  def[1] +
                  '</dd></div>';
              });
              html += '</dl>';
            }
            if (section.subsections) {
              section.subsections.forEach(function (sub) {
                html += '<h3 class="s1903-legal__subheading">' + sub.title + '</h3>';
                if (sub.items) {
                  html += '<ul class="s1903-legal__list">';
                  sub.items.forEach(function (item) {
                    html += '<li class="s1903-legal__list-item">' + item + '</li>';
                  });
                  html += '</ul>';
                }
              });
            }
            if (section.table) {
              html += '<table class="s1903-legal__table"><tbody>';
              section.table.forEach(function (row) {
                html +=
                  '<tr><th scope="row" class="s1903-legal__table-label">' +
                  row[0] +
                  '</th><td class="s1903-legal__table-value">' +
                  row[1] +
                  '</td></tr>';
              });
              html += '</tbody></table>';
            }
            html += '</section>';
            return html;
          })
          .join('');
        api.observeReveal(legalEl.querySelectorAll('.s1903-legal__section'));
      }
    }
  });
})();
