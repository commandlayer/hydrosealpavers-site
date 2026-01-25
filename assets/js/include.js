/* include.js — FAST static includes (header/footer only) */
(async function () {
  if (window.__HYDROSEAL_INCLUDES_INIT__) return;
  window.__HYDROSEAL_INCLUDES_INIT__ = true;

  const nodes = Array.from(document.querySelectorAll("[data-include]"));
  if (!nodes.length) {
    document.dispatchEvent(new CustomEvent("includes:ready"));
    return;
  }

  try {
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

      const wrap = document.createElement("div");
      wrap.innerHTML = html;
      const node = wrap.firstElementChild;

      if (node) el.replaceWith(node);
      else el.outerHTML = `<!-- include parse failed: ${url} -->`;
    }

    // footer year (if footer exists)
    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  } catch (e) {
    // fail silently
  }

  document.dispatchEvent(new CustomEvent("includes:ready"));
})();
