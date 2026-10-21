/* Homepage – redesign special popup
   Opens a few seconds after the page loads, once per visit (sessionStorage).
   "Claim a Spot" goes to the redesign page; "Maybe later", the X, Esc or a
   click on the backdrop closes it. */
(function () {
  var modal = document.getElementById('redesignPromo');
  if (!modal || typeof modal.showModal !== 'function') return;
  var KEY = 'migsflow-promo-seen';

  try { if (sessionStorage.getItem(KEY) === '1') return; } catch (e) {}

  function close() {
    if (!modal.open) return;
    modal.classList.add('is-closing');
    setTimeout(function () { modal.close(); modal.classList.remove('is-closing'); }, 250);
  }

  modal.querySelectorAll('[data-promo-close]').forEach(function (btn) { btn.addEventListener('click', close); });
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  modal.addEventListener('cancel', function (e) { e.preventDefault(); close(); });

  window.addEventListener('load', function () {
    setTimeout(function () {
      if (document.querySelector('dialog[open]')) return; // never stack on another popup
      modal.showModal();
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    }, 2500);
  });
})();
