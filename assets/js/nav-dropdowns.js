/* HydroSeal nav dropdowns - click/tap support */
(function () {
  const groups = Array.from(document.querySelectorAll(".nav-group"));
  if (!groups.length) return;

  function closeAll(except) {
    groups.forEach(g => {
      if (g !== except) g.classList.remove("open");
    });
  }

  groups.forEach(group => {
    const trigger = group.querySelector(".nav-caret-btn");
    const dropdown = group.querySelector(".dropdown");
    if (!trigger || !dropdown) return;

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = group.classList.contains("open");
      closeAll(group);
      group.classList.toggle("open", !isOpen);
    });
  });

  document.addEventListener("click", (e) => {
    const inside = e.target.closest(".nav-group");
    if (!inside) closeAll(null);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll(null);
  });
})();
