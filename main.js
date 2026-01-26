  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("primary-nav");

  function setOpen(isOpen){
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  // Close menu when clicking a link (mobile)
  menu.addEventListener("click", (e) => {
    if (e.target.matches("a")) setOpen(false);
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) setOpen(false);
  });

  // Close menu on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });



/* ============================
=========== FAQ JS ============
Tabs (smooth fade in/out) + Smooth Accordion
============================ */
(() => {
  const tabs = Array.from(document.querySelectorAll(".faq__tab"));
  const panels = Array.from(document.querySelectorAll(".faq__panel"));
  if (!tabs.length || !panels.length) return;

  // Close all items inside a panel
  function closeAllInPanel(panel) {
    panel.querySelectorAll(".faq__item").forEach((item) => {
      item.classList.remove("is-open");
      const btn = item.querySelector(".faq__question");
      const ans = item.querySelector(".faq__answer");
      if (btn) btn.setAttribute("aria-expanded", "false");
      if (ans) ans.style.maxHeight = "0px";
    });
  }

  // Open one item smoothly
  function openItem(item) {
    const btn = item.querySelector(".faq__question");
    const ans = item.querySelector(".faq__answer");
    if (!btn || !ans) return;

    item.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");

    // reset then expand
    ans.style.maxHeight = "0px";
    requestAnimationFrame(() => {
      ans.style.maxHeight = ans.scrollHeight + "px";
    });
  }

  // Keep open answers sized correctly (helps after panel animations)
  function refreshOpenHeights(panel) {
    panel.querySelectorAll(".faq__item.is-open").forEach((item) => {
      const ans = item.querySelector(".faq__answer");
      if (ans) ans.style.maxHeight = ans.scrollHeight + "px";
    });
  }

  // Switch active tab/panel
  function activateTab(tab) {
    const targetId = tab.getAttribute("aria-controls");
    const targetPanel = document.getElementById(targetId);
    if (!targetPanel) return;

    // tabs UI
    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");

    // panels UI (no display none)
    panels.forEach((p) => {
      const isTarget = p === targetPanel;
      p.classList.toggle("is-active", isTarget);

      // optional: close accordion when leaving a panel
      if (!isTarget) closeAllInPanel(p);
    });

    // after panel becomes visible, ensure heights are correct
    requestAnimationFrame(() => refreshOpenHeights(targetPanel));
  }

  // Tabs events
  tabs.forEach((tab) => tab.addEventListener("click", () => activateTab(tab)));

  // Accordion event delegation
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq__question");
    if (!btn) return;

    const item = btn.closest(".faq__item");
    const panel = btn.closest(".faq__panel");
    if (!item || !panel) return;

    const isOpen = item.classList.contains("is-open");

    // close siblings in same panel
    closeAllInPanel(panel);

    // toggle this one
    if (!isOpen) openItem(item);
  });

  // Init answers (set correct max-height for any pre-opened)
  panels.forEach((panel) => {
    panel.querySelectorAll(".faq__item").forEach((item) => {
      const btn = item.querySelector(".faq__question");
      const ans = item.querySelector(".faq__answer");
      if (!btn || !ans) return;

      const expanded = btn.getAttribute("aria-expanded") === "true";
      if (expanded) {
        item.classList.add("is-open");
        ans.style.maxHeight = ans.scrollHeight + "px";
      } else {
        item.classList.remove("is-open");
        ans.style.maxHeight = "0px";
      }
    });
  });

  // Default active tab if none selected
  const activeTab =
    tabs.find((t) => t.classList.contains("is-active")) || tabs[0];

  activateTab(activeTab);
})();
