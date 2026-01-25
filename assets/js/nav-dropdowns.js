// /assets/js/nav-dropdowns.js
(function () {
  const groups = Array.from(document.querySelectorAll(".nav-group"));
  if (!groups.length) return;

  function closeAll(except = null) {
    groups.forEach(g => {
      if (except && g === except) return;
      g.classList.remove("open");
      const btn = g.querySelector(".nav-parent");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  groups.forEach(g => {
    const btn = g.querySelector(".nav-parent");
    const dd = g.querySelector(".dropdown");
    if (!btn || !dd) return;

    // Button toggles dropdown
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const willOpen = !g.classList.contains("open");
      closeAll(g);
      g.classList.toggle("open", willOpen);
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    });

    // Prevent taps inside dropdown from closing before link click
    dd.addEventListener("click", (e) => e.stopPropagation());
  });

  // Tap outside closes
  document.addEventListener("click", () => closeAll());

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  // On resize up to desktop, clear open states (hover will handle)
  window.addEventListener("resize", () => {
    if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) closeAll();
  });
})();
