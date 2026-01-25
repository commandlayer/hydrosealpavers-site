/* nav-dropdowns.js — HydroSeal dropdown nav (desktop hover + mobile tap)
   - Parents are <button.nav-parent>
   - Mobile dropdown becomes FIXED panel under the header (prevents clipping)
*/
(function () {
  if (window.__HYDROSEAL_NAV_INIT__) return;
  window.__HYDROSEAL_NAV_INIT__ = true;

  function isMobile() {
    return window.matchMedia("(max-width: 980px)").matches;
  }

  function closeAll(groups, except) {
    groups.forEach((g) => {
      if (g !== except) g.classList.remove("open");
      const p = g.querySelector(".nav-parent");
      if (p) p.setAttribute("aria-expanded", g.classList.contains("open") ? "true" : "false");
    });
  }

  function positionMobileDropdown(group) {
    if (!isMobile()) return;

    const header = document.querySelector(".header");
    const dd = group.querySelector(".dropdown");
    if (!header || !dd) return;

    const rect = header.getBoundingClientRect();
    const top = Math.round(rect.bottom + 8);

    // Fixed panel under header (full width with margins)
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

    groups.forEach((group) => {
      const parent = group.querySelector(".nav-parent");
      const dropdown = group.querySelector(".dropdown");
      if (!parent || !dropdown) return;

      parent.setAttribute("aria-haspopup", "true");
      parent.setAttribute("aria-expanded", "false");

      // Use pointerdown for better mobile reliability than click
      parent.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const wasOpen = group.classList.contains("open");
        closeAll(groups, group);

        // toggle
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

      // prevent dropdown clicks from closing
      dropdown.addEventListener("pointerdown", (e) => e.stopPropagation());
    });

    // click/tap outside closes
    document.addEventListener("pointerdown", () => {
      groups.forEach(clearMobileDropdownPosition);
      closeAll(groups, null);
    });

    // ESC closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        groups.forEach(clearMobileDropdownPosition);
        closeAll(groups, null);
      }
    });

    // Reposition if you rotate/resize while open
    window.addEventListener("resize", () => {
      groups.forEach((g) => {
        if (g.classList.contains("open")) {
          if (isMobile()) positionMobileDropdown(g);
          else clearMobileDropdownPosition(g);
        }
      });
    });
  }

  // If header already exists, init now
  if (document.querySelector(".header .nav-group")) initNavDropdowns();

  // Otherwise wait for include.js
  document.addEventListener("includes:ready", initNavDropdowns, { once: true });
})();
