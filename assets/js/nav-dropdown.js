/* Dropdown nav: click/tap support + close on outside click */
(function () {
  const groups = document.querySelectorAll(".nav-group");
  if (!groups.length) return;

  const closeAll = () => groups.forEach(g => g.classList.remove("open"));

  groups.forEach(g => {
    const link = g.querySelector(".nav-link");
    if (!link) return;

    link.addEventListener("click", (e) => {
      const hasDropdown = !!g.querySelector(".dropdown");
      if (!hasDropdown) return;

      // First click opens; second click navigates
      if (!g.classList.contains("open")) {
        e.preventDefault();
        closeAll();
        g.classList.add("open");
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-group")) closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
})();
