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
