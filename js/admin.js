/* =========================================================
   ZERO SUS — Admin controller (Firebase)
   Login  = Firebase Email/Password auth (only your account).
   Blog   = Firestore "posts" collection.
   Security: Firestore rules allow anyone to READ, but only a
   signed-in user to WRITE. Since only your account exists,
   only you can publish. See ADMIN_GUIDE.md.
   ========================================================= */
import { auth, db, isConfigured } from "./firebase-config.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  query, orderBy, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const md = window.ZS_md || ((s) => s);

let posts = [];
let editingId = null;

const el = {
  loginScreen: $("loginScreen"), appScreen: $("appScreen"),
  loginForm: $("loginForm"), loginStatus: $("loginStatus"),
  email: $("email"), password: $("password"),
  whoami: $("whoami"), logoutBtn: $("logoutBtn"),
  editorTitle: $("editorTitle"),
  postTitle: $("postTitle"), postTags: $("postTags"), postDate: $("postDate"),
  postExcerpt: $("postExcerpt"), postBody: $("postBody"), preview: $("preview"),
  publishBtn: $("publishBtn"), newBtn: $("newBtn"), status: $("status"),
  postList: $("postList"),
};

// ---------- helpers ----------
const setStatus = (node, msg, kind) => {
  node.textContent = msg;
  node.className = "status " + (kind ? "is-" + kind : "is-info");
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const escapeText = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeAttr = (s) => escapeText(s).replace(/"/g, "&quot;");

const friendlyAuthError = (code) => ({
  "auth/invalid-email": "That email doesn't look right.",
  "auth/invalid-credential": "Wrong email or password.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/user-not-found": "No account with that email. Add it in Firebase → Authentication.",
  "auth/too-many-requests": "Too many attempts. Wait a bit and try again.",
  "auth/network-request-failed": "Network error — check your connection.",
}[code] || "Sign-in failed. " + code);

// ---------- editor ----------
const renderPreview = () => { el.preview.innerHTML = md(el.postBody.value); };

const clearEditor = () => {
  editingId = null;
  el.editorTitle.textContent = "New Post";
  el.publishBtn.textContent = "Publish";
  el.postTitle.value = "";
  el.postTags.value = "";
  el.postDate.value = todayISO();
  el.postExcerpt.value = "";
  el.postBody.value = "";
  renderPreview();
  setStatus(el.status, "", "info");
};

const loadIntoEditor = (id) => {
  const p = posts.find((x) => x.id === id);
  if (!p) return;
  editingId = id;
  el.editorTitle.textContent = "Editing post";
  el.publishBtn.textContent = "Update post";
  el.postTitle.value = p.title || "";
  el.postTags.value = (p.tags || []).join(", ");
  el.postDate.value = p.date || todayISO();
  el.postExcerpt.value = p.excerpt || "";
  el.postBody.value = p.body || "";
  renderPreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const renderPostList = () => {
  if (!posts.length) { el.postList.innerHTML = "<li>No posts yet.</li>"; return; }
  el.postList.innerHTML = posts
    .map(
      (p) => `
    <li>
      <div class="plist__meta">
        <b>${escapeText(p.title)}</b>
        <span>${escapeText(p.date || "")} · ${(p.tags || []).map((t) => "#" + t).join(" ")}</span>
      </div>
      <div class="plist__actions">
        <button class="mini" data-edit="${escapeAttr(p.id)}">Edit</button>
        <button class="mini mini--danger" data-del="${escapeAttr(p.id)}">Delete</button>
      </div>
    </li>`
    )
    .join("");
  el.postList.querySelectorAll("[data-edit]").forEach((b) =>
    b.addEventListener("click", () => loadIntoEditor(b.dataset.edit)));
  el.postList.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", () => deletePost(b.dataset.del)));
};

// ---------- Firestore ----------
async function loadPosts() {
  const snap = await getDocs(query(collection(db, "posts"), orderBy("date", "desc")));
  posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function publish() {
  const title = el.postTitle.value.trim();
  const body = el.postBody.value.trim();
  if (!title) { setStatus(el.status, "Give it a title first.", "err"); return; }
  if (!body) { setStatus(el.status, "The body is empty.", "err"); return; }

  const data = {
    title,
    body,
    date: el.postDate.value || todayISO(),
    tags: el.postTags.value.split(",").map((t) => t.trim()).filter(Boolean),
    excerpt: el.postExcerpt.value.trim() || body.replace(/[#>*`\-]/g, "").slice(0, 140),
  };

  el.publishBtn.disabled = true;
  setStatus(el.status, "Publishing…", "info");
  try {
    if (editingId) {
      await updateDoc(doc(db, "posts", editingId), data);
    } else {
      const ref = await addDoc(collection(db, "posts"), { ...data, createdAt: serverTimestamp() });
      editingId = ref.id;
      el.editorTitle.textContent = "Editing post";
      el.publishBtn.textContent = "Update post";
    }
    await loadPosts();
    renderPostList();
    setStatus(el.status, "Published ✓  It's live now.", "ok");
  } catch (err) {
    setStatus(el.status, "Publish failed: " + (err.code || err.message), "err");
  } finally {
    el.publishBtn.disabled = false;
  }
}

async function deletePost(id) {
  const p = posts.find((x) => x.id === id);
  if (!p || !confirm(`Delete "${p.title}"? This can't be undone.`)) return;
  setStatus(el.status, "Deleting…", "info");
  try {
    await deleteDoc(doc(db, "posts", id));
    if (editingId === id) clearEditor();
    await loadPosts();
    renderPostList();
    setStatus(el.status, "Deleted ✓", "ok");
  } catch (err) {
    setStatus(el.status, "Delete failed: " + (err.code || err.message), "err");
  }
}

// ---------- auth flow ----------
async function enterApp(user) {
  el.whoami.textContent = user.email;
  el.loginScreen.classList.add("hidden");
  el.appScreen.classList.remove("hidden");
  clearEditor();
  setStatus(el.status, "Loading posts…", "info");
  try {
    await loadPosts();
    renderPostList();
    setStatus(el.status, "", "info");
  } catch (err) {
    setStatus(el.status, "Couldn't load posts: " + (err.code || err.message), "err");
  }
}

function showLogin() {
  el.appScreen.classList.add("hidden");
  el.loginScreen.classList.remove("hidden");
}

// ---------- init ----------
function init() {
  el.postDate.value = todayISO();
  el.postBody.addEventListener("input", renderPreview);
  el.publishBtn.addEventListener("click", publish);
  el.newBtn.addEventListener("click", clearEditor);

  if (!isConfigured) {
    setStatus(el.loginStatus, "Firebase not set up yet — add your keys to js/firebase-config.js (see ADMIN_GUIDE.md).", "err");
    el.loginForm.querySelector("button").disabled = true;
    return;
  }

  el.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus(el.loginStatus, "Signing in…", "info");
    try {
      await signInWithEmailAndPassword(auth, el.email.value.trim(), el.password.value);
      // onAuthStateChanged handles the rest
    } catch (err) {
      setStatus(el.loginStatus, friendlyAuthError(err.code || ""), "err");
    }
  });

  el.logoutBtn.addEventListener("click", () => signOut(auth));

  // Firebase keeps you logged in across reloads (local persistence).
  onAuthStateChanged(auth, (user) => {
    if (user) enterApp(user);
    else { showLogin(); el.password.value = ""; }
  });
}

init();
