/* Static HTML includes for header/footer + global trust bar (below hero) */
(async function () {
  // 1) Load includes
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

  // 2) Let the DOM settle
  await new Promise((r) => setTimeout(r, 0));

  // ✅ 2.5) Execute <script> tags that arrived via includes
  // Because setting outerHTML/innerHTML does NOT run scripts
  (function runIncludedScripts() {
    const scripts = document.querySelectorAll("script[data-include-run], [data-include] script, .include-root script");
    // Fallback: just scan all scripts and only re-run ones inside typical include areas
    // If you don’t have those wrappers, we’ll also safely re-run any inline scripts
    // that have a data-run-on-include attribute.
  })();

  // Better: re-run ONLY scripts explicitly marked for include execution
  const includeScripts = document.querySelectorAll('script[data-run-on-include="true"]');
  includeScripts.forEach((oldScript) => {
    const s = document.createElement("script");
    for (const attr of oldScript.attributes) s.setAttribute(attr.name, attr.value);

    // prevent infinite loop if this file is included again
    s.removeAttribute("data-run-on-include");

    if (oldScript.src) {
      s.src = oldScript.src;
    } else {
      s.textContent = oldScript.textContent;
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
      return;
    }

    const header = document.querySelector(".header, header");
    if (header) {
      header.insertAdjacentElement("afterend", trustbar);
      return;
    }

    document.body.insertAdjacentElement("afterbegin", trustbar);
  } catch (e) {
    // fail silently
  }
})();
