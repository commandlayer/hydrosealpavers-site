/* nav-dropdowns.js — HydroSeal dropdown nav (desktop hover + mobile tap)
   - Parents are <button.nav-parent>
   - Mobile dropdown becomes FIXED panel under the header (prevents clipping)
   - SAFE to call initNavDropdowns() multiple times (includes)
*/
(function () {
  function isMobile() {
    return window.matchMedia("(max-width: 980px)").matches;
  }

  function closeAll(groups, except) {
    groups.forEach((g) => {
      if (g !== except) g.classList.remove("open");
      const p = g.querySelector(".nav-parent");
      if (p) p.setAttribute("aria-expanded", g.classList.contains("open") ? "true" : "false");
      if (g !== except) clearMobileDropdownPosition(g);
    });
  }

  function positionMobileDropdown(group) {
    if (!isMobile()) return;

    const header = document.querySelector(".header");
    const dd = group.querySelector(".dropdown");
    if (!header || !dd) return;

    const rect = header.getBoundingClientRect();
    const top = Math.round(rect.bottom + 8);

    dd.style.position = "fixed";
    dd.style.left = "12px";
    dd.style.right = "12px";
    dd.style.top = top + "px";
    dd.style.width = "auto";
    dd.style.maxWidth = "none";
    dd.style.zIndex = "10001";
  }

  function clearMobileDropdownPosition(group) {
    const dd = group.querySelector(".dropdown");
    if (!dd) return;
    dd.style.position = "";
    dd.style.left = "";
    dd.style.right = "";
    dd.style.top = "";
    dd.style.width = "";
    dd.style.maxWidth = "";
    dd.style.zIndex = "";
  }

  function initNavDropdowns() {
    const groups = Array.from(document.querySelectorAll(".nav-group"));
    if (!groups.length) return;

    // Bind once PER BUTTON
    groups.forEach((group) => {
      const parent = group.querySelector(".nav-parent");
      const dropdown = group.querySelector(".dropdown");
      if (!parent || !dropdown) return;

      if (!parent.dataset.bound) {
        parent.dataset.bound = "1";
        parent.setAttribute("aria-haspopup", "true");
        parent.setAttribute("aria-expanded", "false");

        // Use pointerdown for better mobile reliability
        parent.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const wasOpen = group.classList.contains("open");
          closeAll(groups, null);

          if (wasOpen) {
            group.classList.remove("open");
            parent.setAttribute("aria-expanded", "false");
            clearMobileDropdownPosition(group);
          } else {
            group.classList.add("open");
            parent.setAttribute("aria-expanded", "true");
            positionMobileDropdown(group);
          }
        });
      }

      // prevent dropdown clicks from closing
      if (!dropdown.dataset.bound) {
        dropdown.dataset.bound = "1";
        dropdown.addEventListener("pointerdown", (e) => e.stopPropagation());
      }
    });

    // Bind outside-close ONCE globally
    if (!document.body.dataset.navOutsideBound) {
      document.body.dataset.navOutsideBound = "1";

      document.addEventListener("pointerdown", (e) => {
        // If the click is inside the header/nav, don’t close.
        if (e.target.closest(".header")) return;
        groups.forEach(clearMobileDropdownPosition);
        closeAll(groups, null);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          groups.forEach(clearMobileDropdownPosition);
          closeAll(groups, null);
        }
      });

      window.addEventListener("resize", () => {
        groups.forEach((g) => {
          if (g.classList.contains("open")) {
            if (isMobile()) positionMobileDropdown(g);
            else clearMobileDropdownPosition(g);
          }
        });
      });
    }
  }

  // Expose for include.js hook
  window.initNavDropdowns = initNavDropdowns;

  // Init now if header already exists
  initNavDropdowns();

  // Also init after includes
  document.addEventListener("includes:ready", initNavDropdowns);
})();
