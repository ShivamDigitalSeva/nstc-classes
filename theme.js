// डार्क / लाइट मोड: पिछली पसंद याद रखता है, नहीं तो फ़ोन की सेटिंग के हिसाब से चलता है।
(function () {
  var t;
  try { t = localStorage.getItem('nstc_theme'); } catch (e) {}
  if (!t) t = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.getElementById('themeBtn');
    if (!b) return;
    function paint() {
      var d = document.documentElement.getAttribute('data-theme') === 'dark';
      b.textContent = d ? '☀️' : '🌙';
      b.setAttribute('aria-label', d ? 'Light mode / लाइट मोड' : 'Dark mode / डार्क मोड');
    }
    b.addEventListener('click', function () {
      var n = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', n);
      try { localStorage.setItem('nstc_theme', n); } catch (e) {}
      paint();
    });
    paint();
  });
})();
