/* nav-dropdowns.js — HydroSeal dropdown nav (mobile-first, no tap flake) */
(function () {
  if (window.__HYDROSEAL_NAV_INIT__) return;
  window.__HYDROSEAL_NAV_INIT__ = true;

  function initNavDropdowns() {
    const groups = Array.from(document.querySelectorAll(".nav-group"));
    if (!groups.length) return;

    const closeAll = (except) => {
      groups.forEach((g) => {
        if (g !== except) {
          g.classList.remove("open");
          const p = g.querySelector(".nav-parent");
          if (p) p.setAttribute("aria-expanded", "false");
        }
      });
    };

    groups.forEach((group) => {
      const parent = group.querySelector(".nav-parent");
      const dropdown = group.querySelector(".dropdown");
      if (!parent || !dropdown) return;

      // Toggle open on pointer/touch reliably
      const toggle = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = group.classList.contains("open");
        closeAll(group);

        group.classList.toggle("open", !isOpen);
        parent.setAttribute("aria-expanded", String(!isOpen));
      };

      // Use pointerdown (best for mobile), fallback to click
      parent.addEventListener("pointerdown", toggle, { passive: false });
      parent.addEventListener("click", toggle);

      dropdown.addEventListener("pointerdown", (e) => e.stopPropagation());
      dropdown.addEventListener("click", (e) => e.stopPropagation());
    });

    // Click/tap outside closes
    document.addEventListener("pointerdown", () => closeAll(null));
    document.addEventListener("click", () => closeAll(null));

    // ESC closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll(null);
    });
  }

  if (document.querySelector(".header .nav-group")) initNavDropdowns();
  document.addEventListener("includes:ready", initNavDropdowns, { once: true });
})();
