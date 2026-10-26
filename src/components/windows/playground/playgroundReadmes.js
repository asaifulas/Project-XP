/**
 * Word README bodies for Playground apps — written for engineers who open the docs.
 * @typedef {{ title: string, subtitle: string, idea: string, tech: string[], howItWorks: string[], notes: string[] }} PlaygroundReadme
 */

/** @type {Record<string, PlaygroundReadme>} */
export const PLAYGROUND_READMES = {
  readme_pinball: {
    title: '3D Pinball — README',
    subtitle: 'Space Cadet–inspired table in a URL-stacked XP window',
    idea:
      'Bring the nostalgic “3D Pinball for Windows — Space Cadet” vibe into this portfolio without shipping proprietary assets. The table is a custom 2D/pseudo-3D canvas playfield with flippers, plungers, bumpers, and scoring — playable with keyboard on desktop and on-screen pads on phone.',
    tech: [
      'Canvas 2D render loop (requestAnimationFrame)',
      'Custom rigid-body-ish physics: gravity, restitution, segment/circle collisions',
      'React.lazy + Suspense so the shell never pays pinball cost on first paint',
      'Pointer Events + hold-to-flip pads via shared GameControlPad',
      'Same apps registry / window stack as Calculator and Winamp',
    ],
    howItWorks: [
      'table.js describes static geometry (walls, slingshots, targets) in table space.',
      'physics.js integrates velocity, resolves collisions, and emits score events immutably where state is copied per tick.',
      'balls.js tracks active balls; drain → ball loss → plungers for the next launch.',
      'render.js paints the table, ball, and HUD; PinballApp owns the frame loop and input map.',
      'Phone layout (usePhoneGameLayout) docks flipper/plunge controls under the table so the soft keyboard never appears.',
    ],
    notes: [
      'Not a DirectX remake — geometry and art are original, inspired by the era.',
      'Maximize is allowed; the table keeps aspect so physics space stays coherent.',
      'Unit tests cover collision helpers in physics.test.js.',
    ],
  },
  readme_minesweeper: {
    title: 'Minesweeper — README',
    subtitle: 'Classic flood-fill minefield with XP chrome and touch-first flags',
    idea:
      'Recreate the accessory everyone lost hours to: click to reveal, chord to clear neighbors, flag the bombs. On phone there is no right-click — long-press or an explicit flag mode replaces RMB so the game stays fair on glass.',
    tech: [
      'Pure board model (immutable cell grids) separate from React view',
      'Flood-fill reveal for zero-adjacency empties',
      'Chord / dual-button semantics on desktop; flag tool + long-press on touch',
      'Compact Luna frame, beige client, 11px Tahoma-ish XP font',
      'Lazy-loaded MinesweeperApp via the apps registry',
    ],
    howItWorks: [
      'First click is always safe — mine placement is deferred until the opening dig.',
      'Each cell stores mine / adjacent count / revealed / flagged; UI maps state to XP-like sprites/CSS.',
      'Timer and remaining-mine counter tick from first reveal; win when all non-mines are open.',
      'Difficulty presets (Beginner / Intermediate / Expert) rebuild the board immutably.',
    ],
    notes: [
      'Open empty cells use a soft green tint so “cleared” reads clearly vs closed steel tiles.',
      'Hit targets stay ≥44px on phone so fat-finger play does not misflag.',
    ],
  },
  readme_solitaire: {
    title: 'Solitaire — README',
    subtitle: 'Klondike rules, card faces, and a teal felt table',
    idea:
      'Ship Windows Solitaire (Klondike) as a real window: stock/waste, seven tableau piles, four foundations. Drag stacks when legal; double-click or auto-move to foundations when obvious. Same phone constraints — large cards, no hover-only affordances.',
    tech: [
      'Immutable Klondike engine (klondike.js) — deal, draw, move, win checks',
      'Deterministic deck shuffle (deck.js) for reproducible deals in tests',
      'CardFace.jsx for ranks/suits without shipping trademarked card art',
      'Pointer drag with legal-drop highlighting; click-to-move fallback on coarse pointers',
      'klondike.test.js for deal integrity and move legality',
    ],
    howItWorks: [
      'State is a plain object: stock, waste, foundations[4], tableau[7]. Reducers return new copies — no in-place pile mutation.',
      'Draw cycles stock→waste; redeal waste→stock when empty (classic XP draw-1 / draw-3 can be toggled if enabled).',
      'Tableau builds descending alternating colors; foundations ascend by suit from Ace.',
      'Win detection: all 52 cards on foundations → victory chrome.',
    ],
    notes: [
      'Felt background (#008080 family) echoes the XP default table color.',
      'Lazy load keeps the card engine out of the initial JS graph.',
    ],
  },
  readme_winamp: {
    title: 'Winamp — README',
    subtitle: 'Skinned audio player with a local Vite-bundled playlist',
    idea:
      'Classic Winamp energy inside the portfolio: custom chrome (no XP title bar), playlist window energy, and real audio playback. Bundle tracks from src/assets/songs and let visitors upload their own files into a session playlist.',
    tech: [
      'HTMLAudioElement + playlist state in Zustand-adjacent / local React state',
      'WindowFrame chrome="none" + FramelessWindowContext drag handle',
      'Vite import.meta.glob(?url) via loadSongTracks.js — no audio API server',
      'URL window stack still owns minimize/close like every other app',
    ],
    howItWorks: [
      'At build/dev time, song files become hashed URL strings and seed the default playlist.',
      'User uploads append File/Blob URLs for the session; playback advances with next/prev and ends-at-track hooks.',
      'Skin buttons call the same onMinimize / onClose the XP frame would — taskbar + otherurl stay consistent.',
    ],
    notes: [
      'Fixed compact width (~278px) matches the classic main window proportions.',
      'Still lives on the desktop for one-click nostalgia; Playground → Applications mirrors the shortcut.',
    ],
  },
  readme_paint: {
    title: 'Paint — README',
    subtitle: 'MS Paint–inspired raster editor with XP tool layout',
    idea:
      'A small bitmap playground: pencil, brush, shapes, fill, eraser, color box, magnifier. Feels like untitled - Paint, including the tool well and status strip — tuned so maximize + phone fill do not break the canvas coordinate space.',
    tech: [
      'Canvas 2D drawing surface with devicePixelRatio scaling',
      'Tool state machine (pencil, brush, line, rect, ellipse, fill, eraser, pick, magnify)',
      'Flood-fill for paint-bucket; yellow eraser (#f2d84a) for visibility on white',
      'Cursor maps per tool; resize/magnify preserve logical bitmap size',
      'WindowFrame compactFrame + fillsViewport flex so maximize uses the client area',
    ],
    howItWorks: [
      'Pointer down/move/up map CSS pixels → bitmap pixels via the current zoom.',
      'Shape tools preview on a scratch layer then commit on pointer up.',
      'Undo stack stores ImageData snapshots (bounded) for Accidents Happened recovery.',
      'Phone: large toolbox hit targets; tools stay usable without a mouse.',
    ],
    notes: [
      'Filed under Playground → Applications (accessory energy, not a “game”).',
      'Not a full GDI clone — enough tools to doodle and show canvas craft.',
    ],
  },
  readme_certimagic: {
    title: 'CertiMagic — README',
    subtitle: 'Excel-skinned workbook for certificate / credential storytelling',
    idea:
      'CertiMagic presents certifications and credential-ish data inside a fake Excel workbook shell — sheet tabs, grid chrome, and the same Luna office vibe as other Office spoofs — so recruiters get a playful but scannable artifact.',
    tech: [
      'Custom Excel-look shell (shell: certimagic) inside WindowFrame',
      'Sheet tab UI owned by the app; data rows as structured JS',
      'Registry entry alongside real Excel/Word spoofs for consistent Start/desktop behavior',
    ],
    howItWorks: [
      'Opening CertiMagic mounts CertiMagicApp in the office chrome; tabs switch in-app views without new routes.',
      'Content is static portfolio data (certs, issuers, dates) rendered as spreadsheet rows.',
      'Stack/background rendering uses the same renderStack path as other Office apps.',
    ],
    notes: [
      'Desktop icon stays for discoverability; Playground → Applications keeps the folder taxonomy tidy.',
      'Icon uses the plated modern mark treatment on the XP desktop.',
    ],
  },
}
