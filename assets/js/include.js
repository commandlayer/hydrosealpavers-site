/* include.js
   Static HTML includes loader (idempotent).
*/

(async function () {
  if (window.__hs_includes_ran) return;
  window.__hs_includes_ran = true;

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

    // 1) Load includes in parallel, then replace placeholders in DOM order.
    const placeholders = Array.from(document.querySelectorAll("[data-include]"));
    const includeResults = await Promise.all(
      placeholders.map(async (placeholder) => {
        const url = placeholder.getAttribute("data-include");

        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Fetch failed: " + url);

          const html = await res.text();
          const wrap = document.createElement("div");
          wrap.className = "include-root";
          wrap.innerHTML = html;

          // Run scripts only within newly included subtree.
          runScripts(wrap);

          const frag = document.createDocumentFragment();
          while (wrap.firstChild) frag.appendChild(wrap.firstChild);

          return { placeholder, url, frag };
        } catch (err) {
          return { placeholder, url, err };
        }
      })
    );

    includeResults.forEach(({ placeholder, url, frag, err }) => {
      if (err) {
        console.error(err);
        placeholder.outerHTML = "<!-- include failed: " + url + " -->";
        return;
      }

      placeholder.replaceChildren();
      placeholder.appendChild(frag);
      placeholder.removeAttribute("data-include");
      placeholder.classList.add("is-loaded");
    });

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

    // 4) Insert trustbar into persistent shell slot (single)
    try {
      if (
        document.documentElement.hasAttribute("data-no-trustbar") ||
        document.body.hasAttribute("data-no-trustbar")
      ) {
        return;
      }

      // hard idempotency: if already in DOM, stop
      if (document.querySelector(".trustbar")) return;

      const slot = document.getElementById("trustbar-slot");
      if (!slot) return;

      if (document.body.classList.contains("page-home")) {
        const hero = document.querySelector(".home-hero-wrap .hero2, .hero2");
        if (hero && hero.nextElementSibling !== slot) {
          hero.insertAdjacentElement("afterend", slot);
        }
      }

      const res = await fetch("/partials/trustbar.html");
      if (!res.ok) return;

      const html = (await res.text()).trim();
      if (!html) return;

      const tmp = document.createElement("div");
      tmp.innerHTML = html;

      const trustbar = tmp.querySelector(".trustbar");
      if (!trustbar) return;

      slot.replaceChildren();
      slot.appendChild(trustbar);

      if (typeof window.positionTrustbar === "function") {
        window.positionTrustbar();
        requestAnimationFrame(() => {
          window.positionTrustbar();
        });
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
