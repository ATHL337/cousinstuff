(() => {
  "use strict";
  const indexUrl = "/recipes/index.json";
  const input = document.getElementById("searchInput");
  const list = document.getElementById("recipeList");
  const category = document.getElementById("categoryFilter");
  const time = document.getElementById("timeFilter");
  const sort = document.getElementById("sortFilter");
  const clear = document.getElementById("clearRecipeFilters");
  const count = document.getElementById("recipeCount");
  if (!input || !list || !category || !time || !sort || !clear || !count) return;

  let recipes = [];
  const normalize = v => String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const totalMinutes = iso => {
    if (!iso) return null;
    const m = /^P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i.exec(iso);
    if (!m) return null;
    return Number(m[1] || 0) * 60 + Number(m[2] || 0) + Math.ceil(Number(m[3] || 0) / 60);
  };
  const timeLabel = iso => {
    const min = totalMinutes(iso);
    if (min === null) return "";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h ? (h + " hr" + (m ? " " + m + " min" : "")) : min + " min";
  };
  const element = (tag, className, content) => {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (content !== undefined) e.textContent = String(content);
    return e;
  };
  const safeRecipeHref = href => /^\/recipes\/[a-z0-9/_-]+\/?$/i.test(href || "") ? href : "/recipes/";
  const safeImageHref = href => /^\/img\/recipes\/[a-z0-9._/-]+$/i.test(href || "") ? href : "/img/recipes/default.png";

  function render(items) {
    list.replaceChildren();
    count.textContent = items.length + " of " + recipes.length + " recipes";
    if (!items.length) {
      list.append(element("p", "card recipes-directory__empty", "No recipes match those filters. Try clearing a filter or searching another ingredient."));
      return;
    }
    const fragment = document.createDocumentFragment();
    for (const r of items) {
      const article = element("article", "recipe-tile");
      const a = element("a", "recipe-tile__link");
      a.href = safeRecipeHref(r.permalink);
      const img = element("img", "recipe-tile__photo");
      img.src = safeImageHref(r.image);
      img.alt = "Photo or illustration for " + r.title;
      img.loading = "lazy";
      img.decoding = "async";
      img.addEventListener("error", () => {
        if (!img.src.endsWith("/img/recipes/default.png")) img.src = "/img/recipes/default.png";
      }, { once: true });
      a.append(img);
      const body = element("div", "recipe-tile__content");
      const type = element("p", "recipe-tile__category", r.category || "Other");
      const title = element("h2", "recipe-tile__title", r.title);
      const desc = element("p", "recipe-tile__desc", r.description || "A CousinStuff family recipe.");
      const meta = element("p", "recipe-tile__meta");
      if (r.totalTime) meta.append(element("span", "", timeLabel(r.totalTime)));
      if (r.servings) meta.append(element("span", "", r.servings + " servings"));
      if (r.slot) meta.append(element("span", "", "VT-" + String(r.slot).padStart(2, "0")));
      body.append(type, title, desc, meta);
      a.append(body);
      article.append(a);
      fragment.append(article);
    }
    list.append(fragment);
  }
  function apply() {
    const terms = normalize(input.value).trim().split(/\s+/).filter(Boolean);
    const max = time.value ? Number(time.value) : null;
    const filtered = recipes.filter(r => {
      if (category.value && r.category !== category.value) return false;
      const mins = totalMinutes(r.totalTime);
      if (max !== null && (mins === null || mins > max)) return false;
      const hay = normalize([r.title, r.description, r.category, r.collection, ...(r.tags || [])].join(" "));
      return terms.every(t => hay.includes(t));
    });
    filtered.sort((a, b) => {
      if (sort.value === "recent") return String(b.date || "").localeCompare(String(a.date || "")) || a.title.localeCompare(b.title);
      if (sort.value === "quick") return (totalMinutes(a.totalTime) ?? Infinity) - (totalMinutes(b.totalTime) ?? Infinity) || a.title.localeCompare(b.title);
      return a.title.localeCompare(b.title);
    });
    render(filtered);
  }
  for (const field of [input, category, time, sort]) field.addEventListener(field === input ? "input" : "change", apply);
  clear.addEventListener("click", () => { input.value = ""; category.value = ""; time.value = ""; sort.value = "title"; apply(); input.focus(); });

  fetch(indexUrl).then(r => {
    if (!r.ok) throw new Error("Could not load the recipe directory");
    return r.json();
  }).then(data => {
    if (!Array.isArray(data)) throw new Error("Invalid recipe directory");
    recipes = data;
    const categories = [...new Set(recipes.map(r => r.category || "Other"))].sort((a, b) => a.localeCompare(b));
    categories.forEach(c => { const option = element("option", "", c); option.value = c; category.append(option); });
    apply();
  }).catch(() => {
    count.textContent = "Recipe directory unavailable";
    list.append(element("p", "card", "Could not load the cookbook. Please refresh the page or visit the Vault Registry."));
  });
})();