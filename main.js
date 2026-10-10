/* ===== NAV (mobile hamburger + dropdown tap-to-toggle) =====
   Desktop (hover-capable + >=901px): CSS :hover opens the dropdown.
   Tablet & mobile: tap to open, tap again to close.
   Keyboard: Enter/Space/ArrowDown opens, Escape closes.

   Wrapped in DOMContentLoaded to guarantee DOM is fully parsed
   before attaching listeners — avoids timing issues on pages with
   heavy inline scripts (carousels, etc.).
================================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("primary-nav");
  if (!nav || !toggle || !menu) return;

  const dropdowns = nav.querySelectorAll(".nav__dropdown");
  const hoverDesktopMQ = window.matchMedia("(hover: hover) and (min-width: 901px)");
  const mobileMQ = window.matchMedia("(max-width: 900px)");

  function setMenuOpen(isOpen){
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    if (!isOpen) closeAllDropdowns();
  }

  function closeAllDropdowns(){
    dropdowns.forEach((dd) => {
      const btn = dd.querySelector(".nav__dropdown-toggle");
      const panel = dd.querySelector(".nav__dropdown-menu");
      if (!btn || !panel) return;
      btn.setAttribute("aria-expanded", "false");
      panel.classList.remove("is-open");
    });
  }

  /* Mobile hamburger */
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  /* Dropdown toggle — tap-to-toggle on anything that's NOT a hover-capable desktop */
  dropdowns.forEach((dd) => {
    const btn = dd.querySelector(".nav__dropdown-toggle");
    const panel = dd.querySelector(".nav__dropdown-menu");
    if (!btn || !panel) return;

    btn.addEventListener("click", (e) => {
      /* On true desktop (hover + wide), CSS :hover handles it — bail out */
      if (hoverDesktopMQ.matches) return;

      e.preventDefault();
      e.stopPropagation();
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      /* Close any other open dropdowns first */
      dropdowns.forEach((other) => {
        if (other !== dd){
          const oBtn = other.querySelector(".nav__dropdown-toggle");
          const oPanel = other.querySelector(".nav__dropdown-menu");
          if (oBtn) oBtn.setAttribute("aria-expanded", "false");
          if (oPanel) oPanel.classList.remove("is-open");
        }
      });

      /* Toggle this one */
      if (isOpen){
        btn.setAttribute("aria-expanded", "false");
        panel.classList.remove("is-open");
      } else {
        btn.setAttribute("aria-expanded", "true");
        panel.classList.add("is-open");
      }
    });

    /* Keyboard a11y */
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown"){
        e.preventDefault();
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        closeAllDropdowns();
        if (!isOpen){
          btn.setAttribute("aria-expanded", "true");
          panel.classList.add("is-open");
          const firstItem = panel.querySelector(".nav__dropdown-item");
          if (firstItem) firstItem.focus();
        }
      }
    });
  });

  /* Close mobile menu when tapping a real link (not the dropdown toggle) */
  menu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && mobileMQ.matches) setMenuOpen(false);
  });

  /* Close everything on outside click */
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)){
      setMenuOpen(false);
      closeAllDropdowns();
    }
  });

  /* Close on Escape */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape"){
      setMenuOpen(false);
      closeAllDropdowns();
    }
  });

  /* Reset dropdown state when crossing the hover/mobile breakpoint */
  hoverDesktopMQ.addEventListener("change", () => {
    setMenuOpen(false);
    closeAllDropdowns();
  });
});



/* ============================
=========== FAQ JS ============
Tabs (smooth fade in/out) + Smooth Accordion
============================ */
document.addEventListener("DOMContentLoaded", () => {
  const tabs = Array.from(document.querySelectorAll(".faq__tab"));
  const panels = Array.from(document.querySelectorAll(".faq__panel"));
  if (!tabs.length || !panels.length) return;

  function closeAllInPanel(panel) {
    panel.querySelectorAll(".faq__item").forEach((item) => {
      item.classList.remove("is-open");
      const btn = item.querySelector(".faq__question");
      const ans = item.querySelector(".faq__answer");
      if (btn) btn.setAttribute("aria-expanded", "false");
      if (ans) ans.style.maxHeight = "0px";
    });
  }

  function openItem(item) {
    const btn = item.querySelector(".faq__question");
    const ans = item.querySelector(".faq__answer");
    if (!btn || !ans) return;

    item.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");

    ans.style.maxHeight = "0px";
    requestAnimationFrame(() => {
      ans.style.maxHeight = ans.scrollHeight + "px";
    });
  }

  function refreshOpenHeights(panel) {
    panel.querySelectorAll(".faq__item.is-open").forEach((item) => {
      const ans = item.querySelector(".faq__answer");
      if (ans) ans.style.maxHeight = ans.scrollHeight + "px";
    });
  }

  function activateTab(tab) {
    const targetId = tab.getAttribute("aria-controls");
    const targetPanel = document.getElementById(targetId);
    if (!targetPanel) return;

    tabs.forEach((t) => {
      t.classList.remove("is-active");
      t.setAttribute("aria-selected", "false");
    });
    tab.classList.add("is-active");
    tab.setAttribute("aria-selected", "true");

    panels.forEach((p) => {
      const isTarget = p === targetPanel;
      p.classList.toggle("is-active", isTarget);
      if (!isTarget) closeAllInPanel(p);
    });

    requestAnimationFrame(() => refreshOpenHeights(targetPanel));
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => activateTab(tab)));

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".faq__question");
    if (!btn) return;

    const item = btn.closest(".faq__item");
    const panel = btn.closest(".faq__panel");
    if (!item || !panel) return;

    const isOpen = item.classList.contains("is-open");
    closeAllInPanel(panel);
    if (!isOpen) openItem(item);
  });

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

  const activeTab =
    tabs.find((t) => t.classList.contains("is-active")) || tabs[0];
  activateTab(activeTab);
});



/* ===== FORMSPREE phone validation ===== */
document.addEventListener("DOMContentLoaded", () => {
  const phoneInput = document.getElementById("phoneNumber");
  if (!phoneInput) return;

  const phoneRegex = /^\(?\d{3}\)?-?\d{3}-?\d{4}$/;

  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\s+/g, "");

    if (phoneInput.value === "" || phoneRegex.test(phoneInput.value)) {
      phoneInput.setCustomValidity("");
    } else {
      phoneInput.setCustomValidity(
        "Please enter a valid 10-digit phone number. Example: 832-348-0539 or (832)348-0539."
      );
    }
  });
});



/* ===== Fade-in transitions ===== */
document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".fade-on-load");
  if (!items.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const section = el.closest(".fade-section");

      if (section) {
        const group = section.querySelectorAll(".fade-on-load");
        group.forEach((node, i) => {
          node.style.animationDelay = `${Math.min(i * 120, 600)}ms`;
          node.classList.add("in-view");
        });
        group.forEach((node) => io.unobserve(node));
      } else {
        el.style.animationDelay = "0ms";
        el.classList.add("in-view");
        io.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

  items.forEach((el) => io.observe(el));
});





/* ===== Scroll-spy: highlight the nav link for the section in view =====
   As the user scrolls the home page, the nav link pointing to the section
   currently crossing the middle of the viewport gets the .is-active state
   (white + bold). Only sections that exist on THIS page are tracked, so this
   stays inert on sub-pages whose section links point to ../index.html#... */
document.addEventListener("DOMContentLoaded", () => {
  const links = Array.from(document.querySelectorAll(".nav__link"))
    .filter((a) => (a.getAttribute("href") || "").includes("#"));
  if (!links.length) return;

  // Map: section id -> nav link, only for sections present on this page
  const linkFor = new Map();
  links.forEach((a) => {
    const id = (a.getAttribute("href").split("#")[1] || "").trim();
    if (id && document.getElementById(id)) linkFor.set(id, a);
  });
  if (!linkFor.size) return;

  const sections = Array.from(linkFor.keys()).map((id) => document.getElementById(id));
  const visible = new Set();

  function setActive(id) {
    linkFor.forEach((link, key) => link.classList.toggle("is-active", key === id));
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });

      // Activate the first visible section in document order
      const current = sections.find((s) => visible.has(s.id));
      if (current) setActive(current.id);
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );

  sections.forEach((s) => io.observe(s));
});



// FAQ toggle for home page

 document.querySelectorAll('.faq__item').forEach(details => {
    const summary = details.querySelector('summary');
    const answer  = details.querySelector('.faq__answer');
    let animation = null;
    let isClosing = false;
    let isOpening = false;

    summary.addEventListener('click', e => {
      e.preventDefault();
      details.style.overflow = 'hidden';

      if (isClosing || !details.open) {
        open();
      } else if (isOpening || details.open) {
        close();
      }
    });

    function open() {
      isOpening = true;
      details.open = true;
      const startH = `${details.offsetHeight}px`;
      const endH   = `${summary.offsetHeight + answer.offsetHeight + 22}px`;

      if (animation) animation.cancel();
      animation = details.animate(
        { height: [startH, endH] },
        { duration: 320, easing: 'ease' }
      );
      animation.onfinish = () => {
        animation = null;
        isOpening = false;
        details.style.height = '';
        details.style.overflow = '';
      };
      animation.oncancel = () => isOpening = false;
    }

    function close() {
      isClosing = true;
      const startH = `${details.offsetHeight}px`;
      const endH   = `${summary.offsetHeight}px`;

      if (animation) animation.cancel();
      animation = details.animate(
        { height: [startH, endH] },
        { duration: 280, easing: 'ease' }
      );
      animation.onfinish = () => {
        animation  = null;
        isClosing  = false;
        details.open = false;
        details.style.height   = '';
        details.style.overflow = '';
      };
      animation.oncancel = () => isClosing = false;
    }
  });

/* ===== HERO WORK SHOWCASE =====
   Cycles the MacBook + iPhone screens through the client sites every
   5 seconds: both screens crossfade, the caption and dots follow, and the
   device link plus "View Site" point at the site showing. Pauses on
   hover, keyboard focus, while off screen or the tab is hidden, and for
   good once the visitor presses pause. Swipe on touch screens. Reduced
   motion: no auto-advance (arrows, dots and swipe still work).
   The other sites' screens load only after the page has finished.
================================================================ */
(() => {
  const showcase = document.querySelector("[data-showcase]");
  if (!showcase) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const INTERVAL = 5000;

  const laptopScreens = showcase.querySelectorAll(".showcase__device--laptop .showcase__screen");
  const phoneScreens = showcase.querySelectorAll(".showcase__device--phone .showcase__screen");
  const slides = showcase.querySelectorAll(".showcase__slide");
  const dots = showcase.querySelectorAll("[data-showcase-dot]");
  const stage = showcase.querySelector("[data-showcase-link]");
  const visit = showcase.querySelector("[data-showcase-visit]");
  const toggle = showcase.querySelector("[data-showcase-toggle]");
  const total = slides.length;

  let current = 0;
  let timer = null;
  let pausedByVisitor = reduceMotion;
  let hovering = false;
  let focused = false;
  let onScreen = true;

  // Swap in the real image paths once everything else has loaded
  const loadAll = () => {
    showcase.querySelectorAll(".showcase__screen[data-src]").forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  };
  if (document.readyState === "complete") loadAll();
  else window.addEventListener("load", loadAll, { once: true });

  function show(index) {
    current = (index + total) % total;
    // A visitor can click ahead before the rest have loaded
    if (laptopScreens[current].dataset.src) loadAll();

    [laptopScreens, phoneScreens].forEach((set) =>
      set.forEach((img, i) => img.classList.toggle("is-active", i === current)));

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === current);
      slide.hidden = i !== current;
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === current);
      if (i === current) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    const slide = slides[current];
    const url = slide.dataset.url;
    const name = slide.querySelector(".showcase__name").textContent;
    if (url) {
      stage.href = url;
      visit.href = url;
      stage.setAttribute("aria-label", `View the ${name} website (opens in a new tab)`);
      visit.hidden = false;
    } else {
      // No live link yet: devices aren't a link, no View Site button
      stage.removeAttribute("href");
      stage.setAttribute("aria-label", `${name} website preview`);
      visit.hidden = true;
    }
  }

  function schedule() {
    clearInterval(timer);
    timer = null;
    if (pausedByVisitor || hovering || focused || !onScreen || document.hidden) return;
    timer = setInterval(() => show(current + 1), INTERVAL);
  }

  function step(delta) {
    show(current + delta);
    schedule(); // restart the clock so the new site gets its full time
  }

  showcase.querySelector("[data-showcase-prev]").addEventListener("click", () => step(-1));
  showcase.querySelector("[data-showcase-next]").addEventListener("click", () => step(1));
  dots.forEach((dot) => dot.addEventListener("click", () => {
    show(Number(dot.dataset.showcaseDot));
    schedule();
  }));

  function syncToggle() {
    showcase.classList.toggle("is-paused", pausedByVisitor);
    toggle.setAttribute("aria-label", pausedByVisitor ? "Play the showcase" : "Pause the showcase");
  }
  toggle.addEventListener("click", () => {
    pausedByVisitor = !pausedByVisitor;
    syncToggle();
    schedule();
  });
  syncToggle();

  stage.addEventListener("mouseenter", () => { hovering = true; schedule(); });
  stage.addEventListener("mouseleave", () => { hovering = false; schedule(); });
  showcase.addEventListener("focusin", () => { focused = true; schedule(); });
  showcase.addEventListener("focusout", (event) => {
    if (!showcase.contains(event.relatedTarget)) { focused = false; schedule(); }
  });
  document.addEventListener("visibilitychange", schedule);
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    schedule();
  }).observe(showcase);

  // Swipe left/right over the devices; a swipe isn't a click on the link
  let startX = null;
  let swiped = false;
  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") return;
    startX = event.clientX;
    swiped = false;
  });
  stage.addEventListener("pointerup", (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) {
      swiped = true;
      step(dx < 0 ? 1 : -1);
    }
  });
  stage.addEventListener("pointercancel", () => { startX = null; });
  stage.addEventListener("click", (event) => {
    if (swiped) { event.preventDefault(); swiped = false; }
  });

  schedule();
})();
