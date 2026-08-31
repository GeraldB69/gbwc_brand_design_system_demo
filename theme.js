/**
 * Thème clair / fond noir — démo GB Web Conseil.
 * Priorité au chargement : ?theme=dark|light > localStorage > clair.
 * Le toggle met à jour l’URL (query param) et localStorage.
 */
(function () {
  const STORAGE_KEY = 'gbwc-demo-theme';
  const root = document.documentElement;
  const THEME_COLORS = { light: '#00487C', dark: '#000000' };

  function normalizeTheme(value) {
    return value === 'dark' ? 'dark' : 'light';
  }

  function getThemeFromUrl() {
    return new URLSearchParams(window.location.search).get('theme');
  }

  function updateUrl(theme) {
    const url = new URL(window.location.href);
    url.searchParams.set('theme', theme);
    window.history.replaceState({}, '', url);
  }

  function getToggle() {
    return document.getElementById('theme-toggle');
  }

  // Le theme est explicite (data-theme), pas derive de prefers-color-scheme :
  // la meta doit donc etre resynchronisee a chaque bascule.
  function updateThemeColor(theme) {
    const meta = document.getElementById('meta-theme-color');
    if (meta) {
      meta.setAttribute('content', THEME_COLORS[theme] || THEME_COLORS.light);
    }
  }

  function updateToggleUI(theme) {
    const toggle = getToggle();
    if (!toggle) return;

    const isDark = theme === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.setAttribute('aria-label', isDark ? 'Activer le fond clair' : 'Activer le fond noir');

    const label = toggle.querySelector('.theme-toggle__label');
    if (label) {
      label.textContent = isDark ? 'Fond clair' : 'Fond noir';
    }
  }

  function setTheme(theme, options) {
    const opts = options || {};
    const normalized = normalizeTheme(theme);

    root.setAttribute('data-theme', normalized);

    if (opts.persist !== false) {
      try {
        localStorage.setItem(STORAGE_KEY, normalized);
      } catch (_) {
        /* localStorage indisponible */
      }
    }

    if (opts.updateUrl !== false) {
      updateUrl(normalized);
    }

    updateThemeColor(normalized);
    updateToggleUI(normalized);
  }

  function resolveInitialTheme() {
    const fromUrl = getThemeFromUrl();
    if (fromUrl === 'dark' || fromUrl === 'light') {
      return fromUrl;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch (_) {
      /* ignorer */
    }

    return 'light';
  }

  function init() {
    const initial = resolveInitialTheme();
    const shouldSyncUrl = getThemeFromUrl() !== initial;
    setTheme(initial, { updateUrl: shouldSyncUrl });

    const toggle = getToggle();
    if (toggle) {
      toggle.addEventListener('click', function () {
        const current = root.getAttribute('data-theme') || 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
