(function () {
  const storageKey = "cousinstuff-theme";
  const root = document.documentElement;

  // Support multiple possible toggle IDs (top + bottom bar)
  const TOGGLE_IDS = ["themeToggle", "themeToggleBottom"];

  function apply(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    syncToggleLabels();
  }

  function preferred() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function toggles() {
    return TOGGLE_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean);
  }

  function setToggleLabel(el, theme) {
    // Keep it simple: text + aria-label stay accurate
    const next = theme === "dark" ? "Light mode" : "Dark mode";
    el.textContent = next;
    el.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  function syncToggleLabels() {
    const theme = currentTheme();
    toggles().forEach((el) => setToggleLabel(el, theme));
  }

  function toggleTheme() {
    const isDark = currentTheme() === "dark";
    const next = isDark ? "light" : "dark";
    localStorage.setItem(storageKey, next);
    apply(next);
  }

  // Apply initial theme ASAP (prevents flash)
  const saved = localStorage.getItem(storageKey);
  apply(saved || preferred());

  window.addEventListener("DOMContentLoaded", () => {
    // Bind click handlers to any toggles present
    toggles().forEach((el) => {
      el.addEventListener("click", toggleTheme);
    });

    // Keep labels correct on load
    syncToggleLabels();

    // Optional: react to OS theme changes when user hasn't chosen a theme
    // If you want "saved choice always wins", leave this as-is.
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        const hasSaved = localStorage.getItem(storageKey);
        if (!hasSaved) apply(preferred());
      };
      // Safari compatibility
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  });
})();
