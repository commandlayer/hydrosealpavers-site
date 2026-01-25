/* nav-hamburger.js — minimal hamburger toggle for your exact header markup */
(function () {
  function initHeaderHamburger() {
    const shell = document.querySelector(".nav-shell");
    const btn = document.querySelector(".nav-toggle");
    const overlay = document.querySelector(".nav-overlay");
    const nav = document.querySelector(".header-nav");
    if (!shell || !btn || !overlay || !nav) return;

    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";

    const setOpen = (open) => {
      shell.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      overlay.hidden = !open;
      document.documentElement.classList.toggle("nav-lock", open);
      document.body.classList.toggle("nav-lock", open);
    };

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      setOpen(!shell.classList.contains("open"));
    });

    overlay.addEventListener("click", () => setOpen(false));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    // Close menu when clicking any normal link
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) setOpen(false);
    });
  }

  initHeaderHamburger();
  document.addEventListener("includes:ready", initHeaderHamburger);
  window.initHeaderHamburger = initHeaderHamburger; // optional
})();
