/* Static HTML includes for header/footer + global trustbar (FAST + NO FLICKER) */
(async function () {
  // Add body classes so CSS can prevent header “pop-in” flicker
  document.body.classList.add("includes-loading");

  // ---- 1) Load includes (header/footer/etc.)
  const nodes = Array.from(document.querySelectorAll("[data-include]"));

  for (const el of nodes) {
    const url = el.getAttribute("data-include");
    try {
      // ✅ Faster: allow caching (no forced refetch on every page load)
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) throw new Error("Fetch failed: " + url);

      const html = (await res.text()).trim();
      if (!html) {
        el.outerHTML = `<!-- include empty: ${url} -->`;
        continue;
      }

      // ✅ Replace node safely (avoids weird reflow quirks vs outerHTML)
      const wrap = document.createElement("div");
      wrap.innerHTML = html;
      const node = wrap.firstElementChild;

      if (node) el.replaceWith(node);
      else el.outerHTML = `<!-- include parse failed: ${url} -->`;
    } catch (err) {
      console.error(err);
      el.outerHTML = `<!-- include failed: ${url} -->`;
    }
  }

  // ---- 2) Footer year
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // ---- 3) GLOBAL TRUST BAR INJECTOR (full-width, below hero image)
  try {
    // Avoid duplicates: if ANY trustbar already exists, do nothing
    if (!document.querySelector(".trustbar")) {
      const res = await fetch("/partials/trustbar.html", { cache: "force-cache" });
      if (res.ok) {
        const html = (await res.text()).trim();
        if (html) {
          const tmp = document.createElement("div");
          tmp.innerHTML = html;

          const trustbar = tmp.querySelector(".trustbar") || tmp.firstElementChild;
          if (trustbar) {
            // ---- CRITICAL FIXES ----
            trustbar.classList.remove("trust-strip");
            trustbar.removeAttribute("style");
            trustbar.style.display = "block";
            trustbar.style.width = "100%";

            // Ensure internal container exists
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
            } else {
              // Fallback: after header if present
              const header = document.querySelector(".header");
              if (header) header.insertAdjacentElement("afterend", trustbar);
              else document.body.insertAdjacentElement("afterbegin", trustbar);
            }
          }
        }
      }
    }
  } catch (e) {
    // fail silently
  }

  // ---- 4) Mark ready (lets CSS fade header in smoothly)
  document.body.classList.remove("includes-loading");
  document.body.classList.add("includes-ready");
})();
