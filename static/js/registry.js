(() => {
  // Registry-only guard (safe to include site-wide)
  const filters = Array.from(document.querySelectorAll(".vt-filter[data-filter]"));
  const sections = Array.from(document.querySelectorAll(".vt-section[data-category]"));

  if (!filters.length || !sections.length) return;

  const FILTER_PARAM = "filter";

  // Support both possible Random buttons (top + bottom bar)
  const randomTop = document.getElementById("vt-random");
  const randomBottom = document.getElementById("vt-random-bottom");

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function normalizeKey(key) {
    const k = (key || "all").toString().toLowerCase();
    const valid = new Set(["all", ...sections.map((s) => (s.dataset.category || "").toLowerCase())]);
    return valid.has(k) ? k : "all";
  }

  function getStickyOffset() {
    // Sticky header height + breathing room so headings don't hide under the nav
    const nav = document.getElementById("siteNav");
    if (!nav) return 10;
    return Math.ceil(nav.getBoundingClientRect().height) + 10;
  }

  function setPressedState(activeKey) {
    filters.forEach((btn) => {
      const key = (btn.dataset.filter || "").toLowerCase();
      const isActive = key === activeKey;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function showSections(activeKey) {
    if (activeKey === "all") {
      sections.forEach((s) => (s.style.display = ""));
      return;
    }
    sections.forEach((s) => {
      const cat = (s.dataset.category || "").toLowerCase();
      s.style.display = cat === activeKey ? "" : "none";
    });
  }

  function scrollToSection(activeKey) {
    if (activeKey === "all") {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      return;
    }

    // Convention: section wrapper has id matching its category key
    const target = document.getElementById(activeKey);
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.pageYOffset - getStickyOffset();
    window.scrollTo({ top: y, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  function setUrlState(activeKey, { replace = false } = {}) {
    const url = new URL(window.location.href);

    if (activeKey === "all") {
      url.searchParams.delete(FILTER_PARAM);
      url.hash = "";
    } else {
      url.searchParams.set(FILTER_PARAM, activeKey);
      url.hash = `#${activeKey}`;
    }

    if (replace) window.history.replaceState({}, "", url.toString());
    else window.history.pushState({}, "", url.toString());
  }

  function applyFilter(key, { syncUrl = true, scroll = true, replaceUrl = false } = {}) {
    const activeKey = normalizeKey(key);

    setPressedState(activeKey);
    showSections(activeKey);

    if (syncUrl) setUrlState(activeKey, { replace: replaceUrl });
    if (scroll) scrollToSection(activeKey);
  }

  // Filter click handlers
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyFilter(btn.dataset.filter, { syncUrl: true, scroll: true, replaceUrl: false });
    });
  });

  // Random Ration: choose from VISIBLE cards only (respects active filter)
  function goRandom() {
    const visibleLinks = Array.from(document.querySelectorAll(".vt-card__link")).filter((a) => {
      const section = a.closest(".vt-section");
      if (!section) return false;
      return section.style.display !== "none";
    });

    if (!visibleLinks.length) return;

    const pick = visibleLinks[Math.floor(Math.random() * visibleLinks.length)];
    const href = pick.getAttribute("href");
    if (href) window.location.href = href;
  }

  if (randomTop) randomTop.addEventListener("click", goRandom);
  if (randomBottom) randomBottom.addEventListener("click", goRandom);

  // Initial state: honor ?filter=... then #hash
  function boot() {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get(FILTER_PARAM);
    const hash = (url.hash || "").replace("#", "");

    const initial = normalizeKey(qp || hash || "all");
    const shouldScroll = initial !== "all";

    // Replace so we don't clutter history on load
    applyFilter(initial, { syncUrl: true, scroll: shouldScroll, replaceUrl: true });
  }

  // Back/forward support
  window.addEventListener("popstate", () => {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get(FILTER_PARAM);
    const hash = (url.hash || "").replace("#", "");
    const key = normalizeKey(qp || hash || "all");

    // Don't re-push URL during popstate; don't auto-scroll either
    applyFilter(key, { syncUrl: false, scroll: false, replaceUrl: true });
  });

  boot();
})();
