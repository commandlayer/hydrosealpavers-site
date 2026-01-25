/* Static HTML includes for header/footer + global trust strip */
(async function () {
  // ---- 1) Load includes
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

  // ---- 4) GLOBAL TRUST STRIP INJECTOR (runs AFTER includes)
  try {
    // Avoid duplicates
    if (document.querySelector(".trust-strip")) return;

    const res = await fetch("/partials/trust-strip.html", { cache: "no-cache" });
    if (!res.ok) return;
    const html = await res.text();

    // Best universal placement: right under the first H1
    const h1 = document.querySelector("main h1, .hero2 h1, h1");
    if (!h1) return;

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.justifyContent = "center";
    wrap.style.marginTop = "10px";
    wrap.innerHTML = html;

    h1.insertAdjacentElement("afterend", wrap);
  } catch (e) {
    // fail silently
  }
})();
