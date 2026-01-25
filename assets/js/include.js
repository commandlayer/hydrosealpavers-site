/* include.js — Static HTML includes for header/footer + global trustbar (FAST + NO FLICKER)
   Drop this in: /assets/js/include.js
   Then REMOVE any other include scripts (only keep ONE).
*/
(async function () {
  // If this script accidentally gets loaded twice, bail.
  if (window.__HYDROSEAL_INCLUDES_INIT__) return;
  window.__HYDROSEAL_INCLUDES_INIT__ = true;

  // Optional: only keep these body classes if your CSS uses them.
  // If you removed the "hide header" CSS, these won’t matter (and that’s fine).
  document.body.classList.add("includes-loading");

  // ---- 1) Load includes in PARALLEL (faster than sequential for/await)
  const nodes = Array.from(document.querySelectorAll("[data-include]"));
  if (!nodes.length) {
    document.body.classList.remove("includes-loading");
    document.body.classList.add("includes-ready");
    return;
  }

  const results = await Promise.allSettled(
    nodes.map(async (el) => {
      const url = el.getAttribute("data-include");
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) throw new Error("Fetch failed: " + url);
      const html = (await res.text()).trim();
      return { el, url, html };
    })
  );

  for (const r of results) {
    if (r.status !== "fulfilled") continue;

    const { el, url, html } = r.value;
    if (!html) {
      el.outerHTML = `<!-- include empty: ${url} -->`;
      continue;
    }

    // Replace node safely (avoid outerHTML reflow weirdness)
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    const node = wrap.firstElementChild;

    if (node) el.replaceWith(node);
    else el.outerHTML = `<!-- include parse failed: ${url} -->`;
  }

  // ---- 2) Footer year
  const y = document.getElementById("y");
  if (y) y.textContent = new Date().getFullYear();

  // ---- 3) TRUSTBAR injector (ONLY if you are NOT already including it in header.html)
  // If you *are* including it in header.html, delete this entire section.
  try {
    if (!document.querySelector(".trustbar")) {
      const res = await fetch("/partials/trustbar.html", { cache: "force-cache" });
      if (res.ok) {
        const html = (await res.text()).trim();
        if (html) {
          const tmp = document.createElement("div");
          tmp.innerHTML = html;

          const trustbar = tmp.querySelector(".trustbar") || tmp.firstElementChild;
          if (trustbar) {
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

            const hero = document.querySelector(".hero2");
            if (hero) trustbar && hero.insertAdjacentElement("afterend", trustbar);
            else {
              const header = document.querySelector(".header");
              if (header) header.insertAdjacentElement("afterend", trustbar);
              else document.body.insertAdjacentElement("afterbegin", trustbar);
            }
          }
        }
      }
    }
  } catch (_) {
    // fail silently
  }

  // ---- 4) Mark ready
  document.body.classList.remove("includes-loading");
  document.body.classList.add("includes-ready");

  // ---- 5) Tell nav script "header is now in the DOM"
  document.dispatchEvent(new CustomEvent("includes:ready"));
})();
