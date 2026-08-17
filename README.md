# ZERO SUS — Portfolio
https://zero-sus.github.io/Profile/

A minimal, premium, futuristic portfolio. Black / white / dark-gray with subtle red accents.
Aesthetic reference: Vercel × Linear × Apple × Stripe × Raycast.

## Stack
Zero dependencies. Plain **HTML + modern CSS + vanilla JS**. No build step.

```
AI_website/
├─ index.html      # semantic structure, all sections
├─ css/style.css   # design tokens, layout, animations, responsive
├─ js/main.js      # scroll reveals, cursor glow, counters, card tilt
└─ README.md
```

## Run it
Just open `index.html` in a browser — or serve locally for clean routing:

```bash
# any one of these
python -m http.server 5173        # -> http://localhost:5173
npx serve .
```

## Sections
Hero (animated headline + live counters) · Marquee · Selected Work (interactive cards)
· Capabilities (animated skill bars) · Journey (timeline) · Contact · Footer.

## Blog + Admin
Add blog posts from `admin.html` after signing in with your **email + password**
(Firebase Auth). Posts are stored in Firestore and appear in the **Writing** section.
Full setup steps are in **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)**.

## Make it yours
- **Colors** — edit the CSS custom properties in `:root` (`--accent` is the red).
- **Content** — projects, timeline, stats, and links live directly in `index.html`.
- **Email / socials** — replace `hello@zerosus.dev` and the `#` social links in the contact section.

## Craft notes
- Respects `prefers-reduced-motion` — all animation is disabled for users who ask.
- Accessible: semantic landmarks, keyboard-friendly nav, focus-safe interactions.
- Performance-first: no libraries, IntersectionObserver over scroll listeners for reveals,
  `requestAnimationFrame`-throttled cursor/tilt, system + Google fonts only.
