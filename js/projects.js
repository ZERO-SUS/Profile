/* =========================================================
   Public projects rendering (module).
   Reads projects from Firestore; falls back to blog/projects.json
   before Firebase is configured. Renders the Work section cards.
   ========================================================= */
import { db, isConfigured } from "./firebase-config.js";
import {
  collection, getDocs, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("projectList");

if (list) {
  const escapeText = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapeAttr = (s) => escapeText(s).replace(/"/g, "&quot;");

  const card = (p) => `
    <a class="card ${p.wide ? "card--wide" : ""} reveal is-visible" data-tilt href="${escapeAttr(p.url || "#")}" target="_blank" rel="noopener">
      <div class="card__glow"></div>
      <div class="card__body">
        <span class="card__tag">${escapeText(p.tag || "")}</span>
        <h3 class="card__title">${escapeText(p.title || "")}</h3>
        <p class="card__desc">${escapeText(p.desc || "")}</p>
        <ul class="card__stack">${(p.stack || []).map((s) => `<li>${escapeText(s)}</li>`).join("")}</ul>
      </div>
      <div class="card__meta"><span>${escapeText(p.meta || "")}</span><span class="card__arrow">↗</span></div>
    </a>`;

  const render = (projects) => {
    if (!projects.length) {
      list.innerHTML = `<p class="blog__state">No projects yet.</p>`;
      return;
    }
    list.innerHTML = projects.map(card).join("");
    // re-enable pointer glow + tilt on the freshly injected cards
    if (window.ZS_initTilt) window.ZS_initTilt(list);
  };

  async function load() {
    try {
      if (isConfigured && db) {
        const snap = await getDocs(query(collection(db, "projects"), orderBy("order", "asc")));
        const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        render(projects.length ? projects : await fallback());
      } else {
        render(await fallback());
      }
    } catch (err) {
      console.error(err);
      try { render(await fallback()); } catch { list.innerHTML = `<p class="blog__state">Couldn't load projects.</p>`; }
    }
  }

  async function fallback() {
    const r = await fetch(`blog/projects.json?t=${Date.now()}`);
    const data = await r.json();
    return (Array.isArray(data) ? data : data.projects || [])
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  load();
}
