/* Redesign page – waitlist notice
   Opens a popup on arrival explaining the 4-redesigns-a-week limit and the
   waitlist. "Yes, I'm happy to move forward" closes it and marks the page
   (html[data-waitlist="yes"]) so the application records the confirmation.
   Once confirmed it won't show again for the rest of the visit. */
(function () {
  var modal = document.getElementById('waitlistModal');
  if (!modal || typeof modal.showModal !== 'function') return;
  var KEY = 'migsflow-waitlist-ok';
  var root = document.documentElement;

  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch (e) {}
  if (seen) { root.dataset.waitlist = 'yes'; return; }

  modal.querySelector('[data-waitlist="confirm"]').addEventListener('click', function () {
    root.dataset.waitlist = 'yes';
    try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    modal.classList.add('is-closing');
    setTimeout(function () { modal.close(); modal.classList.remove('is-closing'); }, 250);
  });

  // Esc shouldn't skip the question: they confirm or leave
  modal.addEventListener('cancel', function (e) { e.preventDefault(); });

  // A short beat after load so the page appears first
  window.addEventListener('load', function () {
    setTimeout(function () { modal.showModal(); }, 450);
  });
})();
