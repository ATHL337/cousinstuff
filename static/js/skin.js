(function(){
  const storageKey = "cousinstuff-skin";
  const root = document.documentElement;

  const btns = () => ([
    document.getElementById("skinToggleTop"),
    document.getElementById("skinToggleBottom"),
  ].filter(Boolean));

  function apply(skin){
    if (!skin || skin === "corp") root.setAttribute("data-skin", "corp");
    else root.setAttribute("data-skin", "pip");
    syncLabels();
  }

  function current(){
    const s = root.getAttribute("data-skin");
    return (s === "pip") ? "pip" : "corp";
  }

  function syncLabels(){
    const isPip = current() === "pip";
    btns().forEach(b => { b.textContent = isPip ? "Corporate" : "Pip-Boy"; });
  }

  const saved = localStorage.getItem(storageKey);
  apply(saved || "corp");

  window.addEventListener("DOMContentLoaded", () => {
    btns().forEach(b => {
      b.addEventListener("click", () => {
        const next = current() === "pip" ? "corp" : "pip";
        localStorage.setItem(storageKey, next);
        apply(next);
      });
    });
    syncLabels();
  });
})();
