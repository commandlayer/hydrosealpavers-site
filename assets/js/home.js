(function () {
  function initRecentJobsMarquee() {
    const track = document.getElementById("recentJobsTrack");
    if (!track || track.dataset.bound === "true") return;
    track.dataset.bound = "true";

    const marquee = track.closest(".marquee");
    if (!marquee) return;

    const SPEED = 26; // px/sec

    let running = true;
    let x = 0; // 0..loopWidth
    let loopWidth = 0; // width of ONE original set
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
        const c = el.cloneNode(true);
        c.setAttribute("data-clone", "1");
        track.appendChild(c);
      });
    }

    function measure() {
      const originals = Array.from(track.querySelectorAll("[data-job]"));
      const gap = getGapPx();

      loopWidth = originals.reduce((sum, el, i) => {
        const w = el.getBoundingClientRect().width;
        return sum + w + (i === originals.length - 1 ? 0 : gap);
      }, 0);

      if (loopWidth > 0) {
        x = ((x % loopWidth) + loopWidth) % loopWidth;
      } else {
        x = 0;
      }
    }

    // LEFT→RIGHT rendering (B slides in from left)
    function render() {
      if (loopWidth <= 0) return;
      track.style.transform = `translate3d(${x - loopWidth}px,0,0)`;
    }

    // Start view should show 3,4,5 first.
    // We do that by setting x to the width of items 1+2 (+ gap between them).
    function setStartAt3() {
      const originals = Array.from(track.querySelectorAll("[data-job]"));
      if (originals.length < 3) return;

      const gap = getGapPx();
      const w1 = originals[0].getBoundingClientRect().width;
      const w2 = originals[1].getBoundingClientRect().width;

      // x corresponds to how far we are into the loop;
      // offset by (1 + gap) + (2 + gap) so the viewport begins at item 3.
      x = w1 + gap + (w2 + gap);

      if (loopWidth > 0) {
        x = ((x % loopWidth) + loopWidth) % loopWidth;
      }
      render();
    }

    function tick(now) {
      if (!document.body.contains(track)) return;

      const dt = (now - last) / 1000;
      last = now;

      if (!started) {
        // one-time start positioning AFTER layout is stable
        started = true;
        measure();
        setStartAt3();
      }

      if (running && loopWidth > 0) {
        x += SPEED * dt;
        if (x >= loopWidth) x -= loopWidth;
        render();
      }

      requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
    }
    function start() {
      running = true;
    }

    // init
    buildClones();
    measure();
    // don’t call setStartAt3() immediately; fonts/layout may not be settled.
    render();
    requestAnimationFrame(tick);

    // pause on hover
    marquee.addEventListener("mouseenter", stop);
    marquee.addEventListener("mouseleave", start);

    // pause on press/hold mobile
    let touchPause = false;
    marquee.addEventListener(
      "touchstart",
      () => {
        touchPause = true;
        stop();
      },
      { passive: true }
    );
    marquee.addEventListener(
      "touchend",
      () => {
        if (touchPause) {
          start();
          touchPause = false;
        }
      },
      { passive: true }
    );
    marquee.addEventListener(
      "touchcancel",
      () => {
        if (touchPause) {
          start();
          touchPause = false;
        }
      },
      { passive: true }
    );

    // re-measure (responsive) — keep starting at 3 after resize
    const re = () => {
      measure();
      setStartAt3();
    };
    window.addEventListener("resize", re);
    window.addEventListener("orientationchange", () => setTimeout(re, 200));
    setTimeout(re, 250);
    setTimeout(re, 1000);
  }

  function initProcessAccordion() {
    const root = document.getElementById("process");
    if (!root || root.dataset.bound === "true") return;
    root.dataset.bound = "true";

    const steps = root.querySelectorAll(".process-accordion details.step");
    steps.forEach((d) => {
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        steps.forEach((other) => {
          if (other !== d) other.removeAttribute("open");
        });
      });
    });
  }

  function initFaqAccordion() {
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
    if (!document.body.classList.contains("page-home")) return;
    initRecentJobsMarquee();
    initProcessAccordion();
    initFaqAccordion();
  }

  document.addEventListener("DOMContentLoaded", initHome);
  document.addEventListener("page:load", initHome);
  document.addEventListener("includes:ready", initHome);
})();
