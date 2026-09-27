# How the desktop app works

Three ways to read this doc:

| Level | Section |
|--------|---------|
| 🧒 **5 years old** | [Explain it like you're 5](#explain-it-like-youre-5-) |
| 🎓 **Expert (start here)** | [Understanding as an expert](#understanding-as-an-expert) |
| 📎 **Lookup** | [Reference](#reference) — tables and file map when you need a specific file |

---

## Explain it like you're 5 🧒

Imagine your computer screen is a **playroom**.

### The room (always there)
- The **blue bar at the bottom** is like a shelf where you put toys you're playing with.
- The **picture on the wall** is the wallpaper.
- Little **stickers on the desk** are your **desktop icons** — each sticker is a toy you can play with.

### Opening a toy
When you **double-tap a sticker**, a **box with a blue top** pops up. That box is a **window**.
- You can **grab the blue top** and **slide the box** around the desk.

### The three buttons
| Button | Kid version | Real thing |
|--------|-------------|------------|
| **─** | Hide under the shelf | **Minimize** — still on taskbar |
| **□** | Make HUGE | **Maximize** |
| **×** | Put toy away | **Close** — gone for real |

Double-tap the blue top = big ↔ small.

### Shelf, many boxes, memory
- Every open box gets a **taskbar button** on the shelf.
- Many boxes can be open; one in front, others behind.
- The **browser address** remembers which boxes are open (sticky note).
- Two **notebooks** (Zustand): where windows sit / what's on the taskbar, and where you moved stickers.
- **`apps.js`** = catalog of all toys (sticker + window + shelf button).

---

## Understanding as an expert

**What this is:** A React SPA dressed as Windows XP. Not a real OS — a **persistent desktop shell** with **URL-backed multi-windowing** and a **single app registry**.

### The arrangement (one picture)

```
apps.js (registry)
       │
       ▼
Desktop icons ──navigate──► React Router URL ◄── source of truth for OPEN windows
       │                         │
       │              pathname = foreground window
       │              otherurl[] = background windows
       │              ?app=      = disambiguate shared paths
       ▼                         ▼
AppLayout (always on)    DesktopShell
  icons, taskbar              ├─ BackgroundWindows → WindowFrame × N (inactive)
  wallpaper                   └─ <Outlet />        → *Page → WindowFrame (active)
                                       │
                                       ▼
                              WindowFrame (chrome, drag, ─□×)
                                       │
                                       ▼
                              shell content (word / ie / folder / …)
```

### What keeps state (split on purpose)

| Concern | Where | Why |
|---------|--------|-----|
| **Which apps are open** | **URL** (`pathname`, `?app=`, `otherurl`) | Shareable, back button, stack survives refresh |
| **Taskbar, wallpaper, window XY** | **`useShellStore`** (Zustand) | Chrome UI; drag positions; minimize flags on taskbar |
| **Desktop icon layout** | **`useDesktopIconStore`** | Icon drag is unrelated to routing |
| **Maximize / minimize hide** | **`WindowFrame` local React state** | Visual only; URL unchanged (except close) |

**Rule of thumb:** If closing should “quit the app”, it goes through **`closeWindowAtPath`** and edits the URL. If it’s hide or resize, it stays in Zustand or component state.

### Mechanism chain (how you wired it)

1. **`APPS`** — one row = route + desktop shortcut + `window` chrome + `renderStack` body.
2. **Open** — icon → `openForegroundPreserveStack` → push current key to `otherurl`, navigate to target.
3. **Render** — foreground from route `Page`; background from `BackgroundWindows` + `windowRegistry.renderStack`.
4. **Same component** — `WindowFrame` for both; `isActive` + `onActivate` swap stack via URL.
5. **Taskbar** — `WindowFrame` mount → `upsertProgram(win-<id>)`; close → `removeProgram`.
6. **Drag** — React DnD on title bar only → `windowFramePositions[programId]`.
7. **Icons** — pointer drag on `DesktopIcon`, not DnD.

### Controls (expert one-liner)

- **Close** → URL pop + unmount. **Minimize** → hide frame, keep URL + taskbar entry. **Maximize** → CSS fill viewport, local state only.

### Add a new app

Add to **`apps.js`**: `id`, `path`, `page`, `desktop`, `window.shell`, `renderStack`. If it shares a path, set `stackable: true` and use `?app=id` when opening.

---

## Reference

### Layout

`DesktopShell` = `AppLayout` (desktop + taskbar) + `BackgroundWindows` + `<Outlet />` (foreground page).

### Icons → windows → taskbar

One registry row → desktop icon (`getDesktopApps`) + `WindowFrame` (`win-<id>`) + taskbar button (`runningPrograms`).

| Action | Mechanism |
|--------|-----------|
| Open icon | `openForegroundPreserveStack(path, appId)` |
| Close × | `closeWindowAtPath` |
| Click background window | `activateBackgroundWindow` |
| Taskbar click | activate / restore / `toggleProgramMinimize` |

### URL stack

| Part | Meaning |
|------|---------|
| `pathname` | Foreground window |
| `?app=` | Registry row when paths collide |
| `otherurl` (repeat) | Background windows |

Helpers: `src/utils/windowStackUrl.js`.

### `WindowFrame`

Title bar: icon, title, drag (DnD), double-click maximize, `WindowControls` (─□×).  
`window.shell` selects inner chrome (`word`, `folder`, `ie`, `pdf`, …).  
Sizes: `src/constants/xpWindow.js`. `compactFrame` for Calculator.

### Zustand

- **`useShellStore`:** `runningPrograms`, `windowFramePositions`, start menu, wallpapers, dialogs.
- **`useDesktopIconStore`:** `positions`, `resetIconPositions`.

### React DnD

`DndProvider` in `main.jsx`. `useDrag` + `useDragLayer` in `WindowFrame` only.

### File map

| File | Role |
|------|------|
| `src/registry/apps.js` | App catalog |
| `src/utils/windowStackUrl.js` | URL stack |
| `src/stores/useShellStore.js` | Shell + taskbar + window positions |
| `src/stores/useDesktopIconStore.js` | Icon positions |
| `src/components/window/WindowFrame.jsx` | Frame + controls + drag |
| `src/components/window/BackgroundWindows.jsx` | Stacked windows |
| `src/components/window/windowRegistry.jsx` | Stack key → content/options |
| `src/components/taskbar/TaskbarPrograms.jsx` | Taskbar logic |
| `src/components/layouts/DesktopShell.jsx` | Shell + outlet |
| `src/components/layouts/AppLayout.jsx` | Desktop + icons |
