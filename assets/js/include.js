/* Static HTML includes for header/footer */
(async function(){
  const nodes = document.querySelectorAll("[data-include]");
  for (const el of nodes){
    const url = el.getAttribute("data-include");
    try{
      const res = await fetch(url, { cache:"no-cache" });
      if(!res.ok) throw new Error("Fetch failed: " + url);
      const html = await res.text();
      el.outerHTML = html;
    }catch(err){
      console.error(err);
      el.outerHTML = "<!-- include failed: " + url + " -->";
    }
  }
})();

/* After includes load, set footer year if present */
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  }, 50);
});
// ---- GLOBAL TRUST STRIP INJECTOR
(async () => {
  try {
    const res = await fetch("/partials/trust-strip.html", { cache: "no-cache" });
    if (!res.ok) return;
    const html = await res.text();

    // Put it right under the first H1 on the page (best universal placement)
    const h1 = document.querySelector("main h1, .hero2 h1, h1");
    if (!h1) return;

    // Avoid duplicates
    if (document.querySelector(".trust-strip")) return;

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
