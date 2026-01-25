/* nav-dropdowns.js — HydroSeal dropdown nav (single source of truth) */
(function () {
  if (window.__HYDROSEAL_NAV_INIT__) return;
  window.__HYDROSEAL_NAV_INIT__ = true;

  function init() {
    const groups = Array.from(document.querySelectorAll(".nav-group"));
    if (!groups.length) return;

    const closeAll = (except) => {
      groups.forEach((g) => {
        if (g !== except) {
          g.classList.remove("open");
          const btn = g.querySelector(".nav-parent");
          if (btn) btn.setAttribute("aria-expanded", "false");
        }
      });
    };

    groups.forEach((g) => {
      const btn = g.querySelector(".nav-parent");
      const dropdown = g.querySelector(".dropdown");
      if (!btn || !dropdown) return;

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = g.classList.contains("open");
        closeAll(g);
        g.classList.toggle("open", !isOpen);
        btn.setAttribute("aria-expanded", String(!isOpen));
      });

      dropdown.addEventListener("click", (e) => e.stopPropagation());
    });

    document.addEventListener("click", () => closeAll(null));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll(null);
    });
  }

  if (document.querySelector(".nav-group .nav-parent")) init();
  document.addEventListener("includes:ready", init, { once: true });
})();
