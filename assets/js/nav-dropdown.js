/* HydroSeal dropdown nav
   - caret toggles dropdown
   - outside click closes
   - Esc closes
*/
(function () {
  const groups = document.querySelectorAll(".nav-group");
  if (!groups.length) return;

  const closeAll = () => groups.forEach(g => g.classList.remove("open"));

  groups.forEach(g => {
    const trigger = g.querySelector(".nav-trigger");
    if (!trigger) return;

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = g.classList.contains("open");
      closeAll();
      if (!isOpen) g.classList.add("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-group")) closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
})();
