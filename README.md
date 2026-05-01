# Windows XP Portfolio (React)

Personal portfolio website inspired by **Windows XP**: a desktop UI, draggable windows, a taskbar (Start button + running apps + tray), and “apps” that showcase bio, projects, and fun mini tools.

## Status
- **Desktop shell**: implemented (`AppLayout` + `DesktopShell`)
- **Windows**: draggable `WindowFrame` with minimize/close (select apps also use custom chrome)
- **Window stack in URL**: implemented (`otherurl` query params + `app` disambiguation)
- **Taskbar**: Start button/menu + running programs

## Tech stack
- **React 19**: UI rendering + stateful components
- **React Router**: routes represent the *foreground* window; URL encodes the multi-window stack
- **Zustand**: small global store for “shell” state (running programs, active window, window positions, wallpaper)
- **Tailwind CSS + custom CSS**: XP look-and-feel with utility classes plus a few handcrafted styles
- **React DnD (HTML5 backend)**: drag behavior for windows (pointer-driven window movement)
- **Vite**: fast dev server + builds; also used for importing local audio assets via `import.meta.glob`

## Project structure (current)
- `src/main.jsx`: mounts router + DnD provider
- `src/App.jsx`: router (routes nested under `DesktopShell`)
- `src/components/layouts/`:
  - `DesktopShell.jsx`: keeps desktop mounted, renders background windows + active route
  - `AppLayout.jsx`: wallpaper + desktop icons + taskbar
- `src/components/window/`:
  - `WindowFrame.jsx`: draggable window frame
  - `BackgroundWindows.jsx`: renders inactive windows from URL
  - `windowRegistry.jsx`: maps path → title/body/options
- `src/pages/`: active window routes (`/about`, `/biodata`, `/calculator`, `/winamp`)
- `src/components/windows/`: reusable window content
- `src/components/apps/`: “apps” that can be mounted as foreground routes or background stacked windows
  - `apps/winamp/`: Winamp-style audio player skin + logic
  - `apps/calculator/`: XP Calculator implementation
- `src/utils/windowStackUrl.js`: URL window stack helpers (`otherurl`)
- `src/utils/loadSongTracks.js`: Vite-powered loader for `src/assets/songs/*` playlist entries
- `src/stores/useShellStore.js`: taskbar + running programs + window positions

## Getting started
Install deps:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Product plan
See `PLAN.md` for architecture and roadmap.

## Notes
- **Node version**: this repo is currently set up to work on **Node 18** (Vite 5). If you upgrade Node to 20+, we can bump tooling later.

## Architecture: “Windows” as routes + URL stack
This project treats the browser URL as the **source of truth for which windows are open**.

- **Foreground window**: the current route pathname (e.g. `/calculator`, `/winamp`)
- **Background windows**: repeated `otherurl` query params (each entry is a “stack key”)
- **Stack key**: a pathname plus an optional `app` query (used to disambiguate multiple desktop icons pointing at the same route)
  - Example stack key: `/about?app=my_computer`

### Example URL
Calculator in front with Biodata and About behind it:

`/calculator?otherurl=%2Fbiodata&otherurl=%2Fabout%3Fapp%3Dmy_computer`

### Why encode the window stack in the URL?
- **Shareable state**: you can copy/paste the URL and get the same set of windows.
- **Back/forward works**: browser history naturally becomes “window history”.
- **No hidden state bugs**: refreshing the page doesn’t lose which windows were open.
- **Easy stacking model**: open/activate/close operations are pure transforms over `(pathname, search)`.

## Window system logic (key pieces)
- **`DesktopShell`**: always mounted; paints the desktop chrome and then renders:
  - **`BackgroundWindows`**: windows from `otherurl` (inactive)
  - **`<Outlet />`**: the active route window (foreground)
- **`WindowFrame`**: one window container with:
  - dragging via React DnD
  - minimize/close interactions wired to the shell store and URL stack helpers
  - optional “chrome mode” (XP frame vs custom)
- **`windowStackUrl.js`**: the important operations:
  - `openForegroundPreserveStack(...)`: open a route while pushing the current foreground into `otherurl`
  - `activateBackgroundWindow(...)`: bring a background `otherurl` entry to the front
  - `closeWindowAtPath(...)`: close the foreground or a background entry and promote the next one
  - `stackKeyFromLocation(location)`: ensures close/activate actions work even when `?app=...` is present

## Custom window chrome (Winamp)
Winamp intentionally uses a **custom skin** instead of the default XP frame.

- `WindowFrame` supports `chrome="none"`:
  - no XP title bar
  - the app draws its own top bar and buttons (minimize/close)
- `FramelessWindowContext` exposes:
  - `attachDragRef`: lets the skin define the drag handle area
  - `onMinimize` / `onClose`: connects custom buttons to the same window lifecycle

### Advantages of custom chrome
- **Pixel-perfect UI** for skinned apps (Winamp-style) without fighting the default frame.
- **Consistent behavior**: minimize/close still updates taskbar state and URL stack like every other window.

## Audio + local playlist loading (Winamp)
Winamp loads songs from `src/assets/songs/` at build time.

- `loadSongTracks()` uses Vite’s `import.meta.glob(..., { query: '?url' })` to turn audio files into URL strings.
- This means:
  - **no server API needed**
  - files are bundled/hashed for caching in production
  - playlist updates when you add/remove files and restart dev/build

### Add songs
Put audio files here:
- `src/assets/songs/*.mp3` (also supports `ogg`, `wav`, `m4a`, `aac`)
