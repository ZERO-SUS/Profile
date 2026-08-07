/* =========================================================
   ZERO SUS — interactions
   Vanilla JS, no dependencies. Respects reduced-motion.
   ========================================================= */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  /* ---- Nav: scrolled state + scroll progress ---- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const toggle = $("#navToggle");
  const links = $(".nav__links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$(".nav__links a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ---- Cursor glow (desktop, fine pointer only) ---- */
  const glow = $("#cursorGlow");
  if (glow && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    let x = 0, y = 0, cx = 0, cy = 0, raf = null;
    const loop = () => {
      cx += (x - cx) * 0.15;
      cy += (y - cy) * 0.15;
      glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      raf = Math.abs(x - cx) > 0.5 || Math.abs(y - cy) > 0.5 ? requestAnimationFrame(loop) : null;
    };
    window.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      glow.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(loop);
    });
    document.addEventListener("mouseleave", () => (glow.style.opacity = "0"));
  }

  /* ---- Reveal on scroll ---- */
  const revealables = $$(".reveal, .skill");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* ---- Animated stat counters ---- */
  const counters = $$("[data-count]");
  if (counters.length) {
    const animate = (el) => {
      const target = +el.dataset.count;
      if (reduceMotion) { el.textContent = target; return; }
      const dur = 1400, start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const cio = new IntersectionObserver(
      (entries, obs) => entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); }
      }),
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  }

  /* ---- Card pointer glow + subtle tilt ---- */
  if (!reduceMotion && window.matchMedia("(hover: hover)").matches) {
    $$("[data-tilt]").forEach((card) => {
      const glowEl = $(".card__glow", card);
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        if (glowEl) {
          glowEl.style.setProperty("--mx", px + "px");
          glowEl.style.setProperty("--my", py + "px");
        }
        const rx = ((py / r.height) - 0.5) * -5;
        const ry = ((px / r.width) - 0.5) * 5;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ---- Active nav link on scroll ---- */
  const sections = $$("main section[id]");
  const navMap = new Map($$(".nav__links a").map((a) => [a.getAttribute("href").slice(1), a]));
  if ("IntersectionObserver" in window) {
    const sio = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const link = navMap.get(e.target.id);
        if (link && e.isIntersecting) {
          navMap.forEach((l) => l.style.color = "");
          link.style.color = "var(--text)";
        }
      }),
      { threshold: 0.5 }
    );
    sections.forEach((s) => sio.observe(s));
  }
})();
