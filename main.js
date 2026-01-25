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
=========== FAQ JS =============
Tabs + Smooth Accordion
(ONE script only — no duplicates)
============================ */
(() => {
  const tabs = Array.from(document.querySelectorAll(".faq__tab"));
  const panels = Array.from(document.querySelectorAll(".faq__panel"));

  if (!tabs.length || !panels.length) return;

  // ---- Tabs ----
  const activateTab = (tab) => {
    const targetId = tab.getAttribute("aria-controls");
    const panel = document.getElementById(targetId);

    // tabs UI
    tabs.forEach(t => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");

    // panels UI
    panels.forEach(p => {
      p.classList.remove("is-active");
      p.hidden = true;
    });
    if (panel) {
      panel.hidden = false;
      panel.classList.add("is-active");
    }

    // optional: close any open accordion items when switching tabs
    if (panel) {
      panel.querySelectorAll(".faq__item").forEach(item => {
        item.classList.remove("is-open");
        const btn = item.querySelector(".faq__question");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => activateTab(tab));
  });

  // ensure first tab/panel state is correct on load
  const initiallyActive = tabs.find(t => t.classList.contains("is-active")) || tabs[0];
  activateTab(initiallyActive);

  // ---- Accordion (event delegation) ----
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq__question");
    if (!btn) return;

    const item = btn.closest(".faq__item");
    const panel = btn.closest(".faq__panel");
    if (!item || !panel) return;

    const isOpen = item.classList.contains("is-open");

    // close others in THIS panel
    panel.querySelectorAll(".faq__item").forEach(sibling => {
      sibling.classList.remove("is-open");
      const b = sibling.querySelector(".faq__question");
      if (b) b.setAttribute("aria-expanded", "false");
    });

    // toggle this one (allow close on second click)
    if (!isOpen) {
      item.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
    } else {
      item.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
})();
