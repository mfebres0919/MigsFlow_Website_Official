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
Tabs + Accordion
============================ */
(() => {
  const tabs = Array.from(document.querySelectorAll(".faq__tab"));
  const panels = Array.from(document.querySelectorAll(".faq__panel"));

  // Tabs
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("aria-controls");

      tabs.forEach(t => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });

      panels.forEach(p => {
        p.classList.remove("is-active");
        p.hidden = true;
      });

      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      const panel = document.getElementById(targetId);
      if (panel) {
        panel.hidden = false;
        panel.classList.add("is-active");
      }
    });
  });

  // Accordion (works inside every panel)
  const allItems = Array.from(document.querySelectorAll(".faq__item"));

  allItems.forEach((item) => {
    const btn = item.querySelector(".faq__question");
    const answer = item.querySelector(".faq__answer");
    if (!btn || !answer) return;

    // initial open state
    const expanded = btn.getAttribute("aria-expanded") === "true";
    item.classList.toggle("is-open", expanded);

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Close all in the CURRENT panel (keeps it clean like your screenshot)
      const panel = item.closest(".faq__panel");
      if (panel) {
        panel.querySelectorAll(".faq__item").forEach((sibling) => {
          sibling.classList.remove("is-open");
          const b = sibling.querySelector(".faq__question");
          if (b) b.setAttribute("aria-expanded", "false");
        });
      }

      // Toggle this one
      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
})();
