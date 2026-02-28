/* include.js
   Static HTML includes loader (idempotent).
*/

(async function () {
  if (window.__HS_INCLUDES_RAN__) return;
  window.__HS_INCLUDES_RAN__ = true;

  document.body.classList.add("includes-loading");

  try {
    // Execute scripts inside a root element by replacing each <script> with a fresh one.
    function runScripts(root) {
      const scripts = Array.from(root.querySelectorAll("script"));

      scripts.forEach((oldScript) => {
        if (oldScript.dataset && oldScript.dataset.includedRan === "1") return;

        const s = document.createElement("script");
        for (const attr of Array.from(oldScript.attributes)) {
          s.setAttribute(attr.name, attr.value);
        }

        s.dataset.includedRan = "1";

        if (!oldScript.src) {
          s.textContent = oldScript.textContent || "";
        }

        oldScript.replaceWith(s);
      });
    }

    // 1) Load includes
    const nodes = document.querySelectorAll("[data-include]");
    for (const placeholder of nodes) {
      const url = placeholder.getAttribute("data-include");
      try {
        const res = await fetch(url, { cache: "no-cache" });
        if (!res.ok) throw new Error("Fetch failed: " + url);

        const html = await res.text();

        const wrap = document.createElement("div");
        wrap.className = "include-root";
        wrap.innerHTML = html;

        // Run scripts only within newly included subtree.
        runScripts(wrap);

        const frag = document.createDocumentFragment();
        while (wrap.firstChild) frag.appendChild(wrap.firstChild);
        placeholder.replaceWith(frag);
      } catch (err) {
        console.error(err);
        placeholder.outerHTML = "<!-- include failed: " + url + " -->";
      }
    }

    await new Promise((r) => setTimeout(r, 0));

    // 2) Back-compat: run ONLY scripts explicitly marked
    const includeScripts = document.querySelectorAll('script[data-run-on-include="true"]');
    includeScripts.forEach((oldScript) => {
      if (oldScript.dataset && oldScript.dataset.includedRan === "1") return;

      const s = document.createElement("script");
      for (const attr of Array.from(oldScript.attributes)) s.setAttribute(attr.name, attr.value);

      s.removeAttribute("data-run-on-include");
      s.dataset.includedRan = "1";

      if (oldScript.src) {
        s.src = oldScript.src;
      } else {
        s.textContent = oldScript.textContent || "";
      }

      oldScript.replaceWith(s);
    });

    // 3) Footer year
    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();

    // 4) Insert trustbar UNDER HERO (global, single)
    try {
      // hard idempotency: if already in DOM, stop
      if (document.querySelector(".trustbar.trust-strip")) return;

      const res = await fetch("/partials/trustbar.html", { cache: "no-cache" });
      if (!res.ok) return;

      const html = (await res.text()).trim();
      if (!html) return;

      const tmp = document.createElement("div");
      tmp.innerHTML = html;

      const trustbar = tmp.firstElementChild;
      if (!trustbar) return;

      // Place under hero if hero exists
      const hero = document.querySelector(".hero2");
      if (hero) {
        hero.insertAdjacentElement("afterend", trustbar);
      } else {
        // Fallback: under header
        const header = document.querySelector(".header, header");
        if (header) {
          header.insertAdjacentElement("afterend", trustbar);
        } else {
          // Fallback: top of body
          document.body.insertAdjacentElement("afterbegin", trustbar);
        }
      }
    } catch (e) {
      // fail silently
    }
  } finally {
    document.body.classList.remove("includes-loading");
    document.body.classList.add("includes-ready");
    document.dispatchEvent(new Event("includes:ready"));
  }
})();
