(() => {
  const nav = document.getElementById("siteNav");
  if (!nav) return;

  const MOBILE_MAX = 720;
  const COMPACT_AT = 48;

  let lastState = null;

  function isMobile() {
    return window.innerWidth <= MOBILE_MAX;
  }

  function update() {
    // Only compact on mobile
    if (!isMobile()) {
      if (nav.classList.contains("is-compact")) {
        nav.classList.remove("is-compact");
      }
      lastState = false;
      return;
    }

    const shouldCompact = window.scrollY > COMPACT_AT;

    if (shouldCompact !== lastState) {
      nav.classList.toggle("is-compact", shouldCompact);
      lastState = shouldCompact;
    }
  }

  // Passive scroll listener for performance
  window.addEventListener("scroll", update, { passive: true });

  // Re-evaluate on resize / orientation change
  window.addEventListener("resize", update, { passive: true });

  // Initial state
  update();
})();
