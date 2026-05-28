import { createElement } from 'react'
import AboutPage from '../pages/AboutPage'
import BiodataPage from '../pages/BiodataPage'
import CalculatorPage from '../pages/CalculatorPage'
import FolderPage from '../pages/FolderPage'
import HomePage from '../pages/HomePage'
import JourneyPage from '../pages/JourneyPage'
import PdfPage from '../pages/PdfPage'
import WinampPage from '../pages/WinampPage'

import calculatorIcon from '../assets/icons/calculator.svg'
import docIcon from '../assets/icons/doc.png'
import ieIcon from '../assets/icons/ie.png'
import myComputerIcon from '../assets/icons/my_computer.png'
import myDocsIcon from '../assets/icons/my_doc.png'
import pdfIcon from '../assets/icons/pdf.png'
import pptIcon from '../assets/icons/ppt.png'
import recycleIcon from '../assets/icons/recycle.png'
import whatsappIcon from '../assets/icons/whatsapp.svg'
import linkedinIcon from '../assets/icons/linkedin.svg'
import gmailIcon from '../assets/icons/gmail.svg'
import githubIcon from '../assets/icons/github.svg'
import winampIcon from '../assets/icons/winamp.png'
import xlsIcon from '../assets/icons/xls.png'
import wordIcon from '../assets/icons/word.png'
import excelIcon from '../assets/icons/excel.png'
import ppIcon from '../assets/icons/pp.png'

import CalculatorApp from '../components/apps/calculator/CalculatorApp'
import ExcelApp from '../components/apps/excel/ExcelApp'
import FolderApp from '../components/apps/folder/FolderApp'
import InternetExplorerApp from '../components/apps/ie/InternetExplorerApp'
import PdfReaderApp from '../components/apps/pdf/PdfReaderApp'
import WinampApp from '../components/apps/winamp/WinampApp'
import AboutWindowContent from '../components/windows/AboutWindowContent'
import BiodataWindowContent from '../components/windows/BiodataWindowContent'
import BlankPowerPointContent from '../components/windows/BlankPowerPointContent'
import BlankWordContent from '../components/windows/BlankWordContent'
import JourneyWindowContent from '../components/windows/JourneyWindowContent'

import resumePdfUrl from '../assets/mine/Latest Resume Saiful.pdf?url'

export const EXTERNAL_URLS = {
  whatsapp:
    'https://api.whatsapp.com/send/?phone=%2B60133321415&text=Hi,%20I%20come%20from%20your%20portfolio&type=phone_number&app_absent=0',
  linkedin: 'https://www.linkedin.com/in/ahmad-saifullah-arifin-93332212a/',
  gmail: 'mailto:asaifulas@gmail.com',
  github: 'https://github.com/asaifulas',
}

/**
 * Window chrome presets (extend with excel, powerpoint, folder, etc.).
 * @typedef {'default' | 'word' | 'excel' | 'ppt' | 'pdf' | 'folder' | 'ie'} WindowShell
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
 * - Restored (non-maximized) frame size: 1440×1080 from `src/constants/xpWindow.js` (`shell: 'folder'` → 1024×768) unless `window.className` / `compactFrame` specialize (e.g. Calculator, Winamp).
 * - `window.compactFrame` (optional): when true, no fixed standard height — window hugs content (Calculator).
 * - `children` (optional): for `shell: 'folder'`, an array of `APPS[].id` to show as shortcuts inside the folder (not yet wired to UI).
 * - `externalUrl` (optional): desktop shortcut opens in a new tab (`noopener,noreferrer`); no route/window.
 * - Disambiguate same `path` with `?app=<id>` (see `openForegroundPreserveStack(..., appId)`).
 * - `APPS` order: `home` first, then rows with `desktop` ascending by `desktop.order` (ties: stable id order). Bare URLs with duplicate `path` resolve via `getAppFromLocation` to the row whose `id` equals the path segment (e.g. `/biodata` → `biodata`).
 */
export const APPS = [
  {
    id: 'home',
    path: '/',
    page: HomePage,
    stackable: false,
  },
  {
    id: 'my_computer',
    path: '/about',
    page: AboutPage,
    title: 'My Computer',
    icon: myComputerIcon,
    group: 'Office',
    desktop: { label: 'My Computer', order: 1 },
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
    desktop: { label: 'My Document', order: 2 },
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
    desktop: { label: 'Internet Explorer', order: 3 },
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
    desktop: { label: 'Winamp', order: 4 },
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
    id: 'gallery_folder',
    path: '/gallery',
    page: FolderPage,
    title: 'Gallery',
    icon: myDocsIcon,
    group: 'Gallery',
    desktop: { label: 'Gallery', order: 5 },
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
    id: 'office_word',
    path: '/biodata',
    page: BiodataPage,
    title: 'Document1 - Microsoft Word',
    icon: wordIcon,
    group: 'Office',
    desktop: { label: 'Microsoft Word', order: 6 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'word',
    },
    renderStack: () => createElement(BlankWordContent),
  },
  {
    id: 'office_excel',
    path: '/biodata',
    page: BiodataPage,
    title: 'Book1 - Microsoft Excel',
    icon: excelIcon,
    group: 'Office',
    desktop: { label: 'Microsoft Excel', order: 7 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'excel',
    },
    renderStack: () => createElement(ExcelApp),
  },
  {
    id: 'office_ppt',
    path: '/biodata',
    page: BiodataPage,
    title: 'Presentation1 - Microsoft PowerPoint',
    icon: ppIcon,
    group: 'Office',
    desktop: { label: 'Microsoft PowerPoint', order: 8 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'ppt',
    },
    renderStack: () => createElement(BlankPowerPointContent),
  },
  {
    id: 'journey',
    path: '/journey',
    page: JourneyPage,
    title: 'My_Journey.doc - Microsoft Word',
    icon: docIcon,
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
  {
    id: 'biodata',
    path: '/biodata',
    page: BiodataPage,
    title: 'Document1 - Microsoft Word',
    icon: docIcon,
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
    icon: xlsIcon,
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
    icon: pptIcon,
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
    id: 'whatsapp',
    desktop: { label: 'WhatsApp', order: 15 },
    icon: whatsappIcon,
    group: 'Connect',
    externalUrl: EXTERNAL_URLS.whatsapp,
    stackable: false,
  },
  {
    id: 'linkedin',
    desktop: { label: 'LinkedIn', order: 16 },
    icon: linkedinIcon,
    group: 'Connect',
    externalUrl: EXTERNAL_URLS.linkedin,
    stackable: false,
  },
  {
    id: 'gmail',
    desktop: { label: 'Gmail', order: 17 },
    icon: gmailIcon,
    group: 'Connect',
    externalUrl: EXTERNAL_URLS.gmail,
    stackable: false,
  },
  {
    id: 'github',
    desktop: { label: 'GitHub', order: 18 },
    icon: githubIcon,
    group: 'Connect',
    externalUrl: EXTERNAL_URLS.github,
    stackable: false,
  },
  {
    id: 'about',
    path: '/about',
    page: AboutPage,
    title: 'Document1 - Microsoft Word',
    icon: docIcon,
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
]

export const ROUTES = APPS.filter((app) => app.page && app.path).map((app) => ({
  id: app.id,
  path: app.path,
  element: app.page,
}))

function appForBarePath(pathname) {
  const samePath = APPS.filter((app) => app.path === pathname)
  if (samePath.length === 0) return null
  if (samePath.length === 1) return samePath[0]
  const segment = pathname.replace(/^\//, '').replace(/-/g, '_') || ''
  return samePath.find((a) => a.id === segment) ?? samePath[0]
}

export function getAppByPath(pathname) {
  return appForBarePath(pathname)
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
  return appForBarePath(pathname)
}

export function getDesktopApps() {
  return APPS.filter((app) => app.desktop)
    .slice()
    .sort((a, b) => (a.desktop?.order ?? 0) - (b.desktop?.order ?? 0))
}
