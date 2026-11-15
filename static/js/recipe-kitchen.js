(() => {
  "use strict";
  // Progressive enhancement of BOTH structured and legacy Markdown ingredients.
  // Never rewrites recipe quantities or cookbook content.
  const container = document.getElementById("recipe-body");
  if (!container) return;
  const headings = [...container.querySelectorAll("h2")];
  const title = headings.find(h => /^ingredients(?:\s|$)/i.test(h.textContent.trim()));
  if (!title) return;
  const items = [];
  let node = title.nextElementSibling;
  while (node && node.tagName !== "H2") {
    if (node.matches("ul,ol")) items.push(...node.querySelectorAll(":scope > li"));
    if (node.tagName === "H3") {
      // Ingredient subsections may use their own lists before the next H2.
    }
    node = node.nextElementSibling;
  }
  if (!items.length) return;
  const ingredients = items.map(li => li.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
  const toolbar = document.createElement("div");
  toolbar.className = "recipe-kitchen-tools no-print";
  const progress = document.createElement("span");
  progress.className = "recipe-kitchen-progress";
  const copy = document.createElement("button");
  copy.className = "secondary";
  copy.type = "button";
  copy.textContent = "Copy shopping list";
  const update = () => {
    const done = toolbar.closest("#recipe-body").querySelectorAll(".recipe-ingredient-label input:checked").length;
    progress.textContent = done + " / " + items.length + " ingredients checked";
  };
  items.forEach(li => {
    const label = document.createElement("label");
    label.className = "recipe-ingredient-label";
    const check = document.createElement("input");
    check.type = "checkbox";
    check.setAttribute("aria-label", "Prepared " + li.textContent.replace(/\s+/g, " ").trim());
    check.addEventListener("change", update);
    label.append(check);
    while (li.firstChild) label.append(li.firstChild);
    li.append(label);
  });
  copy.addEventListener("click", async () => {
    const name = document.querySelector(".vt-placard-title")?.textContent.trim() || document.title;
    try {
      await navigator.clipboard.writeText(name + "\n\n" + ingredients.map(s => "- " + s).join("\n"));
      copy.textContent = "Copied!";
      copy.setAttribute("aria-live", "polite");
    } catch (_) {
      copy.textContent = "Copy unavailable";
    }
  });
  toolbar.append(copy, progress);
  title.after(toolbar);
  update();
})();