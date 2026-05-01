# PLAN — Windows XP Portfolio (React)

## Vision
Build a personal portfolio website that **feels like Windows XP**: a desktop, draggable windows, a taskbar with a Start menu, and “apps” that present your bio and projects in a playful, nostalgic UI.

## Core UX pillars
- **Desktop-first**: landing experience is a desktop with wallpaper, icons, and windows.
- **Window manager**: windows can open/close, focus, drag, minimize/maximize, and restore.
- **Taskbar**: Start button, running programs, and a “system tray”.
- **Fast + crisp**: snappy interactions, no heavy pages, minimal route changes.
- **Accessible enough**: keyboard focus, escape-to-close, basic ARIA for menus/dialogs.

## Tech stack (current + planned)
- **React**: UI
- **React Router**: routing + URL-backed window stack
- **Zustand**: global state (taskbar, running programs, window positions)
- **Tailwind CSS**: utility styling + theming tokens (XP look via custom CSS variables)
- **React DnD**: drag and drop for windows

## Information architecture
There are two concepts:
1. **Desktop shell**: always mounted (wallpaper + icons + taskbar).
2. **Window stack**: encoded in the URL so multiple windows can remain open.

### URL window stack (current)
- **Foreground (active) window**: the pathname (`/about`, `/biodata`, `/calculator`).
- **Background (inactive) windows**: repeated `otherurl` query params.
  - Example: `/calculator?otherurl=%2Fbiodata&otherurl=%2Fabout`

## Layouts
### `DesktopShell` + `AppLayout` (desktop shell)
- `DesktopShell.jsx`: renders `AppLayout`, then:
  - `BackgroundWindows` (inactive windows from `otherurl`)
  - `<Outlet />` (active route window)
- `AppLayout.jsx`: wallpaper + desktop icons + taskbar + context menu

## Window system (state + behavior)
### Running programs (taskbar)
Zustand keeps `runningPrograms` in sync with mounted `WindowFrame`s:
- `id`, `title`, `active`, `minimized`

### Window position persistence (current)
Zustand keeps last committed `{x,y}` per `programId` in `windowFramePositions`.
This prevents windows from “jumping” when switching active ↔ background.

## Components (planned folder structure)
### Current folder highlights
- `src/components/layouts/`: `DesktopShell`, `AppLayout`
- `src/components/window/`: `WindowFrame`, `BackgroundWindows`, `windowRegistry`
- `src/components/windows/`: reusable content blocks used by both route pages + background windows
- `src/utils/windowStackUrl.js`: stack helpers

## Apps (content + interactions)
- **Word (Biodata)**: “document” view; your story, skills, contact.
- **Word (About)**: about page in a Word-like frame.
- **Calculator**: keyboard support; XP look.
- **Music player**: minimal playlist and play/pause (can be mock first).
- **Photo gallery**: a dedicated window/app—grid or carousel of images, lightbox or inline preview, optional captions and lazy loading; fits the XP “program” metaphor (e.g. *My Pictures* or a simple *Photo Viewer*).
- **Classic games** (each as its own window/app, timeboxed per title):
  - **Solitaire**: Klondike-style or simplified rules; card sprites, undo, win state.
  - **Pinball**: compact table physics (canvas or DOM); score, flippers, ball reset—can start as a minimal “Space Cadet–inspired” loop before full table art.
  - **Minesweeper**: classic grid, chord/reveal rules, timer + mine counter, difficulty presets (Beginner / Intermediate / Expert).

## Theming (XP look)
- XP palette via CSS variables (blue taskbar, beveled borders, gradients).
- Window frame styles: classic bevel + inset/outset shadows.
- Fonts: system font stack with optional Windows-like fallback.

## Milestones (recommended build order)
### Done (current)
- Desktop shell + taskbar + start menu
- URL-backed multi-window stack (`otherurl`)
- Draggable windows (React DnD)
- Calculator + Biodata + About

### Next
- Add “Projects” app + more desktop shortcuts
- Add resize support + z-order polish
- Persist stack + positions to localStorage (optional)
- Icon dragging + grid snapping

### Photo gallery
- Register app in `apps.js` + route; window content under `src/components/windows/` (or `src/components/gallery/` if it grows).
- Asset strategy: `public/` vs bundled imports; thumbnails + full-size lazy load.
- UX: keyboard navigation in lightbox, focus trap, `Escape` to close.

### Classic games (Solitaire, Pinball, Minesweeper)
- **Shared**: each game is a normal routed window (same stack/taskbar rules); own folder under `src/components/games/<name>/`.
- **Solitaire**: state model (deck, piles, drag rules); start with single suit / smaller deck if needed.
- **Pinball**: fixed timestep or `requestAnimationFrame` loop; collision as rectangles first, polish visuals later.
- **Minesweeper**: seeded RNG for replayable boards; first-click safe rule optional.
- **Order suggestion**: Minesweeper (smallest scope) → Solitaire → Pinball (most physics/art).

### Polish + delight
- Sounds (optional)
- Boot/loading screen (optional)
- Animations + accessibility pass

## Non-goals (for now)
- Full XP file system simulation
- Multi-monitor / advanced window snapping
- User accounts / auth

## Decisions / open questions
- Content source: hardcoded JSON vs markdown files for bio/projects.
- Persist state (localStorage): window positions, theme toggles, last opened apps.

