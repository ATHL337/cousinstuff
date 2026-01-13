(function() {
  const storageKey = "cousinstuff-theme";
  const root = document.documentElement;

  const btns = () => ([
    document.getElementById("themeToggleTop"),
    document.getElementById("themeToggleBottom"),
  ].filter(Boolean));

  function apply(theme) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    syncLabels();
  }

  function preferred() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function syncLabels(){
    const isDark = current() === "dark";
    btns().forEach(b => { b.textContent = isDark ? "Light mode" : "Dark mode"; });
  }

  const saved = localStorage.getItem(storageKey);
  apply(saved || preferred());

  window.addEventListener("DOMContentLoaded", () => {
    btns().forEach(b => {
      b.addEventListener("click", () => {
        const next = current() === "dark" ? "light" : "dark";
        localStorage.setItem(storageKey, next);
        apply(next);
      });
    });
    syncLabels();
  });
})();
