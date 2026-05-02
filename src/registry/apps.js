import { createElement } from 'react'
import HomePage from '../pages/HomePage'
import AboutPage from '../pages/AboutPage'
import BiodataPage from '../pages/BiodataPage'
import JourneyPage from '../pages/JourneyPage'
import CalculatorPage from '../pages/CalculatorPage'
import WinampPage from '../pages/WinampPage'
import PdfPage from '../pages/PdfPage'
import FolderPage from '../pages/FolderPage'

import calculatorIcon from '../assets/icons/calculator.svg'
import wordIcon from '../assets/icons/word.png'
import excelIcon from '../assets/icons/excel.png'
import ppIcon from '../assets/icons/pp.png'
import myComputerIcon from '../assets/icons/my_computer.png'
import myDocsIcon from '../assets/icons/my_doc.png'
import winampIcon from '../assets/icons/winamp.png'
import recycleIcon from '../assets/icons/recycle.png'
import ieIcon from '../assets/icons/ie.png'
import pdfIcon from '../assets/icons/pdf.png'

import AboutWindowContent from '../components/windows/AboutWindowContent'
import BiodataWindowContent from '../components/windows/BiodataWindowContent'
import JourneyWindowContent from '../components/windows/JourneyWindowContent'
import CalculatorApp from '../components/apps/calculator/CalculatorApp'
import WinampApp from '../components/apps/winamp/WinampApp'
import ExcelApp from '../components/apps/excel/ExcelApp'
import PdfReaderApp from '../components/apps/pdf/PdfReaderApp'
import FolderApp from '../components/apps/folder/FolderApp'
import InternetExplorerApp from '../components/apps/ie/InternetExplorerApp'

import resumePdfUrl from '../assets/mine/Latest Resume Saiful.pdf?url'

/**
 * Window chrome presets (extend with excel, powerpoint, folder, etc.).
 * @typedef {'default' | 'word' | 'excel' | 'pdf' | 'folder' | 'ie'} WindowShell
 */

/**
 * Single source of truth for routes, desktop shortcuts, and window metadata.
 *
 * Notes:
 * - We keep route `Page` components for now (under `src/pages/`).
 * - Background windows render *content* (not full pages), so we also map `renderStack`.
 * - `window.shell`: host-specific layout inside the XP frame (Word = A4 page, toolbars).
 * - `window.explorerAddressPath` (optional): when `shell: 'folder'`, text shown in the address bar.
 * - `window.initialUrl` (optional): when `shell: 'ie'`, default URL for the fake browser.
 * - Restored (non-maximized) frame size: 800×600 from `src/constants/xpWindow.js` unless `window.className` sets a custom width (e.g. Calculator).
 * - `window.compactFrame` (optional): when true, no fixed 600px height — window hugs content (Calculator).
 * - `children` (optional): for `shell: 'folder'`, an array of `APPS[].id` to show as shortcuts inside the folder (not yet wired to UI).
 * - Disambiguate same `path` with `?app=<id>` (see `openForegroundPreserveStack(..., appId)`).
 */
export const APPS = [
  {
    id: 'home',
    path: '/',
    page: HomePage,
    stackable: false,
  },
  {
    id: 'about',
    path: '/about',
    page: AboutPage,
    title: 'Document1 - Microsoft Word',
    icon: wordIcon,
    group: 'Office',
    desktop: { label: 'About_Me.doc', order: 20 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'word',
    },
    renderStack: () => createElement(AboutWindowContent),
  },
  {
    id: 'my_computer',
    path: '/about',
    page: AboutPage,
    title: 'My Computer',
    icon: myComputerIcon,
    group: 'Office',
    desktop: { label: 'My Computer', order: 5 },
    stackable: true,
    children: [],
    window: {
      showMenuBar: false,
      className: '',
      shell: 'folder',
      explorerAddressPath: 'My Computer',
    },
    renderStack: () => createElement(AboutWindowContent),
  },
  {
    id: 'my_docs',
    path: '/about',
    page: AboutPage,
    title: 'My Documents',
    icon: myDocsIcon,
    group: 'Office',
    desktop: { label: 'My Document', order: 7 },
    stackable: true,
    children: [],
    window: {
      showMenuBar: false,
      className: '',
      shell: 'folder',
      explorerAddressPath: 'C:\\Documents and Settings\\My Documents',
    },
    renderStack: () => createElement(AboutWindowContent),
  },
  {
    id: 'ie',
    path: '/about',
    page: AboutPage,
    title: 'Internet Explorer',
    icon: ieIcon,
    group: 'Office',
    desktop: { label: 'Internet Explorer', order: 8 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'ie',
      initialUrl: 'https://app.inerva.my',
    },
    renderStack: ({ app }) =>
      createElement(InternetExplorerApp, {
        initialUrl: app?.window?.initialUrl ?? 'https://app.inerva.my',
      }),
  },
  {
    id: 'winamp',
    path: '/winamp',
    page: WinampPage,
    title: 'Winamp',
    icon: winampIcon,
    group: 'Office',
    desktop: { label: 'Winamp', order: 8 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: 'w-[278px]',
      chrome: 'none',
      shell: 'default',
      allowMaximize: false,
    },
    renderStack: () => createElement(WinampApp),
  },
  {
    id: 'recycle',
    path: '/about',
    page: AboutPage,
    title: 'Recycle Bin',
    icon: recycleIcon,
    group: 'Office',
    desktop: { label: 'Recycle Bin', order: 999 },
    stackable: true,
    window: {
      showMenuBar: true,
      className: '',
      shell: 'default',
    },
    renderStack: () => createElement(AboutWindowContent),
  },
  {
    id: 'biodata',
    path: '/biodata',
    page: BiodataPage,
    title: 'Document1 - Microsoft Word',
    icon: wordIcon,
    group: 'Office',
    desktop: { label: 'Biodata.doc', order: 10 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'word',
    },
    renderStack: () => createElement(BiodataWindowContent),
  },
  {
    id: 'project',
    path: '/biodata',
    page: BiodataPage,
    title: 'Projects.xls - Microsoft Excel',
    icon: excelIcon,
    group: 'Office',
    desktop: { label: 'Projects.xls', order: 10 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'excel',
    },
    renderStack: () => createElement(ExcelApp),
  },
  {
    id: 'side_project',
    path: '/biodata',
    page: BiodataPage,
    title: 'Side_Projects.ppt - Microsoft PowerPoint',
    icon: ppIcon,
    group: 'Office',
    desktop: { label: 'Side_Projects.ppt', order: 10 },
    stackable: true,
    window: {
      showMenuBar: true,
      className: '',
      shell: 'default',
    },
    renderStack: () => createElement(BiodataWindowContent),
  },
  {
    id: 'calculator',
    path: '/calculator',
    page: CalculatorPage,
    title: 'Calculator',
    icon: calculatorIcon,
    group: 'Accessories',
    desktop: { label: 'Calculator', order: 30 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: 'w-[min(360px,calc(100%-24px))]',
      shell: 'default',
      allowMaximize: false,
      compactFrame: true,
    },
    renderStack: ({ keyboardActive }) =>
      createElement(CalculatorApp, { keyboardActive: Boolean(keyboardActive) }),
  },
  {
    id: 'acrobat_resume',
    path: '/pdf',
    page: PdfPage,
    title: 'Latest Resume Saiful.pdf - Adobe Reader',
    icon: pdfIcon,
    group: 'Office',
    desktop: { label: 'Latest Resume Saiful.pdf', order: 14 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'pdf',
    },
    renderStack: () => createElement(PdfReaderApp, { src: resumePdfUrl }),
  },
  {
    id: 'gallery_folder',
    path: '/gallery',
    page: FolderPage,
    title: 'Gallery',
    icon: myDocsIcon,
    group: 'Gallery',
    desktop: { label: 'Gallery', order: 8 },
    stackable: true,
    /** @type {string[]} Nested app ids (`APPS[].id`); open from inside the folder when implemented */
    children: [],
    window: {
      showMenuBar: false,
      className: '',
      shell: 'folder',
      explorerAddressPath: 'C:\\Documents and Settings\\Gallery',
    },
    renderStack: ({ app }) => createElement(FolderApp, { childAppIds: app?.children ?? [] }),
  },
  {
    id: 'journey',
    path: '/journey',
    page: JourneyPage,
    title: 'My_Journey.doc - Microsoft Word',
    icon: wordIcon,
    group: 'Office',
    desktop: { label: 'My_Journey.doc', order: 9 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'word',
    },
    renderStack: () => createElement(JourneyWindowContent),
  },
]

export const ROUTES = APPS.map((app) => ({
  id: app.id,
  path: app.path,
  element: app.page,
}))

export function getAppByPath(pathname) {
  return APPS.find((app) => app.path === pathname) ?? null
}

export function getAppById(id) {
  return APPS.find((app) => app.id === id) ?? null
}

/**
 * Resolve registry entry for the current URL (`?app=` disambiguates shared paths).
 *
 * @param {string} pathname
 * @param {string} [search]
 */
export function getAppFromLocation(pathname, search = '') {
  const qs = search.startsWith('?') ? search.slice(1) : search
  const id = new URLSearchParams(qs).get('app')
  if (id) {
    const hit = APPS.find((a) => a.id === id && a.path === pathname)
    if (hit) return hit
  }
  return APPS.find((app) => app.path === pathname) ?? null
}

export function getDesktopApps() {
  return APPS.filter((app) => app.desktop)
    .slice()
    .sort((a, b) => (a.desktop?.order ?? 0) - (b.desktop?.order ?? 0))
}

