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
