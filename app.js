(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* композиция собирается: плоскости прилетают на свои места */
  var stage = $('#stage');
  if (stage) {
    if (calm) { $$('.pl', stage).forEach(function (p) { p.style.transition = 'none'; }); stage.classList.add('on'); }
    else setTimeout(function () { stage.classList.add('on'); }, 120);

    // плоскости парят: лёгкий сдвиг за курсором, у каждой своя глубина
    if (!calm && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      var pls = $$('.pl', stage), tick = false, mx = 0, my = 0;
      stage.parentNode.addEventListener('pointermove', function (e) {
        mx = e.clientX / window.innerWidth - .5; my = e.clientY / window.innerHeight - .5;
        if (tick) return; tick = true;
        setTimeout(function () {
          tick = false;
          pls.forEach(function (p, i) {
            var d = (i % 4 + 1) * 6;
            p.style.setProperty('--px', (mx * d).toFixed(1) + 'px');
            p.style.setProperty('--py', (my * d).toFixed(1) + 'px');
          });
        }, 16);
      });
    }
  }

  /* полосы ресторанов вытягиваются при появлении */
  var bars = $$('.bars li');
  if (!calm && 'IntersectionObserver' in window) {
    bars.forEach(function (b) { b.style.setProperty('--s', 0); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var i = bars.indexOf(e.target);
        setTimeout(function () { e.target.style.setProperty('--s', 1); }, i * 90);
        io.unobserve(e.target);
      });
    }, { threshold: .3 });
    bars.forEach(function (b) { io.observe(b); });
  }

  /* сообщение в Direct */
  var form = $('#form'), ferr = $('#ferr'), fnote = $('#fnote');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var who = form.elements.who;
    if (who.value.trim().length < 2) {
      who.setAttribute('aria-invalid', 'true');
      ferr.textContent = 'Напишите имя и пару слов о проекте — так Анастасия поймёт, о чём речь.';
      who.focus(); return;
    }
    who.setAttribute('aria-invalid', 'false'); ferr.textContent = '';
    var topic = (form.querySelector('input[name="topic"]:checked') || {}).value;
    var text = 'Анастасия, здравствуйте! ' + topic + '.\n' + who.value.trim();
    var open = function () { window.open('https://ig.me/m/anastasiapanibratova', '_blank', 'noopener'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { fnote.textContent = 'Текст скопирован. Вставьте его в Direct, который открылся в новой вкладке.'; open(); }, open);
    } else open();
  });
})();
