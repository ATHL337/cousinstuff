async function loadRecipeIndex() {
  const res = await fetch("/recipes/index.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load recipe index");
  return await res.json();
}

function normalize(s) {
  return (s || "").toString().toLowerCase();
}

function renderList(items) {
  const list = document.getElementById("recipeList");
  if (!list) return;
  list.innerHTML = "";
  if (!items.length) {
    list.innerHTML = '<div class="card">No matches. Try a different search.</div>';
    return;
  }
  for (const r of items) {
    const tags = (r.tags || []).map(t => `<a class="chip" href="/tags/${encodeURIComponent(t).toLowerCase()}/">${t}</a>`).join("");
    const meta = [
      r.servings ? `${r.servings} servings` : "",
      r.totalTime ? `Total: ${r.totalTime}` : "",
      r.prepTime ? `Prep: ${r.prepTime}` : ""
    ].filter(Boolean).join(" • ");

    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="grid" style="gap:8px;">
        <div>
          <div style="display:flex; align-items:baseline; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <a href="${r.permalink}" style="font-size:18px; font-weight:800;">${r.title}</a>
            <span class="meta">${meta}</span>
          </div>
          ${r.description ? `<div class="meta" style="margin-top:6px;">${r.description}</div>` : ""}
          ${tags ? `<div class="chips">${tags}</div>` : ""}
        </div>
      </div>
    `;
    list.appendChild(el);
  }
}

async function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  const all = await loadRecipeIndex();
  renderList(all);

  input.addEventListener("input", () => {
    const q = normalize(input.value).trim();
    if (!q) return renderList(all);

    const parts = q.split(/\s+/).filter(Boolean);
    const filtered = all.filter(r => {
      const hay = normalize(r.title) + " " + normalize(r.description) + " " + normalize((r.tags || []).join(" "));
      return parts.every(p => hay.includes(p));
    });

    renderList(filtered);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupSearch().catch(err => {
    const list = document.getElementById("recipeList");
    if (list) list.innerHTML = `<div class="card">Search failed to initialize: ${err.message}</div>`;
  });
});
