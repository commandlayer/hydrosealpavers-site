/* Static HTML includes for header/footer + global trustbar (FULL-WIDTH, below hero) */
(async function () {
  // ---- 1) Load includes (header/footer/etc.)
  const nodes = document.querySelectorAll("[data-include]");
  for (const el of nodes) {
    const url = el.getAttribute("data-include");
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error("Fetch failed: " + url);
      const html = await res.text();
      el.outerHTML = html;
    } catch (err) {
      console.error(err);
      el.outerHTML = "<!-- include failed: " + url + " -->";
    }
  }

  // ---- 2) Wait a tick so the new HTML is in the DOM
  await new Promise((r) => setTimeout(r, 0));

  // ---- 3) Footer year
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // ---- 4) GLOBAL TRUST BAR INJECTOR (full-width, below hero image)
  try {
    // Avoid duplicates: if ANY trustbar already exists, do nothing
    if (document.querySelector(".trustbar")) return;

    // Fetch partial (should contain a trustbar)
    const res = await fetch("/partials/trustbar.html", { cache: "no-cache" });
    if (!res.ok) return;
    const html = (await res.text()).trim();
    if (!html) return;

    // Parse partial into real node(s)
    const tmp = document.createElement("div");
    tmp.innerHTML = html;

    // Prefer the element that actually has .trustbar
    const trustbar = tmp.querySelector(".trustbar") || tmp.firstElementChild;
    if (!trustbar) return;

    // ---- CRITICAL FIXES ----
    // 1) Remove any wrapper class that could style it like one giant pill/oval
    trustbar.classList.remove("trust-strip");

    // 2) Remove inline styles that could force centering/oval effects
    trustbar.removeAttribute("style");

    // 3) Make sure it’s block-level and full width
    trustbar.style.display = "block";
    trustbar.style.width = "100%";

    // 4) Ensure the internal container exists; if not, wrap children
    // (prevents “all items in one blob” if partial markup is off)
    if (!trustbar.querySelector(".container")) {
      const inner = document.createElement("div");
      inner.className = "container";
      while (trustbar.firstChild) inner.appendChild(trustbar.firstChild);
      trustbar.appendChild(inner);
    }

    // Placement: immediately after hero if present
    const hero = document.querySelector(".hero2");
    if (hero) {
      hero.insertAdjacentElement("afterend", trustbar);
      return;
    }

    // Fallback: after header if present
    const header = document.querySelector(".header");
    if (header) {
      header.insertAdjacentElement("afterend", trustbar);
      return;
    }

    // Last fallback: top of body
    document.body.insertAdjacentElement("afterbegin", trustbar);
  } catch (e) {
    // fail silently
  }
})();
