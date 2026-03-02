/* router.js - trustbar positioning helpers (SPA navigation disabled) */
(function () {
  function positionTrustbar() {
    const trustbar = document.querySelector(".trustbar");
    if (!trustbar) return;

    const slot = document.getElementById("trustbar-slot");
    const hero = document.querySelector(".hero2") || document.querySelector(".hero");
    const isMobile = window.matchMedia("(max-width: 980px)").matches;

    if (isMobile && hero) {
      hero.insertAdjacentElement("afterend", trustbar);
    } else if (slot) {
      slot.appendChild(trustbar);
    }
  }

  window.positionTrustbar = positionTrustbar;

  window.addEventListener("resize", () => {
    positionTrustbar();
  });

  window.addEventListener("orientationchange", () => {
    positionTrustbar();
  });

  positionTrustbar();
})();
