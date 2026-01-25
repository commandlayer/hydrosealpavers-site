/* Static HTML includes for header/footer + global trust strip (FULL-WIDTH, below hero) */
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
    // Avoid duplicates (match either the wrapper or the bar itself)
    if (document.querySelector(".trustbar.trust-strip, .trust-strip, .trustbar")) return;

    // NOTE: this partial should contain the FULL-WIDTH markup:
    // <div class="trustbar trust-strip"><div class="container">...</div></div>
    const res = await fetch("/partials/trustbar.html", { cache: "no-cache" });
    if (!res.ok) return;
    const html = (await res.text()).trim();
    if (!html) return;

    // Turn the partial into a real element
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const trustbar = tmp.firstElementChild;
    if (!trustbar) return;

    // 1) Ideal placement: immediately after the big hero section
    const hero = document.querySelector(".hero2");
    if (hero) {
      hero.insertAdjacentElement("afterend", trustbar);
      return;
    }

    // 2) Fallback: immediately after the header (if present)
    const header = document.querySelector(".header");
    if (header) {
      header.insertAdjacentElement("afterend", trustbar);
      return;
    }

    // 3) Last fallback: top of body
    document.body.insertAdjacentElement("afterbegin", trustbar);
  } catch (e) {
    // fail silently
  }
})();
