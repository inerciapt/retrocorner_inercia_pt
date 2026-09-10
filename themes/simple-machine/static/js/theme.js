(function () {
  var toggle = document.querySelector('[data-theme-toggle]');

  function adjustNavOffset() {
    var h = document.querySelector('.site-header');
    if (!h) return;
    var px = Math.ceil(h.getBoundingClientRect().height) + 8;
    document.documentElement.style.setProperty('--nav-offset', px + 'px');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  var stored = null;
  try {
    stored = localStorage.getItem('theme');
  } catch (e) {}

  if (stored === 'light' || stored === 'dark') {
    applyTheme(stored);
  } else {
    applyTheme('dark');
  }

  adjustNavOffset();
  window.addEventListener('resize', adjustNavOffset);

  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(current);
      try {
        localStorage.setItem('theme', current);
      } catch (e) {}
    });
  }
})();
