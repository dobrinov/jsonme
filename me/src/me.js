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

  // Theme switch: Auto removes the override, Light and Dark set html[data-theme] and are remembered.
  var root = document.documentElement;
  var choice = root.getAttribute('data-theme') || 'auto';
  var sync = function () {
    document.querySelectorAll('[data-theme-choice]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-choice') === choice));
    });
  };
  document.querySelectorAll('.theme').forEach(function (group) { group.hidden = false; });
  sync();
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-theme-choice]');
    if (!button) return;
    choice = button.getAttribute('data-theme-choice');
    if (choice === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', choice);
    try {
      if (choice === 'auto') localStorage.removeItem('me-theme');
      else localStorage.setItem('me-theme', choice);
    } catch (e) {}
    sync();
  });

  // Career timeline: wider than the screen, opened at the present. Fades and buttons show there is more to the left.
  document.querySelectorAll('.tl-frame').forEach(function (frame) {
    var scroller = frame.querySelector('.timeline-scroll');
    var section = frame.closest('section');
    var jump = section && section.querySelector('.tl-jump');
    var controls = section ? section.querySelectorAll('[data-tl]') : [];
    var sync = function () {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var prev = scroller.scrollLeft > 4;
      var next = scroller.scrollLeft < max - 4;
      frame.classList.toggle('can-prev', prev);
      frame.classList.toggle('can-next', next);
      if (jump) jump.hidden = max <= 4;
      controls.forEach(function (b) {
        var on = b.getAttribute('data-tl') === 'prev' ? prev : next;
        if (b.classList.contains('tl-edge')) b.hidden = !on;
        else b.disabled = !on;
      });
    };
    scroller.scrollLeft = scroller.scrollWidth;
    sync();
    scroller.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    // A bar can be wider than the screen: show its tooltip at the pointer (or the middle of what is visible), clear of the names,
    // and outline only the visible part of it, dotted where the scroll cuts it off.
    var visible = function () {
      var gap = parseFloat(getComputedStyle(frame).getPropertyValue('--gap')) || 0;
      return { from: frame.querySelector('.tl-who').getBoundingClientRect().right + gap, to: scroller.getBoundingClientRect().right };
    };
    var hovered = null, lastX = null;
    var tip = function (el, x) {
      var box = el.getBoundingClientRect();
      var view = visible();
      var w = parseFloat(getComputedStyle(el, '::after').width) + 20 || 0;
      if (x == null) x = (Math.max(box.left, view.from) + Math.min(box.right, view.to)) / 2;
      var left = Math.max(view.from, Math.min(x - w / 2, view.to - w));
      el.style.setProperty('--tip-left', (left - box.left) + 'px');
      el.classList.add('tip-at');
      if (!el.classList.contains('seg')) return;
      var cutL = Math.max(0, view.from - box.left), cutR = Math.max(0, box.right - view.to);
      el.style.setProperty('--cut-l', cutL + 'px');
      el.style.setProperty('--cut-r', cutR + 'px');
      el.classList.toggle('cut-l', cutL > 1);
      el.classList.toggle('cut-r', cutR > 1);
    };
    var leave = function () {
      if (hovered) hovered.classList.remove('cut-l', 'cut-r');
      hovered = null;
    };
    scroller.addEventListener('pointermove', function (event) {
      var el = event.target.closest('.track [data-tip]');
      if (el !== hovered) leave();
      if (!el) return;
      hovered = el;
      lastX = event.clientX;
      tip(el, lastX);
    });
    scroller.addEventListener('pointerleave', leave);
    scroller.addEventListener('scroll', function () { if (hovered) tip(hovered, lastX); }, { passive: true });
    scroller.addEventListener('focusin', function (event) {
      if (event.target.matches('.track [data-tip]')) tip(event.target);
    });
    scroller.addEventListener('focusout', function (event) {
      if (event.target !== hovered) event.target.classList.remove('cut-l', 'cut-r');
    });
    controls.forEach(function (b) {
      b.addEventListener('click', function () {
        var track = scroller.clientWidth - frame.querySelector('.tl-who').offsetWidth;
        if (b.getAttribute('data-tl') === 'prev') scroller.scrollBy({ left: -Math.max(200, track * 0.8), behavior: 'smooth' });
        else scroller.scrollTo({ left: scroller.scrollWidth, behavior: 'smooth' });
      });
    });
  });

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
