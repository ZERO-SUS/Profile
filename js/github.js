/* =========================================================
   Live GitHub stats.
   Pulls real numbers from the public GitHub API (no auth) and
   fills any element with a [data-gh] attribute:
     data-gh="repos"      -> public repositories
     data-gh="followers"  -> followers
     data-gh="following"  -> following
     data-gh="gists"      -> public gists
     data-gh="stars"      -> total stars across all public repos
   Cached in localStorage for 30 min so we don't hit the
   unauthenticated rate limit (60 req/hr) on every visit.
   ========================================================= */
(() => {
  "use strict";

  const USER = "ZERO-SUS";
  const CACHE_KEY = "zs_gh_stats";
  const TTL = 30 * 60 * 1000; // 30 minutes

  const targets = [...document.querySelectorAll("[data-gh]")];
  if (!targets.length) return;

  const setValue = (key, val) => {
    targets
      .filter((el) => el.dataset.gh === key)
      .forEach((el) => {
        el.dataset.count = val;
        if (window.ZS_animateCount) window.ZS_animateCount(el, val);
        else el.textContent = val;
      });
  };

  const apply = (stats) => {
    Object.entries(stats).forEach(([k, v]) => setValue(k, v));
    const live = document.getElementById("ghLive");
    if (live) live.classList.add("is-live");
  };

  // ---- cache ----
  const readCache = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (raw && Date.now() - raw.t < TTL) return raw.stats;
      if (raw && raw.stats) return raw.stats; // stale but usable as instant fallback
    } catch {}
    return null;
  };
  const writeCache = (stats) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), stats })); } catch {}
  };

  // ---- fetch ----
  async function fetchStats() {
    const headers = { Accept: "application/vnd.github+json" };

    const userRes = await fetch(`https://api.github.com/users/${USER}`, { headers });
    if (!userRes.ok) throw new Error("gh user " + userRes.status);
    const u = await userRes.json();

    const stats = {
      repos: u.public_repos || 0,
      followers: u.followers || 0,
      following: u.following || 0,
      gists: u.public_gists || 0,
      stars: 0,
    };

    // total stars: page through public repos (100 per page)
    try {
      let stars = 0, page = 1;
      while (page <= 5) { // cap at 500 repos — plenty
        const r = await fetch(
          `https://api.github.com/users/${USER}/repos?per_page=100&page=${page}&type=owner&sort=updated`,
          { headers }
        );
        if (!r.ok) break;
        const repos = await r.json();
        stars += repos.reduce((sum, rp) => sum + (rp.stargazers_count || 0), 0);
        if (repos.length < 100) break;
        page++;
      }
      stats.stars = stars;
    } catch { /* keep stars: 0 if repo listing fails */ }

    return stats;
  }

  // ---- run: show cache instantly, then refresh in background ----
  const cached = readCache();
  if (cached) apply(cached);

  fetchStats()
    .then((stats) => { apply(stats); writeCache(stats); })
    .catch(() => {
      // offline / rate-limited: fall back to cache, else leave the static defaults
      if (!cached) {
        const live = document.getElementById("ghLive");
        if (live) live.classList.add("is-live"); // still show the label
      }
    });
})();
