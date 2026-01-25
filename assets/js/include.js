/* Static HTML includes for header/footer + global trust strip */
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

  // ---- 4) GLOBAL TRUST STRIP INJECTOR (BELOW HERO IMAGE, not in hero text)
  try {
    // Avoid duplicates
    if (document.querySelector(".trust-strip")) return;

    const res = await fetch("/partials/trust-strip.html", { cache: "no-cache" });
    if (!res.ok) return;
    const html = await res.text();

    // Turn the partial into a real element
    const tmp = document.createElement("div");
    tmp.innerHTML = html.trim();
    const strip = tmp.firstElementChild;
    if (!strip) return;

    // 1) Ideal placement: immediately after the big hero section
    const hero = document.querySelector(".hero2");
    if (hero) {
      hero.insertAdjacentElement("afterend", strip);
      return;
    }

    // 2) Fallback: immediately after the header (if present)
    const header = document.querySelector(".header");
    if (header) {
      header.insertAdjacentElement("afterend", strip);
      return;
    }

    // 3) Last fallback: top of body
    document.body.insertAdjacentElement("afterbegin", strip);
  } catch (e) {
    // fail silently
  }
})();
