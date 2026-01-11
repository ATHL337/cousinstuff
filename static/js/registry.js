(() => {
  const filters = Array.from(document.querySelectorAll(".vt-filter[data-filter]"));
  const sections = Array.from(document.querySelectorAll(".vt-section[data-category]"));
  const randomBtn = document.getElementById("vt-random");

  const setActive = (key) => {
    filters.forEach(b => b.classList.toggle("is-active", b.dataset.filter === key));

    if (key === "all") {
      sections.forEach(s => (s.style.display = ""));
      return;
    }
    sections.forEach(s => {
      s.style.display = (s.dataset.category === key) ? "" : "none";
    });

    const target = document.getElementById(key);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  filters.forEach(btn => {
    btn.addEventListener("click", () => setActive(btn.dataset.filter));
  });

  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      const links = Array.from(document.querySelectorAll(".vt-card__link"));
      if (!links.length) return;
      const pick = links[Math.floor(Math.random() * links.length)];
      window.location.href = pick.getAttribute("href");
    });
  }
})();
