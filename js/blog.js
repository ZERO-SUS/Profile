/* =========================================================
   Public blog rendering (module).
   Reads posts from Firestore. Before Firebase is configured,
   it falls back to blog/posts.json so the site still works.
   Read-only for visitors — no login needed here.
   ========================================================= */
import { db, isConfigured } from "./firebase-config.js";
import {
  collection, getDocs, query, orderBy,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const list = document.getElementById("blogList");
const reader = document.getElementById("reader");
const readerContent = document.getElementById("readerContent");
const readerClose = document.getElementById("readerClose");

if (list) {
  const md = window.ZS_md || ((s) => s);
  const escapeText = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch { return iso || ""; }
  };

  let posts = [];

  const openPost = (id) => {
    const p = posts.find((x) => x.id === id);
    if (!p) return;
    readerContent.innerHTML = `
      <p class="reader__tag">${(p.tags || []).map((t) => "#" + escapeText(t)).join("  ")} · ${fmtDate(p.date)}</p>
      <h1 class="reader__title">${escapeText(p.title)}</h1>
      <div class="reader__body">${md(p.body || "")}</div>`;
    reader.hidden = false;
    document.body.style.overflow = "hidden";
    readerClose.focus();
  };
  const closePost = () => { reader.hidden = true; document.body.style.overflow = ""; };

  const render = () => {
    if (!posts.length) {
      list.innerHTML = `<p class="blog__state">No posts yet — check back soon.</p>`;
      return;
    }
    list.innerHTML = posts
      .map(
        (p) => `
      <article class="post" data-id="${escapeText(p.id)}" tabindex="0" role="button" aria-label="Read: ${escapeText(p.title)}">
        <div class="post__top">
          <span class="post__date">${fmtDate(p.date)}</span>
          <span class="post__tags">${(p.tags || []).slice(0, 3).map((t) => "#" + escapeText(t)).join(" ")}</span>
        </div>
        <h3 class="post__title">${escapeText(p.title)}</h3>
        <p class="post__excerpt">${escapeText(p.excerpt || "")}</p>
        <span class="post__read">Read <span aria-hidden="true">→</span></span>
      </article>`
      )
      .join("");

    list.querySelectorAll(".post").forEach((elp) => {
      const open = () => openPost(elp.dataset.id);
      elp.addEventListener("click", open);
      elp.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });
  };

  // reader controls
  readerClose.addEventListener("click", closePost);
  reader.querySelector("[data-close]")?.addEventListener("click", closePost);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !reader.hidden) closePost(); });

  async function load() {
    try {
      if (isConfigured && db) {
        const snap = await getDocs(query(collection(db, "posts"), orderBy("date", "desc")));
        posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } else {
        const r = await fetch(`blog/posts.json?t=${Date.now()}`);
        const data = await r.json();
        posts = (Array.isArray(data) ? data : data.posts || [])
          .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      }
      render();
    } catch (err) {
      console.error(err);
      list.innerHTML = `<p class="blog__state">Couldn't load posts.</p>`;
    }
  }

  load();
}
