(() => {
  const filters = Array.from(document.querySelectorAll(".vt-filter[data-filter]"));
  const sections = Array.from(document.querySelectorAll(".vt-section[data-category]"));
  const randomTop = document.getElementById("vt-random");
  const randomBottom = document.getElementById("vt-random-bottom");

  const setActive = (key) => {
    filters.forEach(b => b.classList.toggle("is-active", b.dataset.filter === key));

    if (key === "all") {
      sections.forEach(s => (s.style.display = ""));
      return;
    }
    sections.forEach(s => {
      s.style.display = (s.dataset.category === key) ? "" : "none";
    });

    const target = document.getElementById(key);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  filters.forEach(btn => {
    btn.addEventListener("click", () => setActive(btn.dataset.filter));
  });

  const goRandom = () => {
    const links = Array.from(document.querySelectorAll(".vt-card__link"));
    if (!links.length) return;
    const pick = links[Math.floor(Math.random() * links.length)];
    window.location.href = pick.getAttribute("href");
  };

  if (randomTop) randomTop.addEventListener("click", goRandom);
  if (randomBottom) randomBottom.addEventListener("click", goRandom);
})();


  const scrollToSection = (key) => {
    if (key === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.getElementById(key);
    if (!target) return;

    const offset = getStickyOffset();
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const setUrlState = (key, { replace = false } = {}) => {
    const url = new URL(window.location.href);

    if (key === "all") {
      url.searchParams.delete(FILTER_PARAM);
      // Keep hash clean for "all"
      url.hash = "";
    } else {
      url.searchParams.set(FILTER_PARAM, key);
      url.hash = `#${key}`;
    }

    if (replace) {
      window.history.replaceState({}, "", url.toString());
    } else {
      window.history.pushState({}, "", url.toString());
    }
  };

  const applyFilter = (key, { syncUrl = true, scroll = true, replaceUrl = false } = {}) => {
    const normalized = (key || "all").toLowerCase();

    // Guard against invalid keys
    const valid = new Set(["all", ...sections.map(s => s.dataset.category)]);
    const finalKey = valid.has(normalized) ? normalized : "all";

    setPressedState(finalKey);
    showSections(finalKey);

    if (syncUrl) setUrlState(finalKey, { replace: replaceUrl });
    if (scroll) scrollToSection(finalKey);
  };

  // Click handlers
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyFilter(btn.dataset.filter, { syncUrl: true, scroll: true, replaceUrl: false });
    });
  });

  // Random ration: prefer visible cards (matches active filter)
  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      const visibleLinks = Array.from(document.querySelectorAll(".vt-card__link"))
        .filter((a) => {
          const card = a.closest(".vt-card");
          if (!card) return false;
          // If any ancestor section is display:none, skip it
          const section = a.closest(".vt-section");
          if (section && section.style.display === "none") return false;
          return true;
        });

      if (!visibleLinks.length) return;

      const pick = visibleLinks[Math.floor(Math.random() * visibleLinks.length)];
      const href = pick.getAttribute("href");
      if (href) window.location.href = href;
    });
  }

  // Initial state: honor ?filter=... then #hash
  const boot = () => {
    const url = new URL(window.location.href);

    const qp = url.searchParams.get(FILTER_PARAM);
    const hash = (url.hash || "").replace("#", "");

    const initial = (qp || hash || "all").toLowerCase();

    // Apply without jumping immediately; then optional scroll if a category was explicitly selected.
    const shouldScroll = initial !== "all";
    applyFilter(initial, { syncUrl: true, scroll: shouldScroll, replaceUrl: true });
  };

  // Handle back/forward navigation
  window.addEventListener("popstate", () => {
    const url = new URL(window.location.href);
    const qp = url.searchParams.get(FILTER_PARAM);
    const hash = (url.hash || "").replace("#", "");
    const key = (qp || hash || "all").toLowerCase();
    applyFilter(key, { syncUrl: false, scroll: false, replaceUrl: true });
  });

  boot();
})();
