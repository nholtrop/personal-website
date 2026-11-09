(function () {
  // Publication topic filter
  var chips = document.querySelectorAll('.chip[data-filter]');
  var pubs = document.querySelectorAll('.pub');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-filter');
      chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
      pubs.forEach(function (p) {
        p.hidden = f !== 'all' && (' ' + p.getAttribute('data-topics') + ' ').indexOf(' ' + f + ' ') < 0;
      });
    });
  });

  // YouTube: load privacy-enhanced player only on click
  document.querySelectorAll('.media-play[data-yt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-yt');
      var f = document.createElement('iframe');
      f.className = 'media-frame';
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = b.getAttribute('aria-label') || 'Video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      b.replaceWith(f);
    });
  });

  // Collapse older media items until "Show all" is clicked
  var more = document.querySelector('[data-more]');
  var extra = document.querySelectorAll('.media-extra');
  if (more && extra.length) {
    extra.forEach(function (el) { el.hidden = true; });
    more.hidden = false;
    more.addEventListener('click', function () {
      extra.forEach(function (el) { el.hidden = false; });
      more.setAttribute('aria-expanded', 'true');
      more.parentNode.hidden = true;
    });
  }

  // Copy email
  document.querySelectorAll('.copy[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy');
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy address'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () {});
    });
  });

  // Highlight current section in nav
  var links = document.querySelectorAll('.topbar nav a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { io.observe(s); });
  }
})();
