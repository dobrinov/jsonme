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

  var openTarget = function () {
    var el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && el.tagName === 'DETAILS') el.open = true;
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
