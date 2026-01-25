/* nav-dropdowns.js — HydroSeal dropdown nav (FAST + mobile tap support)
   - Works with header injected via include.js
   - Parent items do NOT navigate (Paver Sealing / Commercial / Service Areas)
   - Tap toggles dropdown on mobile, click outside closes
*/

(function () {
  // Prevent double-init (common when scripts get included twice by mistake)
  if (window.__HYDROSEAL_NAV_INIT__) return;
  window.__HYDROSEAL_NAV_INIT__ = true;

  function initNavDropdowns() {
    const groups = Array.from(document.querySelectorAll(".nav-group"));
    if (!groups.length) return;

    const closeAll = (except) => {
      groups.forEach((g) => {
        if (g !== except) g.classList.remove("open");
      });
    };

    groups.forEach((group) => {
      const parent = group.querySelector(".nav-parent");
      const dropdown = group.querySelector(".dropdown");
      if (!parent || !dropdown) return;

      // Make parent act like a toggle (no navigation)
      parent.setAttribute("aria-haspopup", "true");
      parent.setAttribute("aria-expanded", "false");

      parent.addEventListener("click", (e) => {
        // Always prevent navigation for these parents (your request)
        e.preventDefault();
        e.stopPropagation();

        const isOpen = group.classList.contains("open");
        closeAll(group);
        group.classList.toggle("open", !isOpen);
        parent.setAttribute("aria-expanded", String(!isOpen));
      });

      // Stop clicks inside dropdown from bubbling up and closing instantly
      dropdown.addEventListener("click", (e) => e.stopPropagation());
    });

    // Click outside closes
    document.addEventListener("click", () => closeAll(null));

    // ESC closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll(null);
    });
  }

  // If header is already present, init now
  if (document.querySelector(".header .nav-group")) {
    initNavDropdowns();
  }

  // Otherwise wait until include.js finishes injecting header/footer
  document.addEventListener("includes:ready", initNavDropdowns, { once: true });
})();
