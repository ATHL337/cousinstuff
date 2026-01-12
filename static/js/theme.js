(() => {
  const THEME_KEY = "cousinstuff-theme"; // light | dark
  const SKIN_KEY  = "cousinstuff-skin";  // corp | pip

  const root = document.documentElement;

  // Support toggles in either location
  const THEME_TOGGLE_IDS = ["themeToggle", "themeToggleBottom"];
  const SKIN_TOGGLE_IDS  = ["skinToggle", "skinToggleBottom"];

  function preferredTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function currentSkin() {
    return (root.getAttribute("data-skin") || "corp").toLowerCase();
  }

  function elsByIds(ids) {
    return ids.map((id) => document.getElementById(id)).filter(Boolean);
  }

  function applyTheme(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    syncLabels();
  }

  function applySkin(skin) {
    root.setAttribute("data-skin", skin === "pip" ? "pip" : "corp");
    syncLabels();
  }

  function syncLabels() {
    const theme = currentTheme();
    const skin  = currentSkin();

    const themeNext = theme === "dark" ? "Light mode" : "Dark mode";
    elsByIds(THEME_TOGGLE_IDS).forEach((el) => {
      el.textContent = themeNext;
      el.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
    });

    const skinNext = skin === "pip" ? "Corporate" : "Pip-Boy";
    elsByIds(SKIN_TOGGLE_IDS).forEach((el) => {
      el.textContent = skinNext;
      el.setAttribute(
        "aria-label",
        skin === "pip" ? "Switch to corporate skin" : "Switch to Pip-Boy skin"
      );
    });
  }

  function toggleTheme() {
    const next = currentTheme() === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  function toggleSkin() {
    const next = currentSkin() === "pip" ? "corp" : "pip";
    localStorage.setItem(SKIN_KEY, next);
    applySkin(next);
  }

  // Apply ASAP to prevent flash
  const savedTheme = localStorage.getItem(THEME_KEY);
  const savedSkin  = localStorage.getItem(SKIN_KEY);

  applyTheme(savedTheme || preferredTheme());
  applySkin(savedSkin || "corp");

  window.addEventListener("DOMContentLoaded", () => {
    elsByIds(THEME_TOGGLE_IDS).forEach((el) => el.addEventListener("click", toggleTheme));
    elsByIds(SKIN_TOGGLE_IDS).forEach((el) => el.addEventListener("click", toggleSkin));

    syncLabels();

    // Optional: follow OS theme only if user hasn't saved a theme
    if (window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        const hasSaved = localStorage.getItem(THEME_KEY);
        if (!hasSaved) applyTheme(preferredTheme());
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  });
})();
