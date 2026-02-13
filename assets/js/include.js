/* include.js
   Static HTML includes for header/footer + global trust bar (below hero)

   FIX: scripts inside included HTML DO NOT run when injected via outerHTML/innerHTML.
   This version executes scripts that arrive via includes (inline + external),
   while avoiding double-running the same script element.
*/

(async function () {
  // Execute scripts inside a root element by replacing each <script> with a fresh one
  // (this is what triggers execution in the browser).
  function runScripts(root) {
    const scripts = Array.from(root.querySelectorAll("script"));

    scripts.forEach((oldScript) => {
      // Prevent re-running the exact same script node more than once
      if (oldScript.dataset && oldScript.dataset.includedRan === "1") return;

      const s = document.createElement("script");

      // copy attributes (src, type, defer, etc.)
      for (const attr of Array.from(oldScript.attributes)) {
        s.setAttribute(attr.name, attr.value);
      }

      // mark new script so if something scans again, we don't re-run it
      s.dataset.includedRan = "1";

      // Inline script content
      if (!oldScript.src) {
        s.textContent = oldScript.textContent || "";
      }

      // Replace triggers execution
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

      // Parse HTML into a fragment so scripts are discoverable
      const wrap = document.createElement("div");
      wrap.className = "include-root";
      wrap.innerHTML = html;

      // Replace placeholder with included nodes
      const frag = document.createDocumentFragment();
      while (wrap.firstChild) frag.appendChild(wrap.firstChild);
      placeholder.replaceWith(frag);

      // Immediately run any scripts that just arrived
      // (important for partials like your marquee)
      runScripts(document);
    } catch (err) {
      console.error(err);
      placeholder.outerHTML = "<!-- include failed: " + url + " -->";
    }
  }

  // 2) Let the DOM settle
  await new Promise((r) => setTimeout(r, 0));

  // 2.5) Back-compat: run ONLY scripts explicitly marked
  // (safe if you have any lingering partials using this attribute)
  const includeScripts = document.querySelectorAll('script[data-run-on-include="true"]');
  includeScripts.forEach((oldScript) => {
    if (oldScript.dataset && oldScript.dataset.includedRan === "1") return;

    const s = document.createElement("script");
    for (const attr of Array.from(oldScript.attributes)) s.setAttribute(attr.name, attr.value);

    // prevent infinite loops if the same HTML is included again
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

  // 4) Inject trust bar BELOW HERO IMAGE
  try {
    // Don’t add if page already has one (home page does)
    if (document.querySelector(".trustbar.trust-strip")) return;

    const res = await fetch("/partials/trustbar.html", { cache: "no-cache" });
    if (!res.ok) return;

    const html = (await res.text()).trim();
    if (!html) return;

    const tmp = document.createElement("div");
    tmp.innerHTML = html;

    const trustbar = tmp.firstElementChild;
    if (!trustbar) return;

    const hero = document.querySelector(".hero2");
    if (hero) {
      hero.insertAdjacentElement("afterend", trustbar);
      // Trustbar partial may contain scripts too
      runScripts(document);
      return;
    }

    const header = document.querySelector(".header, header");
    if (header) {
      header.insertAdjacentElement("afterend", trustbar);
      runScripts(document);
      return;
    }

    document.body.insertAdjacentElement("afterbegin", trustbar);
    runScripts(document);
  } catch (e) {
    // fail silently
  }
})();
