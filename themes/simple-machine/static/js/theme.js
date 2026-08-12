(function () {
  var toggle = document.querySelector('[data-theme-toggle]');

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
    var prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

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
