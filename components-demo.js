/**
 * Comportements interactifs — démo (onglets, modale, navigation).
 */
(function () {
  function initDropdowns() {
    document.querySelectorAll('[data-dropdown]').forEach(function (root) {
      var trigger = root.querySelector('.dropdown__trigger');
      var panel = root.querySelector('.dropdown__panel');
      if (!trigger || !panel) return;

      function isOpen() {
        return trigger.getAttribute('aria-expanded') === 'true';
      }

      function open() {
        panel.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
      }

      function close() {
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
      }

      function toggle(event) {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }
        if (isOpen()) {
          close();
        } else {
          open();
        }
      }

      trigger.addEventListener('click', toggle);

      document.addEventListener('click', function (event) {
        if (!isOpen()) return;
        if (!root.contains(event.target)) {
          close();
        }
      });

      document.addEventListener('keydown', function (event) {
        if (!isOpen()) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          trigger.focus();
        }
      });

      panel.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', close);
      });
    });
  }

  function initNavDrawers() {
    document.querySelectorAll('[data-nav]').forEach(function (navRoot) {
      var burger = navRoot.querySelector('.nav__burger');
      var drawer = navRoot.querySelector('.nav__drawer');
      if (!burger || !drawer) return;

      var panel = drawer.querySelector('.nav__drawer-panel');
      var closers = drawer.querySelectorAll('[data-nav-close]');
      var focusableSelector = 'a[href], button:not([disabled])';

      function getFocusable() {
        return Array.prototype.slice.call(
          drawer.querySelectorAll(focusableSelector)
        ).filter(function (el) {
          return !el.hasAttribute('disabled') && el.offsetParent !== null;
        });
      }

      function isOpen() {
        return burger.getAttribute('aria-expanded') === 'true';
      }

      function open() {
        drawer.hidden = false;
        burger.setAttribute('aria-expanded', 'true');
        burger.setAttribute('aria-label', 'Fermer le menu');
        if (!navRoot.classList.contains('nav--static')) {
          document.body.classList.add('nav-open');
        }

        var firstLink = drawer.querySelector('.nav__drawer-link');
        if (firstLink) firstLink.focus();
      }

      function close() {
        drawer.hidden = true;
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        if (!navRoot.classList.contains('nav--static')) {
          document.body.classList.remove('nav-open');
        }
        burger.focus();
      }

      burger.addEventListener('click', function () {
        if (isOpen()) {
          close();
        } else {
          open();
        }
      });

      closers.forEach(function (closer) {
        closer.addEventListener('click', close);
      });

      navRoot.addEventListener('keydown', function (event) {
        if (!isOpen()) return;

        if (event.key === 'Escape') {
          event.preventDefault();
          close();
          return;
        }

        if (event.key !== 'Tab' || !panel) return;

        var focusable = getFocusable();
        if (!focusable.length) return;

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    });
  }

  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (root) {
      var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
      var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));

      function activate(index) {
        tabs.forEach(function (tab, i) {
          var selected = i === index;
          tab.setAttribute('aria-selected', String(selected));
          tab.tabIndex = selected ? 0 : -1;
        });

        panels.forEach(function (panel, i) {
          panel.hidden = i !== index;
        });
      }

      function focusTab(index) {
        var tab = tabs[index];
        if (tab) {
          tab.focus();
          activate(index);
        }
      }

      tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () {
          activate(index);
        });

        tab.addEventListener('keydown', function (event) {
          var last = tabs.length - 1;
          var next = index;

          if (event.key === 'ArrowRight') {
            next = index === last ? 0 : index + 1;
          } else if (event.key === 'ArrowLeft') {
            next = index === 0 ? last : index - 1;
          } else if (event.key === 'Home') {
            next = 0;
          } else if (event.key === 'End') {
            next = last;
          } else {
            return;
          }

          event.preventDefault();
          focusTab(next);
        });
      });

      activate(0);
    });
  }

  function initModal() {
    var modal = document.getElementById('demo-modal');
    var openBtn = document.getElementById('modal-open-demo');
    if (!modal || !openBtn) return;

    var closers = modal.querySelectorAll('[data-modal-close]');
    var dialog = modal.querySelector('.modal__dialog');
    var focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function getFocusable() {
      return Array.prototype.slice.call(
        modal.querySelectorAll(focusableSelector)
      ).filter(function (el) {
        return !el.hasAttribute('disabled') && el.offsetParent !== null;
      });
    }

    function openModal() {
      modal.hidden = false;
      document.body.classList.add('modal-open');

      var focusable = getFocusable();
      var first = focusable[0];
      if (first) first.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      openBtn.focus();
    }

    openBtn.addEventListener('click', openModal);

    closers.forEach(function (closer) {
      closer.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', function (event) {
      if (event.target === modal.querySelector('.modal__overlay')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (modal.hidden) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      var focusable = getFocusable();
      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function initToasts() {
    var region = document.getElementById('toast-region');
    if (!region) return;

    var messages = {
      default: 'Action enregistrée.',
      success: 'Message envoyé avec succès.',
      error: 'Une erreur est survenue.',
      info: 'Mise à jour disponible.'
    };

    function dismissToast(toast) {
      toast.remove();
    }

    function showToast(variant) {
      var toast = document.createElement('div');
      var role = variant === 'error' ? 'alert' : 'status';
      toast.className = 'toast' + (variant !== 'default' ? ' toast--' + variant : '');
      toast.setAttribute('role', role);

      var message = document.createElement('p');
      message.className = 'toast__message';
      message.textContent = messages[variant] || messages.default;

      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'toast__close';
      closeBtn.setAttribute('aria-label', 'Fermer la notification');
      closeBtn.innerHTML = '<span aria-hidden="true">✕</span>';
      closeBtn.addEventListener('click', function () {
        dismissToast(toast);
      });

      toast.appendChild(message);
      toast.appendChild(closeBtn);
      region.appendChild(toast);

      window.setTimeout(function () {
        if (toast.parentNode) dismissToast(toast);
      }, 5000);
    }

    Object.keys(messages).forEach(function (variant) {
      var btn = document.getElementById('toast-demo-' + variant);
      if (btn) {
        btn.addEventListener('click', function () {
          showToast(variant);
        });
      }
    });
  }

  function init() {
    initTabs();
    initModal();
    initDropdowns();
    initNavDrawers();
    initToasts();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
