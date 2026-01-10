(function() {
  const storageKey = "cousinstuff-theme";
  const root = document.documentElement;
  const btn = () => document.getElementById("themeToggle");

  function apply(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
  }

  function preferred() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  const saved = localStorage.getItem(storageKey);
  apply(saved || preferred());

  window.addEventListener("DOMContentLoaded", () => {
    const b = btn();
    if (!b) return;
    b.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      localStorage.setItem(storageKey, next);
      apply(next);
    });
  });
})();
