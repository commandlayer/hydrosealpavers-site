/* router.js - progressive-enhancement shell navigation (PJAX) */
(function () {
  const PAGE_SELECTOR = '#page[data-page]';
  let controller = null;
  let inFlightUrl = "";

  function runScripts(root) {
    const scripts = Array.from(root.querySelectorAll("script"));
    scripts.forEach((oldScript) => {
      const script = document.createElement("script");
      for (const attr of Array.from(oldScript.attributes)) {
        script.setAttribute(attr.name, attr.value);
      }
      if (!oldScript.src) {
        script.textContent = oldScript.textContent || "";
      }
      oldScript.replaceWith(script);
    });
  }

  function shouldInterceptClick(event) {
    if (event.defaultPrevented || event.button !== 0) return null;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;

    const anchor = event.target.closest("a[href]");
    if (!anchor) return null;

    const href = anchor.getAttribute("href") || "";
    if (!href || href.startsWith("#")) return null;
    if (anchor.hasAttribute("download")) return null;
    if ((anchor.getAttribute("target") || "").toLowerCase() === "_blank") return null;

    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return null;
    if (url.protocol === "mailto:" || url.protocol === "tel:") return null;

    const current = new URL(window.location.href);
    if (
      url.pathname === current.pathname &&
      url.search === current.search &&
      url.hash &&
      url.hash !== current.hash
    ) {
      return null;
    }

    return url;
  }

  function updateHead(nextDoc) {
    const nextTitle = nextDoc.querySelector("title");
    if (nextTitle) document.title = nextTitle.textContent || document.title;

    const currentMeta = document.querySelector('meta[name="description"]');
    const nextMeta = nextDoc.querySelector('meta[name="description"]');
    if (nextMeta) {
      if (currentMeta) {
        currentMeta.setAttribute("content", nextMeta.getAttribute("content") || "");
      } else {
        document.head.appendChild(nextMeta.cloneNode(true));
      }
    }
  }

  function scrollAfterNavigation(url) {
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      const target = document.getElementById(id) || document.querySelector(url.hash);
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }

  async function swapPage(url, options) {
    const { push } = options;
    const currentPage = document.querySelector(PAGE_SELECTOR);
    if (!currentPage) {
      window.location.href = url.href;
      return;
    }

    if (controller) controller.abort();
    controller = new AbortController();

    if (inFlightUrl === url.href) return;
    inFlightUrl = url.href;

    document.dispatchEvent(new CustomEvent("page:beforeload", { detail: { url: url.href } }));

    try {
      const response = await fetch(url.href, {
        method: "GET",
        credentials: "same-origin",
        signal: controller.signal,
        headers: {
          "X-Requested-With": "PJAX",
        },
      });

      if (!response.ok) throw new Error(`Navigation failed: ${response.status}`);

      const html = await response.text();
      const nextDoc = new DOMParser().parseFromString(html, "text/html");
      const nextPage = nextDoc.querySelector(PAGE_SELECTOR);
      if (!nextPage) throw new Error("Missing #page[data-page] in destination document");

      const doSwap = () => {
        currentPage.replaceWith(nextPage);
        runScripts(nextPage);
      };

      if (typeof document.startViewTransition === "function") {
        await document.startViewTransition(() => doSwap()).finished;
      } else {
        doSwap();
      }

      updateHead(nextDoc);
      if (push) history.pushState({ url: url.href }, "", url.href);
      scrollAfterNavigation(url);
      document.dispatchEvent(new Event("page:load"));
    } catch (err) {
      if (err.name === "AbortError") return;
      window.location.href = url.href;
    } finally {
      inFlightUrl = "";
    }
  }

  document.addEventListener("click", (event) => {
    const url = shouldInterceptClick(event);
    if (!url) return;

    event.preventDefault();
    swapPage(url, { push: true });
  });

  window.addEventListener("popstate", () => {
    const url = new URL(window.location.href);
    swapPage(url, { push: false });
  });
})();
