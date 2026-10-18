(() => {
  "use strict";
  const nav = document.getElementById("siteNav");
  const toggle = document.getElementById("vtMenuToggle");
  const links = document.getElementById("primaryNavLinks");
  if (!nav || !toggle || !links) return;
  const mobile = () => window.matchMedia("(max-width: 720px)").matches;

  function closeMenu(restoreFocus = false) {
    const wasOpen = nav.classList.contains("menu-open");
    nav.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    if (restoreFocus && wasOpen) toggle.focus();
  }
  toggle.addEventListener("click", () => {
    if (!mobile()) return;
    const willOpen = !nav.classList.contains("menu-open");
    nav.classList.toggle("menu-open", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
    toggle.setAttribute("aria-label", willOpen ? "Close navigation menu" : "Open navigation menu");
  });
  links.addEventListener("click", event => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("click", event => {
    if (mobile() && !nav.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu(true);
  });
  let scrolled = null;
  function update() {
    if (!mobile()) {
      nav.classList.remove("is-compact");
      closeMenu();
      scrolled = false;
      return;
    }
    const next = window.scrollY > 48;
    if (next !== scrolled) {
      nav.classList.toggle("is-compact", next);
      scrolled = next;
    }
  }
  window.addEventListener("scroll", update, { passive:true });
  window.addEventListener("resize", update, { passive:true });
  update();
})();
