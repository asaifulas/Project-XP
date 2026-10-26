# Classic XP games — plan

Build a small set of **Windows XP–era programs** as real desktop apps inside this portfolio: same registry, same URL window stack, same Luna chrome. Games are the joke that lands — old machine, playable software.

This file is the planning source of truth. `PLAN.md` only sketches the idea; implement from here.

---

## Goals

1. Ship **4 classic apps**, each as its own window/route:
   - **Minesweeper**
   - **Solitaire** (Klondike)
   - **Paint** (MS Paint–inspired)
   - **3D Pinball** (Space Cadet–inspired; 2D/pseudo-3D canvas table, not a full DX remake)
2. Feel like XP accessories: compact frames, beige/client chrome, 11px Tahoma menus where it helps.
3. **Playable on phone** — not “desktop only, broken on touch.” Every game must be operable with a finger on ≤767px without a keyboard.
4. Lazy-load every game so the main shell stays light (`React.lazy` + Suspense). Do not pull pinball physics into the first paint.

Non-goals for v1: online multiplayer, high-score servers, authentic Microsoft assets/sounds (copyright), pixel-perfect Space Cadet table art.

---

## How they plug into the shell

Same pattern as Calculator / Winamp / CertiMagic:

| Piece | Where |
|-------|--------|
| Registry entry | `src/registry/apps.js` — `id`, `path`, `title`, `icon`, `desktop`, `window`, `renderStack` / page |
| Route page | `src/pages/<Game>Page.jsx` thin wrapper around `WindowFrame` |
| Game code | `src/components/games/<name>/` (logic + UI; keep under ~400 lines per file) |
| Shared helpers | `src/components/games/_shared/` — pointer helpers, XP button styles, “New Game” dialog skin |
| Start / desktop | Icons under **Games** (or Accessories); also **Start → All Programs**. Prefer a **Games** folder on the desktop later so icon count doesn’t explode |

Window defaults (desktop):

- Minesweeper / Solitaire / Paint: **compact** frames (`allowMaximize` optional; Paint should maximize).
- Pinball: fixed aspect table, `allowMaximize: true`, no arbitrary stretch that breaks physics.

Phone (`max-width: 767px`): windows already **fill the viewport** above the taskbar (`WindowFrame` phone fill). Games must treat that full-screen client as the play surface — no “drag the window to see the board.”

---

## Phone / touch (mandatory)

XP games were mouse + right-click. Phones are not. Design **two input maps** from day one.

### Shared phone rules

| Rule | Why |
|------|-----|
| Breakpoint | Same as shell: `(max-width: 767px)` or `pointer: coarse` where it helps |
| Hit targets | ≥ **44×44** CSS px for cells, cards, toolbar tools, flipper pads |
| No hover-only | No “hover to preview”; use press / selected state |
| No right-click required | Long-press (≥400ms) or a second tool mode replaces RMB |
| One hand | Primary actions in the lower half or with large edge pads |
| Safe area | Respect `env(safe-area-inset-*)` under the taskbar / home indicator |
| `touch-action` | `manipulation` or game-specific; prevent browser zoom/scroll while playing |
| Orientation | Portrait first; landscape allowed if the layout reflows (Pinball may prefer landscape) |
| Lazy + offline-ish | Games work after load with no network |
| No soft keyboard | Never focus a text field to “type” game keys — that opens the OS keyboard and covers half the screen |

### In-game control buttons (not the phone keyboard)

Some games need keys on desktop (Pinball flippers, plunge). On phone — and as a fallback on desktop — we **build our own clickable buttons inside the game window**. They are part of the UI chrome, like a tiny controller HUD.

**Do**

- Real `<button>` (or pointer-capture pads) drawn in the game layout: Left Flipper, Right Flipper, Plunge / Launch, optional Nudge.
- Large, always visible while playing; sit in a **fixed strip under or beside the table** so they never cover the playfield the way a soft keyboard would.
- Same actions as the desktop keys: press/hold = flipper up, release = flipper down; one tap = plunge.
- Work with mouse click **and** finger tap (Pointer Events). Desktop can keep Z / ← → / Space **and** still show the buttons on coarse pointer or a “Show controls” toggle.

**Don’t**

- Open the system on-screen keyboard (`input`, `contenteditable`, or “press any key” traps that steal focus).
- Overlay translucent full-width keyboards or huge floating keycaps over the table.
- Require a physical keyboard to play on phone.

Shared piece: `GameControlPad.jsx` in `_shared/` — beveled XP-looking pads the game wires to actions.

### Per-game phone UX

**Minesweeper**

- Tap = reveal. **Long-press** = flag (show a brief ripple / haptic if available).
- Optional toolbar toggle: **Reveal | Flag** mode so one-handed play doesn’t rely on long-press timing.
- Chord (reveal neighbors): double-tap on an open numbered cell, or a dedicated “chord” when both modes are wrong — pick one and document it in the window status bar.
- Boards: Beginner fits phone; Intermediate/Expert **scroll inside** the client or scale the grid to width — never clip cells off-screen with no pan.

**Solitaire**

- Tap card to select; tap destination to move (not drag-only).
- Drag still works on desktop; on phone, **tap-to-move** is the primary path.
- Tableau / foundation piles: larger card face (~56–64px wide on phone), fewer pixels of overlap so stacks stay tappable.
- Draw pile + undo as fat bottom bar buttons (in-game UI, not a keyboard).

**Paint**

- Finger = primary stroke; ignore multi-touch zoom while drawing (`touch-action: none` on canvas).
- Tool palette: scrollable **bottom or side sheet**, icons ≥44px (Pencil, Eraser, Fill, Line, Rect, Ellipse, Color).
- Color well + undo/clear always visible.
- Canvas: letterbox inside the client; pinch-to-zoom **optional v2** — v1 is pan if canvas > viewport.
- “Save” = download PNG (same spirit as XP Save As).

**3D Pinball**

- Desktop: physical keyboard (Z / `/` or arrows) + mouse plunge **optional**; in-game control buttons always available on phone and recommended on touch laptops.
- Phone: **custom control strip** under the table — Left Flipper | Plunge | Right Flipper (and optional Nudge). These are game buttons the user taps/holds, not OS keys.
- Layout: table on top (fixed aspect), control strip below (~72–96px tall) so the table stays fully visible; never a soft keyboard.
- Optional: device tilt for nudge (v2); v1 is button-only.
- Pause when the window blurs / phone locks.

### Phone acceptance checklist (every game)

- [ ] Can start a new game with one tap
- [ ] Can complete a short session with only a finger (no physical keyboard, no right-click, **no OS soft keyboard**)
- [ ] Key-driven games (Pinball) expose in-game control buttons the user can click/tap
- [ ] No control smaller than ~44px on the primary path
- [ ] Window fills phone; content doesn’t sit under the taskbar
- [ ] Escape / Close still works via window chrome
- [ ] `prefers-reduced-motion`: disable non-essential shake/particles

---

## Build order (impact ÷ risk)

| # | App | Why this order | Rough effort |
|---|-----|----------------|--------------|
| 1 | **Minesweeper** | Smallest rules surface; proves shared game shell + phone flag/long-press | 1–2 days |
| 2 | **Solitaire** | Card model + tap-to-move; heavier UI, still no physics | 2–4 days |
| 3 | **Paint** | Canvas + tools; high “wow” for a portfolio, good phone drawing demo | 2–3 days |
| 4 | **3D Pinball** | Physics + art; hardest; do last once lazy loading + phone pads exist | 4–7 days |

Ship each as playable v1 before starting the next. Pinball v1 = one table, flippers, plunge, score, drain/reset — not a full Space Cadet remake.

---

## Per-game scope (v1)

### Minesweeper

- Difficulties: Beginner 9×9/10, Intermediate 16×16/40, Expert 30×16/99 (Expert may be desktop-preferred; phone scrolls).
- First click safe (clear a zero-region).
- Timer + mine counter + face button (new game) in an XP status strip.
- Win / lose dialogs styled as small XP message boxes.
- Tests: board generation, reveal flood-fill, flag counts (pure functions under `games/minesweeper/`).

### Solitaire (Klondike)

- Standard deck, draw-1 or draw-3 (toggle).
- Undo stack (at least 1 level; prefer full undo).
- Win detection + simple confetti-optional (respect reduced motion).
- Desktop: drag-and-drop piles. Phone: tap-select → tap-target.
- Card art: CSS/SVG faces (no copyrighted Microsoft card bitmaps).

### Paint

- Tools: pencil, eraser, fill bucket, line, rect, ellipse, eyedropper (nice-to-have), color picker.
- 1px–8px stroke widths; undo (~20 steps); clear; download PNG.
- Optional: open image file into canvas (File → Open via `<input type="file">`).
- Keep tool state in the component; no need for Zustand unless it grows.

### 3D Pinball (Space Cadet–inspired)

- Canvas (2D) table with a simple perspective / ramp fake for “3D” read — not WebGL required for v1.
- Ball physics: fixed timestep, circle vs segment collisions; flippers as rotating segments.
- Score + ball count; drain → next ball; game over → New Game.
- **Control buttons** (required on phone, optional-but-shown on touch): Left / Right flipper + Plunge wired to the same actions as keyboard shortcuts. Built into the window — not the phone soft keyboard.
- Art: original geometric table (blues/teals recalling Cadet) — **do not** rip Microsoft table bitmaps or audio.
- Sound: optional synthesized beeps only; mute with tray/settings later.

---

## Shared technical conventions

```
src/components/games/
  _shared/
    usePhoneGameLayout.js    # matchMedia 767 + coarse pointer
    GameMenuBar.jsx          # File / Game / Help stubs + working New / Exit
    XpGameButton.jsx
    GameControlPad.jsx       # in-game clickable pads (flipper / plunge) — not OS keyboard
    longPress.js             # pointer-based long-press helper
  minesweeper/
  solitaire/
  paint/
  pinball/
src/pages/MinesweeperPage.jsx  # etc.
```

- **Lazy registry**: `const MinesweeperApp = lazy(() => import('...'))` with a small XP “Loading…” fallback in the window body.
- **State**: local React state first; extract pure logic for tests (same spirit as CertiMagic utils).
- **Input**: Pointer Events everywhere (aligned with desktop icons / future window drag). Avoid mouse-only APIs. Keyboard shortcuts are additive; never the only path on phone.
- **Control pads**: hold via `pointerdown` / `pointerup` / `pointercancel` (and `lostpointercapture`); do not use focused inputs.
- **a11y**: window still `role="dialog"`; expose short instructions in Help or a status line (“Long-press to flag”; “Use the buttons under the table”).
- **Icons**: 32×32 XP-style PNGs (or plated marks) under `src/assets/icons/`; don’t drop modern flat icons on the grass without the plate.

---

## Desktop placement

v1 options (pick one when registering):

1. **Four desktop icons** — fine for a short demo; conflicts with the icon-diet goal in `improve.md`.
2. **Preferred:** one **Games** folder (`My Documents`-style Explorer) containing the four shortcuts; desktop only shows `Games`. Start → All Programs still lists each game.

Phone pager: games appear in the icon grid like any other app (tap to open, full-screen window).

---

## Milestones

### M0 — Shell hooks
- [x] `_shared` phone hook + long-press helper (`usePhoneGameLayout`, `GameControlPad`; long-press deferred)
- [x] Lazy-load pattern proven on Pinball (`React.lazy` + Suspense)

### M1 — Minesweeper
- [x] Playable desktop + phone (flag via long-press or mode toggle)
- [x] Unit tests for board logic
- [x] Registry + Start menu entry

### M2 — Solitaire
- [x] Klondike rules + undo
- [x] Phone tap-to-move
- [x] Registry + icon

### M3 — Paint
- [x] Core tools + undo + save PNG
- [x] Phone-sized toolbar
- [x] Registry + icon

### M4 — Pinball
- [x] Physics loop + flippers + score
- [x] In-game control buttons (Left / Plunge / Right) — clickable pads, no soft keyboard
- [x] Lazy chunk verified in build (not in main `index-*.js`)

### M5 — Polish
- [ ] Games folder (optional icon diet)
- [ ] Help text / Clippy link to Games (optional)
- [ ] Reduced-motion + mute

---

## Risks

| Risk | Mitigation |
|------|------------|
| Pinball eats the schedule | Hard timebox; ship Minesweeper+Solitaire+Paint even if Pinball stays “preview” |
| Touch vs scroll conflicts | `touch-action` + “playing” flag to lock body scroll |
| Bundle size | Lazy routes; no huge sprite sheets; Pinball art as compact canvas draws |
| Copyright | Original art/sounds only; “inspired by” in About/Help, never Microsoft binaries |
| Phone Solitaire frustration | Tap-to-move first; drag second |

---

## Out of scope (for now)

- Freecell / Spider / Hearts
- Multiplayer or accounts
- Shipping real Space Cadet `.DAT` / `.WAV` from Windows
- WebGL pinball / Three.js table (revisit only after 2D table is fun)

---

## Reference

- Shell / stack: `src/registry/apps.js`, `src/utils/windowStackUrl.js`, `src/components/window/WindowFrame.jsx`
- Phone fill + pager: `WindowFrame` `usePhoneLayout`, `PhoneDesktopPager.jsx`
- Prior sketch: `PLAN.md` → Classic games
- Design constraint: `improve.md` — games after shell/phone basics; keep chrome 2001, content can be playful
