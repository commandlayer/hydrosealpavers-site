/* Hardened dropdown nav */
(function () {
  const groups = document.querySelectorAll(".nav-group");
  if (!groups.length) return;

  const closeAll = () => groups.forEach(g => g.classList.remove("open"));

  groups.forEach(g => {
    const trigger = g.querySelector(".nav-trigger");
    const parent  = g.querySelector(".nav-parent");

    if (trigger) {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const open = g.classList.contains("open");
        closeAll();
        if (!open) g.classList.add("open");
      });
    }

    if (parent) {
      parent.addEventListener("click", () => closeAll()); // normal navigation
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-group")) closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
})();
