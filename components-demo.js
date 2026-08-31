/**
 * Comportements interactifs — démo (onglets, modale, navigation).
 */
(function () {
  function initDropdowns() {
    var instances = [];

    document.querySelectorAll('[data-dropdown]').forEach(function (root) {
      var trigger = root.querySelector('.dropdown__trigger');
      var panel = root.querySelector('.dropdown__panel');
      if (!trigger || !panel) return;

      // role="menu" engage le modele clavier ARIA complet (cf. guidelines : Modele clavier des menus)
      var items = Array.prototype.slice.call(panel.querySelectorAll('[role="menuitem"]'));

      items.forEach(function (item) {
        item.tabIndex = -1;
      });

      function isOpen() {
        return trigger.getAttribute('aria-expanded') === 'true';
      }

      function focusItem(index) {
        if (!items.length) return;
        var next = (index + items.length) % items.length;
        items[next].focus();
      }

      function currentIndex() {
        return items.indexOf(document.activeElement);
      }

      function open(focusTarget) {
        panel.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        if (focusTarget === 'first') focusItem(0);
        if (focusTarget === 'last') focusItem(items.length - 1);
      }

      function close(returnFocus) {
        panel.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        if (returnFocus) trigger.focus();
      }

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (isOpen()) {
          close(false);
        } else {
          open();
        }
      });

      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open('first');
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          open('last');
        }
      });

      panel.addEventListener('keydown', function (event) {
        var index = currentIndex();

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          focusItem(index + 1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          focusItem(index - 1);
        } else if (event.key === 'Home') {
          event.preventDefault();
          focusItem(0);
        } else if (event.key === 'End') {
          event.preventDefault();
          focusItem(items.length - 1);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          close(true);
        } else if (event.key === 'Tab') {
          // Tab sort du menu en le refermant, sans voler le focus
          close(false);
        }
      });

      // Un element desactive reste atteignable au clavier mais ne s'active pas
      items.forEach(function (item) {
        item.addEventListener('click', function (event) {
          if (item.getAttribute('aria-disabled') === 'true') {
            event.preventDefault();
            return;
          }
          close(false);
        });
      });

      instances.push({ root: root, isOpen: isOpen, close: close });
    });

    if (!instances.length) return;

    // Un seul couple de listeners globaux, quel que soit le nombre de menus
    document.addEventListener('click', function (event) {
      instances.forEach(function (instance) {
        if (instance.isOpen() && !instance.root.contains(event.target)) {
          instance.close(false);
        }
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      instances.forEach(function (instance) {
        if (instance.isOpen() && instance.root.contains(document.activeElement)) {
          instance.close(true);
        } else if (instance.isOpen()) {
          instance.close(false);
        }
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
        // L'exemple statique doit reserver la hauteur du tiroir : en position
        // absolute, il se dimensionnerait sur la seule barre de navigation.
        navRoot.classList.add('nav--drawer-open');
        if (!navRoot.classList.contains('nav--static')) {
          document.body.classList.add('nav-open');
        }

        var firstLink = drawer.querySelector('.nav__drawer-link');
        if (firstLink) firstLink.focus();
      }

      function close(returnFocus) {
        // Le focus ne revient au burger que pour une fermeture explicite
        // (bouton croix, Echap, fond). Sur un lien d'ancre, il doit suivre la cible.
        var shouldReturn = returnFocus !== false && drawer.contains(document.activeElement);

        drawer.hidden = true;
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Ouvrir le menu');
        navRoot.classList.remove('nav--drawer-open');
        if (!navRoot.classList.contains('nav--static')) {
          document.body.classList.remove('nav-open');
        }
        if (shouldReturn) burger.focus();
      }

      burger.addEventListener('click', function () {
        if (isOpen()) {
          close(true);
        } else {
          open();
        }
      });

      closers.forEach(function (closer) {
        var isLink = closer.tagName === 'A';
        closer.addEventListener('click', function () {
          close(!isLink);
        });
      });

      navRoot.addEventListener('keydown', function (event) {
        if (!isOpen()) return;

        if (event.key === 'Escape') {
          event.preventDefault();
          close(true);
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

    // Frères directs de la modale : rendus inertes tant qu'elle est ouverte
    function backgroundNodes() {
      return Array.prototype.slice.call(document.body.children).filter(function (el) {
        return el !== modal;
      });
    }

    function setBackgroundInert(inert) {
      backgroundNodes().forEach(function (el) {
        if (inert) {
          el.setAttribute('inert', '');
          el.setAttribute('aria-hidden', 'true');
        } else {
          el.removeAttribute('inert');
          el.removeAttribute('aria-hidden');
        }
      });
    }

    function openModal() {
      modal.hidden = false;
      document.body.classList.add('modal-open');
      setBackgroundInert(true);

      var focusable = getFocusable();
      var first = focusable[0];
      if (first) first.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      setBackgroundInert(false);
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

      // Le compte a rebours est suspendu au survol et au focus clavier (WCAG 2.2.1)
      var timer = null;

      function startTimer() {
        if (timer) return;
        timer = window.setTimeout(function () {
          if (toast.parentNode) dismissToast(toast);
        }, 5000);
      }

      function pauseTimer() {
        if (!timer) return;
        window.clearTimeout(timer);
        timer = null;
      }

      toast.addEventListener('mouseenter', pauseTimer);
      toast.addEventListener('mouseleave', startTimer);
      toast.addEventListener('focusin', pauseTimer);
      toast.addEventListener('focusout', startTimer);

      startTimer();
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
