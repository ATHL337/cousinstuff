(() => {
  const INDEX_URL = "/recipes/index.json";
  const INPUT_ID = "searchInput";
  const LIST_ID = "recipeList";
  const DEBOUNCE_MS = 120;

  let indexCache = null;
  let debounceTimer = null;

  function normalize(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  async function loadIndex() {
    if (indexCache) return indexCache;

    const res = await fetch(INDEX_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load recipe index");

    indexCache = await res.json();
    return indexCache;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderList(items) {
    const list = document.getElementById(LIST_ID);
    if (!list) return;

    list.innerHTML = "";

    if (!items.length) {
      list.innerHTML = `
        <div class="card" role="status" aria-live="polite">
          No matches. Try a different search.
        </div>`;
      return;
    }

    const frag = document.createDocumentFragment();

    items.forEach((r) => {
      const card = document.createElement("div");
      card.className = "card";

	card.innerHTML = `
	  <a class="vt-card__link" href="${escapeHtml(r.permalink)}">
		<h3 class="vt-card__title">${escapeHtml(r.title)}</h3>
	  </a>
	  ${r.description ? `<p class="vt-card__subtitle">${escapeHtml(r.description)}</p>` : ""}
	  ${r.tags && r.tags.length ? `<p class="vt-card__meta">${escapeHtml(r.tags.join(", "))}</p>` : ""}
	`;


      frag.appendChild(card);
    });

    list.appendChild(frag);
  }

  function filterIndex(index, query) {
    const q = normalize(query).trim();
    if (!q) return index;

    const parts = q.split(/\s+/);

    return index.filter((r) => {
      const hay =
        normalize(r.title) +
        " " +
        normalize(r.description) +
        " " +
        normalize((r.tags || []).join(" "));

      return parts.every((p) => hay.includes(p));
    });
  }

  function debounce(fn, delay) {
    return (...args) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => fn(...args), delay);
    };
  }

  async function setupSearch() {
    const input = document.getElementById(INPUT_ID);
    const list = document.getElementById(LIST_ID);

    // Not on a search page → silently exit
    if (!input || !list) return;

    const index = await loadIndex();
    renderList(index);

    const onInput = debounce(() => {
      const filtered = filterIndex(index, input.value);
      renderList(filtered);
    }, DEBOUNCE_MS);

    input.addEventListener("input", onInput, { passive: true });
  }

  window.addEventListener("DOMContentLoaded", () => {
    setupSearch().catch((err) => {
      const list = document.getElementById(LIST_ID);
      if (list) {
        list.innerHTML = `
          <div class="card" role="alert">
            Search failed to initialize: ${escapeHtml(err.message)}
          </div>`;
      }
      console.error(err);
    });
  });
})();
