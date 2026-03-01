(function () {
  function isHomePage() {
    return document.body.classList.contains("page-home");
  }

  function initRecentJobsMarquee() {
    if (!isHomePage()) return;

    const track = document.getElementById("recentJobsTrack");
    if (!track || track.dataset.bound === "true") return;

    const marquee = track.closest(".marquee");
    if (!marquee) return;

    track.dataset.bound = "true";

    const SPEED = 26;
    const controller = new AbortController();
    const { signal } = controller;

    let running = true;
    let x = 0;
    let loopWidth = 0;
    let last = performance.now();
    let started = false;

    function getGapPx() {
      const st = getComputedStyle(track);
      const gap = parseFloat(st.gap || st.columnGap || "0");
      return Number.isNaN(gap) ? 0 : gap;
    }

    function buildClones() {
      track.querySelectorAll('[data-clone="1"]').forEach((n) => n.remove());
      const originals = Array.from(track.querySelectorAll("[data-job]"));
      originals.forEach((el) => {
        const clone = el.cloneNode(true);
        clone.setAttribute("data-clone", "1");
        track.appendChild(clone);
      });
    }

    function measure() {
      const originals = Array.from(track.querySelectorAll("[data-job]"));
      const gap = getGapPx();

      loopWidth = originals.reduce((sum, el, i) => {
        const w = el.getBoundingClientRect().width;
        return sum + w + (i === originals.length - 1 ? 0 : gap);
      }, 0);

      x = loopWidth > 0 ? ((x % loopWidth) + loopWidth) % loopWidth : 0;
    }

    function render() {
      if (loopWidth <= 0) return;
      track.style.transform = `translate3d(${x - loopWidth}px,0,0)`;
    }

    function setStartAt3() {
      const originals = Array.from(track.querySelectorAll("[data-job]"));
      if (originals.length < 3) return;

      const gap = getGapPx();
      const w1 = originals[0].getBoundingClientRect().width;
      const w2 = originals[1].getBoundingClientRect().width;

      x = w1 + gap + w2 + gap;
      if (loopWidth > 0) x = ((x % loopWidth) + loopWidth) % loopWidth;
      render();
    }

    function stop() {
      running = false;
    }

    function start() {
      running = true;
    }

    let touchPause = false;

    function cleanup() {
      if (controller.signal.aborted) return;
      controller.abort();
    }

    function tick(now) {
      if (!document.body.contains(track)) {
        cleanup();
        return;
      }

      const dt = (now - last) / 1000;
      last = now;

      if (!started) {
        started = true;
        measure();
        setStartAt3();
      }

      if (running && loopWidth > 0) {
        x += SPEED * dt;
        if (x >= loopWidth) x -= loopWidth;
        render();
      }

      if (!signal.aborted) requestAnimationFrame(tick);
    }

    function remeasure() {
      if (!document.body.contains(track)) {
        cleanup();
        return;
      }
      measure();
      setStartAt3();
    }

    buildClones();
    measure();
    render();
    requestAnimationFrame(tick);

    marquee.addEventListener("mouseenter", stop, { signal });
    marquee.addEventListener("mouseleave", start, { signal });
    marquee.addEventListener(
      "touchstart",
      () => {
        touchPause = true;
        stop();
      },
      { passive: true, signal }
    );
    marquee.addEventListener(
      "touchend",
      () => {
        if (!touchPause) return;
        touchPause = false;
        start();
      },
      { passive: true, signal }
    );
    marquee.addEventListener(
      "touchcancel",
      () => {
        if (!touchPause) return;
        touchPause = false;
        start();
      },
      { passive: true, signal }
    );

    window.addEventListener("resize", remeasure, { signal });
    window.addEventListener(
      "orientationchange",
      () => {
        setTimeout(remeasure, 200);
      },
      { signal }
    );
    setTimeout(remeasure, 250);
    setTimeout(remeasure, 1000);
  }

  function initProcessAccordion() {
    if (!isHomePage()) return;

    const root = document.getElementById("process");
    if (!root || root.dataset.bound === "true") return;
    root.dataset.bound = "true";

    const steps = root.querySelectorAll(".process-accordion details.step");
    steps.forEach((step) => {
      step.addEventListener("toggle", () => {
        if (!step.open) return;
        steps.forEach((other) => {
          if (other !== step) other.removeAttribute("open");
        });
      });
    });
  }

  function initFaqAccordion() {
    if (!isHomePage()) return;

    const faq = document.getElementById("faq");
    if (!faq || faq.dataset.bound === "true") return;
    faq.dataset.bound = "true";

    const items = faq.querySelectorAll("details");
    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        items.forEach((other) => {
          if (other !== item) other.removeAttribute("open");
        });
      });
    });
  }

  function initHome() {
    if (!isHomePage()) return;
    initRecentJobsMarquee();
    initProcessAccordion();
    initFaqAccordion();
  }

  document.addEventListener("DOMContentLoaded", initHome);
  document.addEventListener("page:load", initHome);
  document.addEventListener("includes:ready", initHome);
})();
