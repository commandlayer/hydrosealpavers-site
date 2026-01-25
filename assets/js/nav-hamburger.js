/* nav-hamburger.js — HydroSeal mobile hamburger + panel open/close */
(function () {
  function initHeaderNav() {
    const shell = document.querySelector(".nav-shell");
    const toggle = document.querySelector(".nav-toggle");
    const overlay = document.querySelector(".nav-overlay");
    const nav = document.querySelector(".header-nav");
    if (!shell || !toggle || !overlay || !nav) return;

    // prevent double-binding
    if (shell.dataset.hamburgerBound) return;
    shell.dataset.hamburgerBound = "1";

    const setOpen = (open) => {
      shell.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      overlay.hidden = !open;
      document.documentElement.classList.toggle("nav-lock", open);
      document.body.classList.toggle("nav-lock", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(!shell.classList.contains("open"));
    });

    overlay.addEventListener("click", () => setOpen(false));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    // Close when clicking a normal link inside the menu
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) setOpen(false);
    });
  }

  // Run now
  initHeaderNav();

  // Expose for include.js hook
  window.initHeaderNav = initHeaderNav;

  // Also init after includes
  document.addEventListener("includes:ready", initHeaderNav);
})();
