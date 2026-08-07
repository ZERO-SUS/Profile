# ZERO SUS — Admin & Blog Guide (Firebase)

Your site is **static** (GitHub Pages). Visitors read your blog with no login.
**You** publish blogs from `admin.html`, signing in with your **email + password**
— exactly like a normal login. This is powered by **Firebase** (a free Google backend),
which is what makes real email/password login and a shared blog database possible on a
static site.

## How the security actually works

- Login uses **Firebase Authentication** — your password is hashed and checked on Google's
  servers, never stored in the code. Only the account you create can sign in.
- Blog posts live in **Firestore** (cloud database). Everyone can *read* them; only a
  *signed-in* user can *write*. Since only your account exists, only you can post.
- The Firebase keys in `js/firebase-config.js` are **not secret** — Google's web API keys
  are meant to be public. Your real protection is the Firestore rules + your password.

---

## One-time setup (~10 minutes)

### 1. Create a Firebase project
1. Go to **https://console.firebase.google.com** → **Add project** → name it (e.g. `zero-sus`).
   You can skip Google Analytics.

### 2. Add a Web App and copy the keys
1. In the project, click the **`</>` (Web)** icon → give it a nickname → **Register app**.
2. Copy the `firebaseConfig` object it shows you.
3. Paste those values into **`js/firebase-config.js`** (replace every `PASTE_...`).

### 3. Turn on Email/Password login
1. Left menu → **Build → Authentication → Get started**.
2. **Sign-in method** tab → enable **Email/Password** → Save.
3. **Users** tab → **Add user** → enter your **Gmail + a password**. *This is your login.*

### 4. Create the Firestore database
1. Left menu → **Build → Firestore Database → Create database**.
2. Choose a location, start in **production mode**.
3. Go to the **Rules** tab, replace everything with this, and **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{id} {
      allow read: if true;                  // anyone can read blog posts
      allow write: if request.auth != null; // only signed-in (you) can publish
    }
  }
}
```

### 5. Allow your domain (usually automatic)
Authentication → **Settings → Authorized domains** should include
`zero-sus.github.io` and `localhost`. Add `zero-sus.github.io` if it's missing.

---

## Publishing a blog

1. Go to `https://zero-sus.github.io/AI_website/admin.html`.
2. Sign in with your **email + password**.
3. Fill in **Title, Tags, Excerpt**, write the **Body in Markdown** (live preview on the right).
4. Click **Publish** — it saves to Firestore and appears **instantly** in the **Writing**
   section on your homepage (no waiting for a rebuild).

Edit or delete any post from the **Published posts** list. Firebase keeps you logged in
across reloads; click **Log out** when you're done on a shared computer.

## Markdown cheatsheet

```
# Heading   ## Sub-heading   ### Smaller
**bold**   *italic*   `inline code`
- bullet          1. numbered
> quote
[link](https://example.com)
![image](https://image-url.png)
```code block``` (triple backticks)
--- (horizontal rule)
```

## Before Firebase is set up
The homepage blog falls back to the sample post in `blog/posts.json`, so the site still
looks complete. Once `firebase-config.js` has real keys, it switches to your live Firestore
posts automatically.

## Local preview
Blog data loads over the network, so use a real server (not double-clicking the file):
```bash
python -m http.server 5173      # http://localhost:5173
```

## Your links (already wired into the site)
- GitHub: https://github.com/ZERO-SUS
- Discord server: https://discord.gg/YxBX82Tdgp  (profile: `zero_sus`)
- YouTube: https://www.youtube.com/@ZEROSUS-s7i
- Spotify & guns.lol are in the contact section.
