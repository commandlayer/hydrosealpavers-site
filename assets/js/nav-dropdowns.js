/* nav-dropdowns.js — HydroSeal dropdown nav (mobile tap support)
   - Parent items do NOT navigate
   - Tap parent toggles dropdown
   - Tap outside closes
*/

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
          const p = g.querySelector(".nav-parent");
          if (p) p.setAttribute("aria-expanded", "false");
        }
      });
    };

    groups.forEach((g) => {
      const parent = g.querySelector(".nav-parent");
      const dropdown = g.querySelector(".dropdown");
      if (!parent || !dropdown) return;

      parent.setAttribute("aria-haspopup", "true");
      parent.setAttribute("aria-expanded", "false");

      parent.addEventListener("click", (e) => {
        // parents should never navigate
        e.preventDefault();
        e.stopPropagation();

        const isOpen = g.classList.contains("open");
        closeAll(g);
        g.classList.toggle("open", !isOpen);
        parent.setAttribute("aria-expanded", String(!isOpen));
      });

      dropdown.addEventListener("click", (e) => e.stopPropagation());
    });

    document.addEventListener("click", () => closeAll(null));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll(null);
    });
  }

  // if header already injected
  if (document.querySelector(".nav-group")) init();
  // else wait for include.js
  document.addEventListener("includes:ready", init, { once: true });
})();
