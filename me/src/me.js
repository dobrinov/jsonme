// Progressive extras. The page works without this file.
(function () {
  var ask = document.querySelector('[data-ask]');
  if (ask) {
    ask.hidden = false;
    ask.addEventListener('click', function () {
      var prompt = ask.getAttribute('data-ask').replace('{url}', new URL('cv.md', location.href).href);
      var label = ask.querySelector('span');
      var done = function () { label.textContent = 'Prompt copied'; };
      if (navigator.clipboard) navigator.clipboard.writeText(prompt).then(done, function () { window.prompt('Copy this prompt', prompt); });
      else window.prompt('Copy this prompt', prompt);
    });
  }

  var print = document.querySelector('[data-print]');
  if (print) {
    print.hidden = false;
    print.addEventListener('click', function () { window.print(); });
  }

  // Career popovers open next to whatever opened them. Without this script they open centred.
  var invoker = null;
  var place = function (pop) {
    if (!invoker || !pop.matches(':popover-open')) return;
    var r = invoker.getBoundingClientRect();
    var w = pop.offsetWidth, h = pop.offsetHeight, gap = 8, edge = 16;
    var top = r.bottom + gap;
    if (top + h > innerHeight - edge && r.top - gap - h >= edge) top = r.top - gap - h;
    pop.style.margin = '0';
    pop.style.inset = 'auto';
    pop.style.top = Math.max(edge, Math.min(top, innerHeight - h - edge)) + 'px';
    pop.style.left = Math.max(edge, Math.min(r.left, innerWidth - w - edge)) + 'px';
  };
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[popovertarget]');
    if (button && !button.hasAttribute('popovertargetaction')) {
      invoker = button;
      var pop = document.getElementById(button.getAttribute('popovertarget'));
      if (pop) pop.querySelectorAll('[data-item]').forEach(function (item) {
        item.classList.toggle('focus', item.getAttribute('data-item') === button.getAttribute('data-role'));
      });
    }
    var link = event.target.closest('.pop a[href^="#"]');
    if (link) link.closest('.pop').hidePopover();
  });
  document.querySelectorAll('.pop[popover]').forEach(function (pop) {
    pop.addEventListener('toggle', function (event) {
      var open = event.newState === 'open';
      document.querySelectorAll('[popovertarget="' + pop.id + '"]:not([popovertargetaction])').forEach(function (b) { b.classList.toggle('on', open); });
      if (open) place(pop);
    });
  });
  var replace = function () {
    var pop = document.querySelector('.pop:popover-open');
    if (pop) place(pop);
  };
  window.addEventListener('resize', replace);
  window.addEventListener('scroll', replace, { passive: true });

  var openTarget = function () {
    var el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && el.tagName === 'DETAILS') el.open = true;
    if (el && el.hasAttribute('popover') && el.showPopover) {
      invoker = document.querySelector('.track [popovertarget="' + el.id + '"]');
      if (invoker) invoker.scrollIntoView({ block: 'center', behavior: 'instant' });
      el.showPopover();
      return;
    }
    if (el) el.scrollIntoView();
  };
  openTarget();
  window.addEventListener('hashchange', openTarget);

  var opened = [];
  window.addEventListener('beforeprint', function () {
    document.querySelectorAll('details:not([open])').forEach(function (d) { d.open = true; opened.push(d); });
  });
  window.addEventListener('afterprint', function () {
    opened.forEach(function (d) { d.open = false; });
    opened = [];
  });
})();
