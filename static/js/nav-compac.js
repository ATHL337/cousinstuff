(() => {
  const nav = document.getElementById("siteNav");
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle("is-compact", window.scrollY > 40);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
