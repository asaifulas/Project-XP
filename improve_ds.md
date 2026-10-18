# improve_ds.md — engineering review

Read-only audit. Nothing in the codebase was changed. `improve.md` covers **look /
feel / phone**; this file covers **payload, correctness, code health, DX, a11y,
security** (Part I), plus a pixel-level **appearance / XP-fidelity audit** with
screenshots and measured computed styles (Part II). Where the two disagree,
`improve.md` wins on taste, this file wins on numbers.

Measured on this machine: 96 source files, 11,096 LOC, 25 passing tests, `vite build`
= **47 MB deploy**, main JS **1,129.72 kB (358 kB gzip)**, CSS 98.71 kB (18.1 kB gzip).

---

## Opinion, short version

**What is genuinely good, and rarer than it looks:**

- **URL-as-window-stack** (`src/utils/windowStackUrl.js`) is the best idea in the
  repo. Foreground = pathname, background = repeated `otherurl`, `?app=` for
  disambiguation. Shareable, back-button-correct, and it means window state needs no
  client store to survive navigation. Most portfolio sites faking a desktop get this
  wrong.
- **Registry-driven apps** (`src/registry/apps.js`) is the right shape: one place
  describes title/icon/route/render, so the desktop, Start menu, and taskbar cannot
  drift apart.
- **A11y is not an afterthought**: 182 `aria-*`, 36 roles, desktop icons are real
  `<button>`s with `focus-visible` styling, Escape handled globally, `prefers-reduced-motion`
  respected in the PPT animations. Above average for a novelty shell.
- **Discipline in the small things**: no `console.log` anywhere, `noopener,noreferrer`
  on external opens, `pdfjs` worker pinned to a Vite URL instead of a CDN, `?url` for
  heavy assets, `improve.md`/`PLAN.md`/`docs/HOW-IT-WORKS.md` actually kept.
- **Zustand + plain CSS tokens** fits the problem. No framework churn to undo.

**What is actually holding it back — in order:**

1. **Payload.** `PLAN.md` says "Fast + crisp: snappy interactions, no heavy pages".
   Reality: 47 MB deploy, ~4.2 MB before the desktop is usable (1.13 MB JS + 1.56 MB
   wallpaper + one random 1.5–1.8 MB Clippy GIF). On a 4G phone that is a 6–8 s blank
   screen for a *portfolio*. This is the whole game; everything else is second order.
2. **Deep links have no SPA fallback.** No `_redirects`, `vercel.json`, `404.html`, or
   host config in the repo. `createBrowserRouter` + `/calculator` refreshed on a static
   host = 404 unless the host is configured. That would silently break the
   most-shared thing you own: a link.
3. **The crown jewel is untested.** All 25 tests are CertiMagic utilities. The URL state
   machine — 5 pure functions plus 6 open/close/activate transitions — has zero tests,
   and it is the only code where a one-character mistake loses a user's window stack.

Everything below is ordered by `impact ÷ effort`, not by severity.

---

## Scorecard

| Area | Grade | One line |
|---|---|---|
| Architecture | A− | URL stack + registry; two sources of truth for routes |
| Payload | **F** | 37 MB of images, pdfjs in the main chunk |
| Correctness / URL | B | clever and correct-looking, but untested and host-fragile |
| Code health | B | small, readable, a few dead spots and near-duplicate store actions |
| A11y | B+ | strong basics; no modal semantics on windows |
| DX / CI | C | lint fails, no CI, no jsdom, no typecheck |
| Security | B | 3 advisories (SSR-only path); no secrets, no user input to speak of |
| SEO / sharing | D | `<title>Saiful-Desktop</title>` and nothing else |
| XP fidelity | **B−** | structure right, surface ~60% — see Part II |

---

## Tier 0 — today, ≤30 min each

### 1. Images: 37 MB → ~4 MB (the single biggest win)

Measured in the build: `gif` 23 files / 20.5 MB · `png` 12 / 15.7 MB · `jpeg` 1 / 5.1 MB
· `jpg` 1 / 1.5 MB. `src/assets` alone is 44 MB, so the *repo* is heavy too.

Converted here, for real, not estimated:

| Asset | Now | After | Saved |
|---|---|---|---|
| `wallpaper/default.jpg` (4500×3000) | 1564 kB | **143 kB** webp @1920, q80 | 91% |
| `clippy/clippy-black-10.gif` (300×300) | 1812 kB | **79 kB** lossy webp, q35 | 96% |
| `mine/profile.png` (1220×1100) | 1.4 MB | ~100 kB webp @900 | 93% |

```sh
# wallpapers: resize to max 1920 wide, then webp
for f in src/assets/wallpaper/*.{jpg,jpeg,png}; do
  sips -Z 1920 "$f" --out /tmp/w.jpg >/dev/null
  cwebp -q 80 /tmp/w.jpg -o "${f%.*}.webp"
done

# clippy: lossy animated webp (300px source, displayed ~120px)
for f in src/assets/clippy/*.gif; do
  gif2webp -q 35 -m 6 -lossy "$f" -o "${f%.gif}.webp"
done
```

Both `cwebp` and `gif2webp` are already installed (`/opt/homebrew/bin`), and
`useShellStore`/`DesktopClippy` already glob by extension — `.webp` is picked up by the
wallpaper glob, so the only code change is the clippy glob's `*.gif` → `*.{gif,webp}`.
Keep the originals in `design/` (outside `src/`) so Vite stops emitting them; 37 MB of
source art needs no build step.

Also: the full-size originals are never needed at runtime, and `import.meta.glob(... eager)`
emits *all* of them into `dist` even though only one wallpaper and one Clippy are fetched.

### 2. Stop shipping the PDF reader to people who aren't opening a PDF

`src/registry/apps.js` statically imports every app, including `PdfReaderApp`, which
pulls `react-pdf` + `pdfjs-dist`. Verified in the bundle: `pdfjs` markers are inside
`index-*.js` — the 1,129 kB main chunk. Vite even warns: *"Some chunks are larger than
500 kB"*.

Highest-leverage version: lazy the four heavy surfaces in the registry.

```js
const PdfReaderApp = lazy(() => import('../components/apps/pdf/PdfReaderApp'))
// same for WinampApp, CertiMagicApp, and the PPT deck (gsap)
```

with a `<Suspense fallback={<XpBusy />}>` around the window body. Expect main JS
≈ 350–450 kB, i.e. **~60% off the critical path**; the PDF app becomes a ~600 kB
on-demand chunk. The pattern already exists and works — `certimagic/pdf.js:55` does
`await import('jspdf')`, which is exactly why jspdf is a separate 390 kB chunk today.
Copy that instinct to the app boundary.

### 3. SPA fallback (10 min, prevents a broken shared link)

`createBrowserRouter` needs the host to rewrite unknown paths to `index.html`. Nothing
in the repo does that. Pick your host:

```text
# public/_redirects        (Netlify, Cloudflare Pages)
/*  /index.html  200
```
```json
// vercel.json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
GitHub Pages: add `public/404.html` containing the same `index.html` shell (or use
`spa-github-pages`). Whichever host you use, test `curl -I https://<host>/calculator`
after deploying — 200, not 404.

### 4. Fix the 2 lint errors — CI can't gate what already fails

```
src/components/desktop/DesktopIconsArea.jsx:6   error  'snapDesktopIconPosition' is defined but never used
src/components/windows/ExperiencePowerPointContent.jsx:19  error  'isClosing' is assigned a value but never used
```

Both are deletions (or wire them up). The 3 remaining warnings are missing-dep nits in
effects; `AppLayout.jsx:68` is a genuine stale-closure footgun waiting for someone to
edit that block — add the deps or move the handlers into `useCallback`.

### 5. `<head>`: the site currently has no SEO and no share card

Everything in `index.html` is charset, viewport, favicon, `<title>Saiful-Desktop</title>`.
A portfolio gets shared on LinkedIn/WhatsApp, where that title renders as "Saiful-Desktop"
with no description and no image.

```html
<title>Saiful — Windows XP Portfolio</title>
<meta name="description" content="A portfolio that boots into Windows XP. Projects, resume, and experiments as desktop apps." />
<meta property="og:title" content="Saiful — Windows XP Portfolio" />
<meta property="og:description" content="..." />
<meta property="og:image" content="/og.png" />        <!-- 1200×630, one screenshot -->
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="theme-color" content="#245edb" />        <!-- XP blue, also tints mobile UI -->
```

Add `public/robots.txt` and (if you care) a `sitemap.xml`. Ten minutes for the single
biggest difference in how the link *looks* when someone shares it.

### 6. `npm audit`: 3 advisories, one fix command

`react-router-dom` → `react-router` has `GHSA-337j-9hxr-rhxg` (arbitrary constructor
injection in SSR hydration, range 6.0.0-alpha.0–7.17.0). This is a client-only SPA, so
exploitability is low — but the fix is free and the repo already wants a router bump
(see Tier 2). Run `npm audit` after the bump to confirm zeros.

### 7. Persist the shell's personalisation (≈15 lines)

`useShellStore` is memory-only: wallpaper, icon positions, and window positions all
reset on refresh. For a desktop metaphor that is the one thing users expect to stick,
and it is the cheapest "this feels real" upgrade available.

```js
import { persist } from 'zustand/middleware'
export const useShellStore = create(persist((set) => ({ /* ... */ }), {
  name: 'porto-shell',
  partialize: (s) => ({ currentWallpaperId: s.currentWallpaper?.id, windowFramePositions: s.windowFramePositions }),
}))
```

Store the wallpaper *id*, not the resolved URL — Vite hashes filenames, so a URL in
localStorage breaks on the next deploy. `useDesktopIconStore` gets the same treatment.

---

## Tier 1 — half a day each, compounding

### 8. One source of truth for "is this route stackable"

`src/utils/windowStackUrl.js:4-24` hardcodes a `STACK` set that duplicates
`ROUTES` in the registry. I diffed them: 19 vs 19, but `STACK` contains **`/folder`,
a route that no longer exists** (folders render through `/my_computer`,
`/my_documents`, `/recycle_bin`). Dead entry today; tomorrow it's "I added a route and
windows don't stack" — a silent, hard-to-trace bug. Derive it:

```js
import { ROUTES } from '../registry/apps'
const STACK = new Set(ROUTES.map((r) => r.path).filter((p) => p !== '/'))
```

`programIdForPath` (`:204-211`) is the same smell: three hardcoded ids plus a
string-mangling fallback, duplicating `win-${app.id}`. Resolve through the registry.

### 9. Test the URL state machine (highest value per line of test)

`windowStackUrl.js` is pure, synchronous, and dependency-free — perfect test material,
currently 0 tests. Cases worth pinning: open-on-desktop keeps no `otherurl`; open →
activate → close round-trips to `/`; closing the foreground promotes `others[0]`;
duplicate targets are de-duped; `?app=` survives encode/decode (`/about?app=my_computer`);
reopening an already-stacked window doesn't duplicate it. ~20 assertions, no DOM, no
mocks. This is the code that, when it regresses, loses a visitor's tabs.

### 10. Error boundary at the router root

One throwing app (a malformed PDF, a bad CertiMagic row) blanks the entire desktop, with
no message and no way back. There is no `ErrorBoundary` in the repo. A 25-line class
component (or `react-router`'s `errorElement`) rendering an XP-styled "This program has
performed an illegal operation" dialog is *both* the fix and on-brand:

```jsx
createBrowserRouter(routes, { /* per-route */ errorElement: <XpCrashDialog /> })
```

### 11. Make component tests possible

`vite.config.js` sets `test.environment: 'node'`, so nothing that renders can be tested.
Add `jsdom` + `@testing-library/react` and switch to `environment: 'jsdom'` with
`exclude` for pure-logic files, or add a second Vitest workspace for DOM tests. Also
note the test run prints *"Both esbuild and oxc options were set"* — a `@vitejs/plugin-react`
4.x / Vitest 4 mismatch; bumping the plugin (Tier 2) clears it.

### 12. CI (one file, protects everything above)

`.github/workflows/ci.yml`: `npm ci`, `npm run lint`, `npm test`, `npm run build`.
Node 22 (matches `mise.toml`). If you keep trail, add `trail build --check` so a stale
graph fails loudly instead of quietly misdirecting an agent. Right now nothing stops a
red lint from being committed — as the 2 existing errors prove.

### 13. De-duplicate the store's program actions

`upsertProgram` (`useShellStore.js:64-92`) and `launchProgram` (`:93-123`) are ~90%
identical; `setActiveProgram` (`:56-63`) is a third variation. One helper with an
`activate` flag removes ~50 lines of copy-paste that will drift. `removeProgram` and
`toggleProgramMinimize` are fine.

### 14. Window semantics: it says `role="dialog"` but doesn't behave like one

`WindowFrame.jsx:301` has `role="dialog"` + `aria-label`, good — but no `aria-modal`,
no focus move into the window on open, no restore on close. Screen readers announce a
dialog and then leave the cursor on the desktop behind it. Small fix: on activation,
focus the frame (`tabIndex={-1}`), add `aria-modal="true"` for capped
(`fillsViewport`) windows, and restore focus to the launcher on close.

---

## Tier 2 — worth scheduling, not urgent

| # | Item | Why / effort |
|---|---|---|
| 15 | Split `registry/apps.js` (521 LOC) into `data` + `render` | Mixing icons/titles/routes with `createElement(FolderApp, …)` is why nothing can be lazy. Data-only registry unlocks #2 cleanly. |
| 16 | Replace `react-dnd` with pointer events for window drag | `HTML5Backend` is mouse-only; it works today *only* because `PHONE_LAYOUT_QUERY` disables dragging below 768 px. Tablets and touch laptops (≥768 px) get undraggable windows. Icons already use pointer events — one mechanism, not two. |
| 17 | `checkJs` + JSDoc, no TS rewrite | The code is already annotated (look at `windowStackUrl.js`, `constants/xpWindow.js`). Turning on `allowJs`/`checkJs` would have caught #8's dead `/folder` entry. Start with `src/utils` + `src/stores`. |
| 18 | Toolchain bumps | All majors behind: `vite` 5.4→8.3, `tailwindcss` 3.4→4.3, `eslint` 9.39→10.13, `@vitejs/plugin-react` 4.7→6.1, `vitest` 4.1→5.0, `react-router-dom` 6.30→7.18, `pdfjs-dist` 5.4→6.4. Do these one per PR, never together — Vite 5→8 is two majors and Tailwind 4 changes the config format. |
| 19 | Split the largest components when you next touch them | `WinampApp` 579, `ExperiencePowerPointContent` 549, `MultiSlidePowerPointDeck` 471, `ExcelOfficeChrome` 458, `CalculatorApp` 448. All are under the 800-line ceiling — just don't grow them. |
| 20 | `loading="lazy"` / `decoding="async"` on window content images | 13 `<img>` tags, zero lazy attributes. Only matters once images are small (#1), but free. |
| 21 | Repo hygiene | `package.json` is still `name: "desktop"`, `version: "0.0.0"`, no `engines` despite the `mise.toml` Node 22 pin; no `LICENSE`. Two-line fixes that make the repo legible to a stranger. |
| 22 | `manualChunks` for vendor code | A monolithic 1.1 MB chunk re-downloads on every deploy. After #2, split `react`/`react-dom` into a `vendor` chunk so app code ships separately. |

---

## What I would *not* do

- **No TypeScript migration.** 11k LOC, one author, working JSDoc. `checkJs` (Tier 2)
  buys most of the safety for none of the churn.
- **No state-library swap.** Zustand is right here; the problems are duplication and
  persistence, not the library.
- **No CSS-in-JS / component library.** The XP authenticity lives in the hand-written
  `index.css` and `tailwind.config.js` tokens. Leave it.
- **Don't chase Lighthouse 100.** A novelty shell that loads instantly and looks like
  Luna beats a 100-score page that's forgotten. Fix the 4 MB, keep the personality.

---

## Order of operations

1. `#4` lint errors → `#12` CI (so later steps can't regress).
2. `#1` images + `#2` lazy apps + `#3` SPA fallback → the site is now *fast* and
   *shareable*; measure the delta before touching anything else.
3. `#5` head/OG → `#6` audit → `#7` persistence.
4. `#8` route source of truth → `#9` URL tests → `#10` error boundary.
5. Tier 2 as the repo is touched.

Re-measure with `npx vite build` (chunk table) and `du -sh dist` after steps 1–2. The
targets: **dist < 10 MB, main JS < 450 kB, first load < 1 MB**, and a 404-free
`/calculator`.

---

# Part II — Appearance & XP fidelity

Method: ran the app in headless Chrome at **1440×900** and **390×844**, captured 10
states (desktop, Start menu, stacked windows, Explorer, Display Properties, PDF, PPT,
mobile), and read computed styles off the live DOM. Screenshots are evidence, not
taste. `improve.md` already argues the *design thesis*; this is the **pixel-and-state**
audit: what a real XP screenshot has that yours doesn't.

**Verdict: the structure is ~85% XP, the surface is ~60%.** Chrome geometry, Start menu
architecture, Explorer task panes, dialog tabs, the beige client area, the 3D bevel
buttons — all genuinely there. What breaks the illusion clusters into six things, and
four of them are under an hour each.

## Status — A1–A4 shipped

| Item | What changed | Verified |
|---|---|---|
| **A1** frame + shadow | `.xp-window`: `border: 3px solid #0831d9`, `border-radius: 8px 8px 0 0`, drop shadow deleted; titlebar inner radius 5px. Maximized/phone windows drop side/top/bottom frame. | Computed: `3px rgb(8,49,217)`, `box-shadow: none`; 3px edge visible on all sides in the screenshot. |
| **A1b** clipped frame | Found while verifying: a restored 1416px frame at `x: 28` overflowed a 1440 viewport by 4px, so the right border and scrollbar were cut off. Default position is now clamped against the frame width the window will use. | Window right edge `1428 < 1440`; scrollbar fully inside the frame. |
| **A2** inactive window | `data-active` on the frame; inactive titlebar `#94b1e8 → #6d8fd4`, caption `#d6e3fa`, buttons desaturated; removed the old `opacity: .98` hack. | Stacked screenshot: grey-blue inactive bar next to a saturated active one. |
| **A3** caption type | `.xp-title-text`: 13px, weight 700, `text-shadow: 1px 1px 0 rgba(0,0,0,.45)` (lighter shadow when inactive). | Computed 13px / 700; visible shadow in the crop. |
| **A4** scrollbars | 17px XP scrollbars in `@layer base`: sunken track, beveled blue-grey thumb, beige arrow buttons drawn from inline SVGs; `scrollbar-color` for Firefox. `.no-scrollbar` still wins (utility layer). | Styled thumb + 17px gutter inside `.word-office-chrome-scroll`. |

**A4 caveat:** Chrome on macOS forces *overlay* scrollbars, so it paints the track and
thumb but silently drops `::-webkit-scrollbar-button` — no arrow buttons there. Windows
and Linux Chrome, and Firefox via `scrollbar-color`, get the full treatment. Verified
working in isolation; the macOS gap is a browser limit, not a CSS bug.

`npx eslint` on the touched files: 0 errors · `vitest run`: 25/25 pass.


## Fidelity scorecard

| Region | Now | Real XP | Gap |
|---|---|---|---|
| Chrome type | Tahoma 11px on *your* machine | Tahoma 8pt everywhere | Tahoma is only present because Office is installed — a clean Mac/Linux visitor silently falls back to system-ui |
| Title bar text | 16px, weight **400**, no shadow | ~13px **bold**, 1px dark shadow | Reads like a modern app header |
| Window frame | `border: 0 0 1px`, `0 12px 30px rgba(0,0,0,.45)` shadow | **3px `#0831d9`** frame + 2px top highlight, **no drop shadow** | The shadow is Vista/7; it's the loudest anachronism |
| Inactive window | `opacity-[0.98]` only | Desaturated titlebar (`#7ba2e7`→`#6d8fd4`), text `#d6e3fa`, muted buttons | Two stacked windows both look active |
| Title buttons | 18×18, radius 3 | 21×21, grouped 2px apart, 1px white inset | Slightly small |
| Menus (context) | White, no icons, **Refresh row permanently yellow**, "Display settings", "Personalize" | 1px black border, grooved separators, icons in a gutter, `#316ac5` hover with white text, "Properties" | Wording is Win7 ("Personalize"), highlight colour is wrong |
| Start menu | Structure close (header, white left, blue right, footer) | 380px, 1px white separators, 2px avatar frame, green arrow on All Programs | No separators, header avatar unframed, All Programs row is grey not white |
| Taskbar | 34px, `#4d8cf6→#1555c7` | 30px, `#245edb→#1941a5`, Quick Launch | No Quick Launch / Show Desktop; slightly tall and light |
| Scrollbars | Unstyled → macOS overlay | 17px, beveled thumb + arrow buttons | Very visible in Word/PDF windows |
| Desktop icons | 10px labels; 3 different icon languages | 11px Tahoma + 1px black shadow; one-era icons | GitHub/WhatsApp/LinkedIn/Gmail/CertiMagic/Calculator are modern rounded squares |
| Widgets | Glass cards + dark analog clock + WhatsApp pill | XP had **no** sidebar; gadgets were flat, Tahoma, 3px borders | Three eras at once — the single biggest "not 2001" signal |
| Dialogs | Display Properties is convincing | Missing Background *Position*, Browse, Customize Desktop; 8px-density spacing | Abridged but fine |
| Office content | A4-ish page at full window width, web type scale (h2 ~26px) | 794px page at 96dpi, Times 12pt body, Times bold 14–16pt headings | Reads as a web page in a Word costume |
| Clippy balloon | 12px radius, blue link list | `#ffffe1`, 1px black, 2px radius, Tahoma 11px, underlined-on-hover links | Also covers ~⅔ of a 390px phone screen |
| Boot | Straight to desktop (with Welcome.doc open) | Boot splash → Welcome/login → desktop | No first-impression moment; a Word window is the first thing a visitor sees |
| Cursors | System default | XP arrow/hand/busy | Cheap, high recognition |

## The four fixes that do the most per hour

**A1 · Window frame + shadow (45 min).** Measured today: `border-width: 0 0 1px;
box-shadow: 0 12px 30px rgba(0,0,0,.45)`. XP floats windows with nothing — it defines
them with a thick blue frame.

```css
.xp-window {
  border: 3px solid #0831d9;
  border-radius: 8px 8px 0 0;    /* only the titlebar corners round */
  box-shadow: none;              /* delete the Vista shadow */
}
```

**A2 · Inactive window state (30 min).** XP's most recognisable behaviour is the
grey-blue titlebar on the window behind. There is no inactive styling today beyond
`opacity: .98`. Add a `[data-active='false']` variant: gradient `#7ba2e7→#6d8fd4`,
text `#d6e3fa`, frame `#6d84b4`, buttons desaturated, taskbar button un-pressed.

**A3 · Title bar typography (15 min).** `font-weight: 700; font-size: 13px;
text-shadow: 1px 1px 0 rgba(0,0,0,.35)` on the title. That one line removes the
"modern app header" read instantly. Do the same for tray/clock (11px, bold clock).

**A4 · XP scrollbars (30 min).** Nothing is styled, so macOS gives you overlay
scrollbars. 17px track, `#f1f1f1`, beveled `#cdd8ee` thumb, `#ece9d8` arrow buttons.
It's the cheapest "this is really XP" cue inside every window.

## The next ring (1–3h each)

**A5 · Self-host Tahoma.** Present locally (`Tahoma.ttf` in `~/Library/Fonts`, only
because Office is installed). Every visitor without Office gets `system-ui`, so the
type metrics — the thing that makes XP look like XP — change per machine. Bundle a
woff2 (Wine's metric-compatible Tahoma is LGPL, ~80 kB) and only then can you trust the
look. While there: drop the inherited `letter-spacing: .18px`, and use
`-webkit-font-smoothing: auto` on chrome text (the current `antialiased` makes 11px
Tahoma look like 2024 UI).

**A6 · One menu skin.** Context menu, Start menu, and every window menu bar should
share: `background: #fff; border: 1px solid #000; border-radius: 2px; font: 11px
Tahoma;` separators as 2px grooved lines, `#316ac5` hover with white text, disabled
`#9a9a9a`, and icons in a 20px gutter. Then fix the wording: **Properties**, not
"Display settings"; delete "Personalize" (Win7); make Refresh a normal row, not a
permanent yellow highlight.

**A7 · One icon language.** Six desktop icons are 2024 app tiles (GitHub, WhatsApp,
LinkedIn, Gmail, CertiMagic, Calculator) next to XP 3D icons. Pick the XP era: 32×32
PNG/ICO with bevels, or (if you must keep modern marks) frame them all in the same
XP-style plate. Mixed icon families are the fastest way for a visitor to read
"AI-generated retro skin" instead of a period piece.

**A8 · Widgets: reframe or hide.** The dark glass clock + frosted cards + green
WhatsApp pill are Windows 7 / 2024, and they occupy the right 300px of Bliss. Two
honest options: (a) restyle as flat "Desktop Gadgets" — white/blue, 3px border,
Tahoma, `border-radius: 0`, no `backdrop-filter`; or (b) hide them behind a tray
toggle so the desktop is pure XP by default. Also delete the pill button and use a
beveled XP button.

**A9 · Office content typography.** The Word page should be **794px** wide at 96dpi
with Times 12pt body (16px), Times bold headings, line-height ~1.15, and 2cm-ish
margins; Excel 10pt Arial. Today the page stretches to the window and the headings are
web-scale, which reads as a landing page wearing a Word frame. One `.word-page` /
`.excel-sheet` type module fixes all 12 documents at once.

**A10 · Clippy balloon + mobile.** `#ffffe1`, 1px black border, 2px radius, Tahoma
11px, links underline on hover only, tail at 8 o'clock. On ≤767px, collapse to a
single line ("Need help? Ask Clippy") or hide after 5s — right now it covers the icon
grid and the wallpaper on a phone.

## Delight items, ordered by wow-per-hour

1. **Boot sequence (≈4h)** — 1.5s "Windows XP" splash with the moving blue bars, then
   a Welcome screen with the user tile, then the desktop. This is the single biggest
   first-impression upgrade available and it's all local animation.
2. **XP cursors (≈30 min)** — `cursor: url(arrow.cur) 0 0, auto` for default/hand/busy.
   Recognisable in the first mouse move.
3. **Window open/close animation (≈2h)** — XP's minimize-to-taskbar and restore-from-
   taskbar are iconic; CSS-only approximations are fine.
4. **Sounds (careful)** — do **not** ship Microsoft's startup chime (copyright). Either
   synthesize a 3-note chime or ship none; a bad sound is worse than silence.
5. **Selection + focus details (≈1h)** — icon selection marquee, dotted focus rect,
   `#316ac5` selection colour, Alt-key menu underlines.

## The era rule (write it down once)

Every "why doesn't it feel like XP" complaint resolves to one rule:

> **Chrome is 2001. Content is 2026. Never mix them.**

- Chrome = titlebars, taskbar, Start menu, menus, dialogs, widgets, tray, cursors:
  no `border-radius > 3px`, no `backdrop-filter`, no drop shadows, no emoji, Tahoma,
  the Luna palette.
- Content = documents, PDFs, project pages, the 3D demo: modern type, modern colour,
  modern imagery — that contrast *is* the joke.
- Litmus test: if it has `border-radius > 3px` or `backdrop-filter` and it isn't
  inside a document, it's out of era.

## The 3D + GSAP piece — my honest opinion

**Yes, add it — it's the strongest possible addition to the project set**, provided it
is framed as *work you can open*, not as a second website. Reasoning:

- Every current project is a **document** (doc/xls/ppt/pdf). A WebGL piece is the only
  one that demonstrates motion, shaders, and scroll-driven choreography — the skills a
  client hiring for "3D site with GSAP" is actually buying.
- It makes the thesis land: old machine, real 2026 work. A folder of documents proves
  you can write documents; a live 3D scene proves you can ship a different medium.
- It gives the portfolio a *destination* with a wow moment, which the desktop alone
  doesn't have for a non-technical visitor.

**How to ship it without wrecking the shell:**

| Decision | Recommendation |
|---|---|
| Integration | New desktop icon + a window titled e.g. `3D_Lab.app` that renders a **poster frame** with a "Launch" button; launch opens full-screen (window) or a new tab |
| Bundle | Never in the main chunk. Separate route (`/lab`) behind `React.lazy`, or a same-origin iframe built independently. Main JS is 1.13 MB today — this must not make it worse |
| Poster | 1200×630 still + an 8s muted mp4/webm loop. Covers low-end GPUs, mobile, and the OG share card |
| Mobile | Do **not** autoplay WebGL on a phone that just downloaded an XP shell. Poster + tap-to-play |
| Framing | Don't restyle it as XP. Let it be modern inside an XP window — the contrast is the story |
| Entry points | Desktop icon, an Experience.ppt slide, and Start ▸ All Programs — same destination, three affordances |
| Linkability | Give it a real URL (`/lab`) so it can be shared and indexed; it's also the only project that deserves a dedicated share card |
| Effort | iframe + poster ≈ half a day · native lazy route + shared state ≈ 1–2 days · custom shaders ≈ open-ended |

One caution: a heavy WebGL scene next to a 4 MB XP shell compounds the payload problem.
Ship the payload fixes in Part I **first**, then add the 3D piece as a lazily-loaded
island — otherwise the first impression becomes a spinner, which is the one thing worse
than a plain screenshot.


## Appendix — evidence

```text
src            96 files, 11,096 LOC (trail: 365 nodes, 812 edges)
vite build     47 MB total · js 1.8 MB (5 files) · gif 20.5 MB · png 15.7 MB
               jpeg 5.1 MB · jpg 1.5 MB · pdf 1.2 MB · css 0.1 MB
main chunk     index-*.js 1,129.72 kB (gzip 357.75)  ← pdfjs markers inside
css            index-*.css 98.71 kB (gzip 18.10)
lint           2 errors, 3 warnings
tests          5 files / 25 tests, all CertiMagic; 0 for windowStackUrl & stores
audit          3 vulnerabilities (react-router, moderate+low; SSR-only path)
outdated       vite 5.4→8.3 · tailwindcss 3.4→4.3 · eslint 9.39→10.13
               @vitejs/plugin-react 4.7→6.1 · vitest 4.1→5.0 · react-dnd→pointer (Tier 2)
               react-router-dom 6.30→7.18 (also the advisory fix) · pdfjs-dist 5.4→6.4
               react 19.2.5→19.3.1, zustand 5.0.12→5.0.15 (minor)
first paint    ≈ 4.2 MB  (1.13 JS + 0.10 CSS + 1.56 wallpaper + ~1.5 random Clippy)
conversions    wallpaper 1564→143 kB · clippy gif 1812→79 kB · profile 1.4 MB→~100 kB
```

Reproduce: `npx vite build --outDir /tmp/buildcheck` (writes nothing into the repo),
`npx eslint .`, `npx vitest run`, `npm audit`, `du -h src/assets/*`.
