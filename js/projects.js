/* =========================================================
   Live GitHub projects (module).
   Fetches ALL public repos for the user straight from the GitHub
   API and renders them as project cards. Each card links to its
   repo. Cached in localStorage (30 min) so we don't burn the
   unauthenticated rate limit (60 req/hr) on every visit.
   ========================================================= */

const USER = "ZERO-SUS";
const CACHE_KEY = "zs_gh_repos";
const TTL = 30 * 60 * 1000; // 30 min

const list = document.getElementById("projectList");

if (list) {
  const escapeText = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapeAttr = (s) => escapeText(s).replace(/"/g, "&quot;");

  const relTime = (iso) => {
    const d = (Date.now() - new Date(iso).getTime()) / 1000;
    const day = 86400;
    if (d < day) return "today";
    if (d < 2 * day) return "yesterday";
    if (d < 30 * day) return `${Math.round(d / day)}d ago`;
    if (d < 365 * day) return `${Math.round(d / (30 * day))}mo ago`;
    return `${Math.round(d / (365 * day))}y ago`;
  };

  // Map a GitHub repo object -> the card fields we already style.
  const card = (repo, wide) => {
    const lang = repo.language || "Code";
    const topics = (repo.topics || []).slice(0, 2);
    const tag = topics.length ? topics.join(" · ") : `${lang} · Repository`;
    const stack = [
      lang,
      repo.stargazers_count ? `★ ${repo.stargazers_count}` : "",
      repo.forks_count ? `⑂ ${repo.forks_count}` : "",
    ].filter(Boolean);

    return `
    <a class="card ${wide ? "card--wide" : ""} reveal is-visible" data-tilt
       href="${escapeAttr(repo.html_url)}" target="_blank" rel="noopener">
      <div class="card__glow"></div>
      <div class="card__body">
        <span class="card__tag">${escapeText(tag)}</span>
        <h3 class="card__title">${escapeText(repo.name)}</h3>
        <p class="card__desc">${escapeText(repo.description || "No description provided.")}</p>
        <ul class="card__stack">${stack.map((s) => `<li>${escapeText(s)}</li>`).join("")}</ul>
      </div>
      <div class="card__meta">
        <span>Updated ${escapeText(relTime(repo.pushed_at))}</span>
        <span class="card__arrow">↗</span>
      </div>
    </a>`;
  };

  const render = (repos) => {
    // Only show starred repos (at least one star).
    const starred = (repos || []).filter((r) => (r.stargazers_count || 0) > 0);
    if (!starred.length) {
      list.innerHTML = `<p class="blog__state">No starred repositories yet.</p>`;
      return;
    }
    // Most-starred first, then most recently pushed. Top repo gets the wide "featured" box.
    const sorted = starred.slice().sort(
      (a, b) =>
        (b.stargazers_count - a.stargazers_count) ||
        (new Date(b.pushed_at) - new Date(a.pushed_at))
    );
    list.innerHTML = sorted.map((r, i) => card(r, i === 0)).join("");
    if (window.ZS_initTilt) window.ZS_initTilt(list);
  };

  // ---- cache ----
  const readCache = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (raw && raw.repos) return { repos: raw.repos, fresh: Date.now() - raw.t < TTL };
    } catch {}
    return null;
  };
  const writeCache = (repos) => {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), repos })); } catch {}
  };

  // ---- fetch every public repo (paginated) ----
  async function fetchRepos() {
    const headers = { Accept: "application/vnd.github+json" };
    let all = [], page = 1;
    while (page <= 5) { // up to 500 repos
      const r = await fetch(
        `https://api.github.com/users/${USER}/repos?per_page=100&page=${page}&type=owner&sort=pushed`,
        { headers }
      );
      if (!r.ok) throw new Error("gh repos " + r.status);
      const batch = await r.json();
      all = all.concat(batch);
      if (batch.length < 100) break;
      page++;
    }
    // Keep the user's own work (skip forks); trim to what we render.
    return all
      .filter((repo) => !repo.fork)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        html_url: repo.html_url,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        pushed_at: repo.pushed_at,
        topics: repo.topics,
      }));
  }

  // ---- run: show cache instantly, then refresh in the background ----
  const cached = readCache();
  if (cached) render(cached.repos);

  if (!cached || !cached.fresh) {
    fetchRepos()
      .then((repos) => { render(repos); writeCache(repos); })
      .catch(() => {
        if (!cached) list.innerHTML = `<p class="blog__state">Couldn't load repositories right now.</p>`;
      });
  }
}
