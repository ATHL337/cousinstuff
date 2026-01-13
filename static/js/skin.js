(function () {
  const storageKey = "cousinstuff-skin";
  const root = document.documentElement;

  const btns = () =>
    [
      document.getElementById("skinToggleTop"),
      document.getElementById("skinToggleBottom"),
    ].filter(Boolean);

  function current() {
    const s = root.getAttribute("data-skin");
    return s === "pip" ? "pip" : "corp";
  }

  function apply(skin) {
    root.setAttribute("data-skin", skin === "pip" ? "pip" : "corp");
    syncLabels();
  }

  function syncLabels() {
    const isPip = current() === "pip";
    btns().forEach((b) => {
      b.textContent = isPip ? "Corporate" : "Pip-Boy";
      b.setAttribute("aria-pressed", isPip ? "true" : "false");
    });
  }

  const saved = localStorage.getItem(storageKey);
  apply(saved || "corp");

  window.addEventListener("DOMContentLoaded", () => {
    btns().forEach((b) => {
      b.addEventListener("click", () => {
        const next = current() === "pip" ? "corp" : "pip";
        localStorage.setItem(storageKey, next);
        apply(next);
      });
    });

    // If something changes data-skin externally, keep buttons correct.
    new MutationObserver(syncLabels).observe(root, {
      attributes: true,
      attributeFilter: ["data-skin"],
    });

    syncLabels();
  });
})();
