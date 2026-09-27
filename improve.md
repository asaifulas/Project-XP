# Design improvements

Audit of the Windows XP portfolio shell. Scoped to **look, feel, and phone usability** — not architecture rewrites.

The desktop metaphor is the product. Keep that. The work is: make Luna feel like Luna on a real monitor, and stop pretending a 1440×1080 overlapping window manager can live on a 390px phone.

---

## How to read this

| Priority | Meaning |
|----------|---------|
| P0 | Visitors hit this in the first 10 seconds. Fix or the XP joke falls over. |
| P1 | Authenticity / polish that makes it feel like a real desktop, not a CSS costume. |
| P2 | Nice-to-have atmosphere. Do after the shell is readable and tap-friendly. |

Each item names the file that currently causes it.

---

## Design thesis (pick one and commit)

Right now the UI is **three eras at once**:

1. **XP Luna 2001** — blue title bars, green Start, beige `#ece9d8` client, Tahoma (`index.css` `.xp-*`, folder/Word chrome).
2. **Vista Sidebar 2006** — frosted glass clock / calendar / meters (`WidgetsSidebar.jsx`, `.xp-glass-panel`).
3. **2024 product UI** — blur orbs on Experience.ppt, rounded Clippy balloon, modern social SVGs, leftover Vite purple tokens in `:root`.

That mix reads as “AI retro skin” instead of a point of view.

**Recommended commit:** *XP Professional, late 2001, with one anachronism you own.*

- Shell, windows, taskbar, Explorer, Word, Start = Luna only.
- Widgets stay, but reframe them as a **“Desktop Gadgets” pack** the user installed (or hide them behind a tray icon). Don’t let glass compete with Bliss.
- Document *content* can stay modern (Welcome.doc, Profile.doc) — that’s the joke: old computer, real 2026 work. Don’t put fuchsia glow blobs on the *chrome*.

---

## Why it feels off on desktop

### 1. Default windows are the size of a 2005 workstation (P0)

`src/constants/xpWindow.js` restores frames at **1440×1080** (folders **1024×768**).

XP windows were small and content-sized. A “restored” Word window that is almost the whole 1080p screen looks like a maximize bug. On a 13" laptop it already overflows (`min(1440px, calc(100%-24px))` + stored `{x:28,y:24}`).

**Do instead**

- Default restored size ≈ **min(960px, 86vw) × min(640px, 72svh)** for documents.
- Folders ≈ **720×520**.
- Calculator / Winamp stay compact (already correct).
- First open: center, or cascade from the icon that launched it.
- Clamp stored `windowFramePositions` on resize so a window dragged on a 27" monitor doesn’t spawn off-screen on a 14".

### 2. ~22 icons on the desktop (P0)

`src/registry/apps.js` puts almost every app on the desktop: Office suite, two PDFs, socials, CertiMagic, Calculator, empty Gallery, empty My Documents, placeholders (`BiodataWindowContent`, `AboutWindowContent`).

A real XP desktop was **My Computer, Recycle Bin, maybe IE**. Density kills Bliss and makes the first impression “icon landfill.”

**Do instead**

Keep on the desktop (6–8 max):

- My Computer
- My Documents (put Journey, Profile, Experience, resume, projects *inside*)
- Internet Explorer
- Recycle Bin
- Winamp
- one “Read me” / Welcome.doc

Move the rest into folders or Start → All Programs. WhatsApp / LinkedIn / Gmail / GitHub belong in a **Connect** folder or the Start right column — not four modern brand marks on the grass.

Empty `Gallery` and `My Documents` (`children: []`) should not have desktop shortcuts until they have files.

### 3. Wallpaper is washed out (P0)

`AppLayout.jsx` draws wallpaper at **`opacity-80`** over a dark radial (`xp-desktop` `#0a0a0c`). Bliss (or any hillside) looks dirty and underexposed. XP wallpaper was full-bleed and vivid.

**Do instead**

- Wallpaper `opacity-100`, `bg-cover bg-center` (or honor Display Properties: center / tile / stretch).
- Drop the dark glow, or keep it only as a *no-wallpaper* fallback.
- Display Properties already exists — add Position: Center / Tile / Stretch / Fill.

### 4. Two palettes fight each other (P1)

`tailwind.config.js` `theme.extend.colors.xp` is a **dark Win11-ish** set (`taskbar-mid: #1a1d24`, `menu-shell: #1b1e26`). Live taskbar/Start styles in `index.css` are **Luna blue/green**. The tokens are leftover fiction.

`:root` in `index.css` is still the **Vite starter** (purple accent, dark `prefers-color-scheme`). On a phone in dark mode the page can flash dark-gray before the desktop paints.

`src/App.css` is unused Vite hero/counter CSS.

**Do instead**

- One source of truth: Luna CSS variables (`--xp-title-top`, `--xp-taskbar`, `--xp-client`, `--xp-green-start`).
- Delete or ignore dark `xp.*` Tailwind tokens you don’t use.
- Strip Vite `:root` / `App.css` from the shell.
- Force `color-scheme: light` on the desktop. XP does not follow the OS dark theme.

### 5. Tahoma is declared, not loaded (P1)

`font-xp` = `Tahoma, "MS Sans Serif", system-ui`. macOS/Linux rarely have Tahoma. You get San Francisco / Segoe — instantly “not XP.”

**Do instead**

Self-host a legal XP-like face (e.g. **W95FA** / **Pixelated MS Sans Serif** for chrome, **Georgia** or **Liberation Serif** for Word body — Profile.doc already uses Georgia). Load with `@font-face`. Don’t rely on the visitor owning Office.

Chrome UI: **11px bold**, not 18px body from `:root { font: 18px/145% }`. The global 18px leaks into anything that doesn’t opt into `text-[11px]`.

### 6. Inactive windows don’t go silver (P1)

`WindowFrame.jsx` only does `opacity-[0.98]` when `!isActive`. Real XP: focused title bar = Luna blue; unfocused = gray/silver gradient, dim caption, flatter buttons.

Without that, stacked windows look like identical stickers. Focus is the whole language of a window manager.

### 7. Title-bar buttons are generic squares (P1)

`WindowControlButton.jsx` is 18×18 gray/red squares. Luna used **glossy rounded orbs** (blue min, blue max, red close) with a white highlight at 11 o’clock.

Start button (`StartButton.jsx`) is close, but the flag sits in a dark box. Classic Start is a **green 3D pill**, white “start” in Franklin Gothic / Tahoma bold italic, flag without a plate.

Quick Launch and tray (`Taskbar.jsx`, `SystemTray.jsx`) use **emoji** (⬛ ▶ 📶 🔊). Emoji is the fastest way to break a pixel desktop. Use 16×16 PNGs.

### 8. Start menu is a poster, not a menu (P0)

`StartMenu.jsx`: header says **“User”**, left/right items do **nothing**, All Programs has no flyout, Log Off / Turn Off are dead.

For a portfolio this is the worst dummy: visitors *will* click Start first.

**Do instead**

- Header: photo + **Ahmad Saifullah Arifin** (or “Saiful”).
- Left: Internet Explorer, e-mail (`mailto:`), Welcome.doc, Winamp — actually open windows.
- Right: My Documents, My Computer, Control Panel → Display Properties, Run… → funny dialog.
- All Programs: flyout of every registry app (this replaces the icon landfill).
- Turn Off Computer: XP shutdown dialog → “Thanks for visiting” + resume download / WhatsApp. That’s a memorable close.

### 9. Desktop context menu is a costume (P2)

`AppLayout.jsx` right-click: View / Sort / Git GUI / Intel Graphics / Paste — mostly inert. Refresh is stuck on `#f9f000` (looks permanently selected).

Either:

- **Parody:** every fake item opens an XP error (`XpDialogChrome`) — “Intel Graphics Settings cannot be started.” That’s design.
- **Honest:** only ship items that work (Refresh icons, Display settings, Personalize).

Don’t leave gray disabled rows that look unfinished.

### 10. Icon interaction is XP-accurate and visitor-hostile (P0)

`DesktopIcon.jsx` opens on **double-click** (350ms). Portfolio visitors single-click. Touch users almost never double-tap cleanly.

No selected state (XP: blue translucent highlight + dotted focus + white label).

**Do instead**

- Single click = select. Double click / Enter = open.
- **Coarse pointer or width &lt; 768:** single tap opens.
- Selected: `#316ac5` wash, white label, dotted outline.

### 11. Window drag dies on anything that isn’t a mouse (P0)

`main.jsx` uses **React DnD HTML5 backend**. iOS/Android Safari: title-bar drag does nothing. Icons already use Pointer Events (`DesktopIcon.jsx`) — windows should too.

No resize handles (`PLAN.md` already lists this). A window manager you can’t size feels like a slideshow of panels.

### 12. Glass gadgets steal the meadow (P1)

Fixed **260px** column, `right-3`, always on (`AppLayout.jsx`). Plus Recycle Bin pinned under it. Plus Clippy clamped to *not* overlap that column (`DesktopClippy.jsx` `WIDGET_COL_W = 260`).

On a 1440px desktop that’s OK. On 1280 it’s tight. On a phone it’s fatal (see mobile section).

Design notes even on desktop:

- Glass + blur is Vista, not XP.
- Sticky-note copy is salesy; Note 2 WhatsApp CTA is good, Note 1 is fluff.
- System meters (RAM via `deviceMemory`) are a fun easter egg — keep, but style as a **Task Manager** window or a pixel gadget, not iOS widgets.
- Clippy balloon is `rounded-xl` with 2020s mega-shadows; Office Assistant was a pale yellow rectangle, 1px border, tiny ×.

**Do instead**

- Collapse gadgets behind a tray “Sidebar” button, or one clock + one note.
- Recycle Bin back to the **bottom-left** of the icon grid (XP default), not a second column.

### 13. Office chrome vs Office content (P1)

Word chrome (`WordOfficeChrome.jsx`) is the strongest costume in the repo (rulers, beige toolbars, A4). Then:

- `AboutWindowContent.jsx` / `BiodataWindowContent.jsx` are **placeholders**.
- `side_project` still uses default shell + biodata stub.
- Experience.ppt (`ExperiencePowerPointContent.jsx`) is a **2024 keynote** (blur orbs, fuchsia, glass cards) inside 2003 chrome.
- Word A4 is locked to **210mm** (`WordA4Page.jsx`). Fine on desktop; lethal on phone.

Pick: *chrome is 2003, slides are a modern deck* (say so in the first slide) **or** restyle slides as Office 2003 (navy title, Arial, clip art, no blur). Mixing without a line of dialogue looks accidental.

File / Edit / View bars are **all `disabled`**. One working item each (File → Close, File → Save as PDF for the resume) is enough so they don’t feel broken.

### 14. Missing the one memorable XP moment (P1)

No boot. No logon. No startup sound. You dump the visitor on a finished desktop and auto-open Welcome.doc (`HomePage.jsx`).

**Cheap, high-payoff sequence**

1. Black screen + XP loading bar (2–3s, skippable).
2. Optional logon: “Saiful” + avatar, click to log on.
3. Bliss fades in, taskbar slides up, Welcome.doc opens from the icon.
4. Clippy after 1.5s: “It looks like you’re writing a resume…”

Respect `prefers-reduced-motion` and a tray mute. Don’t autoplay music; Winamp can wait.

### 15. Hit targets and type on chrome (P1)

| Element | Now | Problem |
|---------|-----|---------|
| Title-bar buttons | 18×18 | Below 24px even for mouse; hopeless on touch |
| Icon labels | 10px | Long names (`Latest Resume Saiful.pdf`) wrap into mush in a 100×112 cell |
| Start / task buttons | 11px on 28px bar | Accurate, but tab overflow with 6 windows |
| Taskbar | 34px | Fine for mouse; add a 40px “large taskbar” option later |

Use shorter desktop labels (`Resume.pdf`, `Projects.pdf`). Full name stays in the window title.

### 16. Accessibility that is also design (P1)

- `role="dialog"` on every window, but no focus trap / no `aria-modal`.
- Start menu listens to `mousedown` only — first tap-outside on iOS is unreliable.
- No visible focus on most chrome (except icons).
- `h-svh overflow-hidden` ignores `env(safe-area-inset-*)` — home indicator covers the tray.

Keyboard: Alt to menubar, arrows in Start, Esc close, Ctrl+W close — small, very XP.

---

## Phone: don’t shrink XP. Change the device.

Windows XP’s layout language is **overlapping rectangles, 11px chrome, double-click, hover**. A 390×844 phone has none of that. Scaling the current shell down will stay buggy: 260px gadgets, 1440px windows, HTML5 drag, A4 at 210mm, Clippy `max-w: calc(100vw - 20rem)`.

### What actually breaks today (measured from the code)

On a **390px** wide phone:

| Layout | Math | Result |
|--------|------|--------|
| Icon workspace | `100% - 17.75rem` ≈ **106px** | One crushed icon column; `DesktopIconsArea` then sets `minWidth` from the grid → **horizontal scroll** |
| Gadgets + Recycle | always **260px** | Most of the screen is glass widgets |
| Clippy balloon | `min(240px, 100vw - 20rem)` ≈ **55px** | Unreadable |
| Clippy clamp | cannot overlap the 260px column | No legal X position; character sits on the widgets |
| Restored window | 1440 / 1024 with 24px inset | Frame + title bar + Office toolbars off-screen |
| Stored `{x,y}` | 28 + stack×28 | Windows open past the right edge |
| Word page | 210mm, zoom floor **0.42** | Text ≈ 5–6px; rulers still eat height |
| Window drag | HTML5 DnD | Dead on iOS |
| Icon open | double-click / 350ms | Missed taps, accidental drags (`touch-none` + `button !== 0`) |
| Start menu | 420px, 2 columns | Overflow or 11px soup |
| Taskbar | 34px, 18px Start flag | Under the home indicator; buttons &lt; 44px |
| Context menu | 220×long | Off-screen, no long-press design |
| IE | iframe | Mobile browsers hate nested browsing |

`index.html` already has a correct viewport tag. The bug is **layout policy**, not meta.

---

### Workaround (recommended): two devices, one content

Treat width/pointer as **which computer you’re sitting at**.

```
pointer: coarse  OR  width < 768
        →  "Pocket PC" / Windows Mobile 2003 shell

768–1024 (tablet / landscape phone)
        →  "Tablet XP": single maximized window, no gadget column

> 1024 and fine pointer
        →  current desktop, with smaller default windows
```

Hook: `matchMedia('(max-width: 767px), ((pointer: coarse) and (max-width: 1024px))')` → `useShellStore.layoutMode: 'desktop' | 'tablet' | 'pocket'`.

#### A. Pocket PC mode (portrait phones) — do this

You are not shrinking Luna. You are **emulating a 2003 phone that can open the same files.**

Visual language (keep it in-family):

- Today screen: owner photo, analog clock, 2 sticky lines, 6 big shortcuts (Journey, Experience, Projects PDF, Resume, Winamp, Contact).
- **One app at a time**, full screen under a 28–32px caption (Start + title + close). No overlapping frames, no drag, no maximize.
- Start = **full-screen list** (large rows, 44px), same registry as desktop All Programs.
- Running apps = a “Programs in memory” sheet (taskbar button), not 220px task chips.
- Soft keys / command bar above `safe-area-inset-bottom`.
- Word / Profile / Journey: **Pocket Word** — drop A4, rulers, 210mm zoom. Just the article, 16px, full width, page chrome gone.
- PPT: one slide per screen, swipe, hide outline thumbnails.
- PDF: pinch-zoom viewer only; hide Adobe toolbars.
- Excel / CertiMagic: “This tool needs a bigger screen” + Open on desktop / download. Don’t ship a 20-column grid on a phone.
- IE: `window.open` the URL, or a “open in Safari” dialog. Nested iframe browsers are misery on iOS.
- Winamp: compact **bottom player** (title, play, next) — not the 278px skin.
- Clippy: one toast, or a 36px assistant in the corner. No 260px keep-out.
- Gadgets: **not a column**. Clock lives on Today. Notes live in Start or a single slide-over.
- Icons: CSS **3–4 column grid**, no absolute `translate`, **tap to open**. Recycle in the grid.
- Wallpaper: full-bleed Bliss, no 80% fade.

This is the honest workaround: XP’s *files* travel; XP’s *window manager* does not.

#### B. Tablet / landscape phone

- Auto-maximize every XP window (`isMaximized` default true when `layoutMode !== 'desktop'`).
- Hide gadget column; clock + one note in the tray popover.
- Single-tap icons.
- Title-bar buttons ≥ 28px.
- Keep Luna chrome — landscape 700px+ can show a real title bar.
- Still no HTML5 drag required (already maximized).

#### C. Optional easter egg: “Show desktop version”

A Start item: **Remote Desktop to Saiful-PC**.

- Render the existing desktop into a **1024×768 virtual screen**.
- Wrap with `overflow: auto` + pinch-zoom (`touch-action: pinch-zoom` or a small pan/zoom layer).
- Banner: “You’re looking at a 1024×768 desktop. Pinch to move around.”

Use this as a *demo*, not the default. Default must be readable without pinch.

Do **not** set `viewport` to `width=1024` as the main phone experience. It makes everything tiny and fights Safari chrome.

---

### Touch / safe-area checklist (all modes)

- Replace `HTML5Backend` with pointer-based window move (copy `DesktopIcon`’s pointer capture) or add `react-dnd-touch-backend` only if you still want DnD.
- `event.button !== 0` on icon `pointerdown` blocks some touch streams — accept `pointerType === 'touch'`.
- `env(safe-area-inset-top/bottom)` on the shell and taskbar.
- 44×44 minimum for Start, close, tray, Today shortcuts.
- Long-press = context menu (iOS has no right-click).
- Recenter / maximize windows when `visualViewport` shrinks (keyboard, rotate).
- `overscroll-behavior: none` on the desktop root so iOS doesn’t rubber-band the “OS.”

---

## Content that undermines the design

These are design problems because empty or modern-generic surfaces sit *inside* the costume:

| Surface | Issue |
|---------|--------|
| `AboutWindowContent.jsx` | Placeholder + “Back home” |
| `BiodataWindowContent.jsx` | “Replace this content” |
| `side_project` | Default chrome + biodata stub |
| `office_excel` vs `project` | Two Excel windows, same vibe |
| Gallery / My Documents | Empty folders with desktop icons |
| Welcome.doc | Strongest piece — lead with this; don’t compete with 20 icons |
| Start “User” | Breaks personal portfolio immediately |

Fill or hide. A closed door is better than an empty Explorer window.

---

## Atmosphere (P2, after P0)

- Luna **Olive Green** and **Silver** in Display Properties → Appearance.
- Startup / error / recycle **sounds**, tray mute, `prefers-reduced-motion`.
- Window open: scale up from the icon; minimize: dock into the taskbar button.
- Recycle Bin that actually hides a desktop icon and can restore it.
- BSOD / “Windows must restart” as a 404.
- Solitaire / Minesweeper (already in `PLAN.md`) — only after the shell and phone mode work.
- Pixel 32×32 icons for socials; retire flat SVG brands on the desktop.
- Meta / OG image: a screenshot of Bliss + Welcome.doc, not a generic avatar.

---

## Suggested build order

1. **Pocket + tablet layout modes** (gadgets gone, tap-to-open, maximized / single app, safe area, no A4 on phone).
2. **Desktop icon diet** + Start menu that actually opens apps / Turn Off.
3. **Sane default window sizes** + inactive silver title bars + clamp positions.
4. **Wallpaper at 100%** + delete Vite/dark leftover CSS.
5. **Ship Tahoma-like webfont** + real 16px icons for Start / tray (no emoji).
6. **Pointer-based window drag** + resize grips on desktop only.
7. **Boot / logon** skippable intro.
8. **Fill or remove** About, Biodata, Gallery, empty folders.
9. **Decide PPT era** and Clippy balloon (Office Assistant, not iOS card).
10. Games, themes, sounds.

---

## Out of scope (on purpose)

Not design, so not expanded here: URL stack, Zustand splits, CertiMagic logic, test coverage, SEO copy. If a change is “make the 1440 window fit a phone,” that’s a design bug — fix it with layout mode, not another `min()` in `xpWindow.js`.
