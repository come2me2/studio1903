/**
 * STUDIO19.03 — пути для локального превью и продакшена
 */
window.STUDIO1903Paths = (function () {
  'use strict';

  function isLocalPreview() {
    var host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || window.location.protocol === 'file:';
  }

  function inPagesDir() {
    return /\/pages\//.test(window.location.pathname) || /pages[\\/][^\\/]+\.html$/i.test(window.location.pathname);
  }

  function projectHref(project) {
    if (!project) return isLocalPreview() ? (inPagesDir() ? 'project.html' : 'pages/project.html') : '/portfolio';
    if (!isLocalPreview()) return project.path;
    return inPagesDir() ? 'project.html?slug=' + project.slug : 'pages/project.html?slug=' + project.slug;
  }

  function portfolioHref() {
    if (!isLocalPreview()) return '/portfolio';
    return inPagesDir() ? 'portfolio.html' : 'pages/portfolio.html';
  }

  function contactsHref() {
    if (!isLocalPreview()) return '/contacts';
    return inPagesDir() ? 'contacts.html' : 'pages/contacts.html';
  }

  return {
    isLocalPreview: isLocalPreview,
    projectHref: projectHref,
    portfolioHref: portfolioHref,
    contactsHref: contactsHref
  };
})();
