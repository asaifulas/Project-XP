import { Suspense, createElement, lazy } from 'react'
import AboutPage from '../pages/AboutPage'
import WelcomePage from '../pages/WelcomePage'
import ExperiencePage from '../pages/ExperiencePage'
import BiodataPage from '../pages/BiodataPage'
import CalculatorPage from '../pages/CalculatorPage'
import FolderPage from '../pages/FolderPage'
import HomePage from '../pages/HomePage'
import JourneyPage from '../pages/JourneyPage'
import ProfilePage from '../pages/ProfilePage'
import PdfPage from '../pages/PdfPage'
import WinampPage from '../pages/WinampPage'
import CertiMagicPage from '../pages/CertiMagicPage'
import PinballPage from '../pages/PinballPage'
import SolitairePage from '../pages/SolitairePage'
import MinesweeperPage from '../pages/MinesweeperPage'
import PaintPage from '../pages/PaintPage'
import PlaygroundReadmePage from '../pages/PlaygroundReadmePage'

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
import certiMagicIcon from '../assets/icons/certimagic.png'
import pinballIcon from '../assets/icons/pinball.svg'
import solitaireIcon from '../assets/icons/solitaire.svg'
import minesweeperIcon from '../assets/icons/minesweeper.svg'
import paintIcon from '../assets/icons/paint.svg'

import CalculatorApp from '../components/apps/calculator/CalculatorApp'
import ExcelApp from '../components/apps/excel/ExcelApp'
import FolderApp from '../components/apps/folder/FolderApp'
import InternetExplorerApp from '../components/apps/ie/InternetExplorerApp'
import PdfReaderApp from '../components/apps/pdf/PdfReaderApp'
import WinampApp from '../components/apps/winamp/WinampApp'
import CertiMagicApp from '../components/apps/certimagic/CertiMagicApp'
import MyComputerContent from '../components/apps/folder/MyComputerContent'
import AboutWindowContent from '../components/windows/AboutWindowContent'
import BiodataWindowContent from '../components/windows/BiodataWindowContent'
import BlankPowerPointContent from '../components/windows/BlankPowerPointContent'
import BlankWordContent from '../components/windows/BlankWordContent'
import WelcomeWindowContent from '../components/windows/WelcomeWindowContent'
import JourneyWindowContent from '../components/windows/JourneyWindowContent'
import ProfileWindowContent from '../components/windows/ProfileWindowContent'
import ExperiencePowerPointContent from '../components/windows/ExperiencePowerPointContent'
import PlaygroundReadmeContent from '../components/windows/playground/PlaygroundReadmeContent'

import resumePdfUrl from '../assets/mine/Latest Resume Saiful.pdf?url'
import projectsPdfUrl from '../assets/mine/Projects_Saiful.pdf?url'

const LazyPinballApp = lazy(() => import('../components/games/pinball/PinballApp'))
const LazySolitaireApp = lazy(() => import('../components/games/solitaire/SolitaireApp'))
const LazyMinesweeperApp = lazy(() => import('../components/games/minesweeper/MinesweeperApp'))
const LazyPaintApp = lazy(() => import('../components/games/paint/PaintApp'))

function PinballStackBody({ keyboardActive }) {
  return createElement(
    Suspense,
    {
      fallback: createElement(
        'div',
        {
          className:
            'flex min-h-[280px] flex-1 items-center justify-center bg-[#ece9d8] font-xp text-[11px] text-black',
        },
        'Loading 3D Pinball…',
      ),
    },
    createElement(LazyPinballApp, { keyboardActive: Boolean(keyboardActive) }),
  )
}

function SolitaireStackBody({ keyboardActive }) {
  return createElement(
    Suspense,
    {
      fallback: createElement(
        'div',
        {
          className:
            'flex min-h-[280px] flex-1 items-center justify-center bg-[#008080] font-xp text-[11px] text-white',
        },
        'Loading Solitaire…',
      ),
    },
    createElement(LazySolitaireApp, { keyboardActive: Boolean(keyboardActive) }),
  )
}

function MinesweeperStackBody({ keyboardActive }) {
  return createElement(
    Suspense,
    {
      fallback: createElement(
        'div',
        {
          className:
            'flex min-h-[280px] flex-1 items-center justify-center bg-[#c0c0c0] font-xp text-[11px] text-black',
        },
        'Loading Minesweeper…',
      ),
    },
    createElement(LazyMinesweeperApp, { keyboardActive: Boolean(keyboardActive) }),
  )
}

function PaintStackBody({ keyboardActive }) {
  return createElement(
    Suspense,
    {
      fallback: createElement(
        'div',
        {
          className:
            'flex min-h-[280px] flex-1 items-center justify-center bg-[#c0c0c0] font-xp text-[11px] text-black',
        },
        'Loading Paint…',
      ),
    },
    createElement(LazyPaintApp, { keyboardActive: Boolean(keyboardActive) }),
  )
}

export const EXTERNAL_URLS = {
  whatsapp:
    'https://api.whatsapp.com/send/?phone=%2B60133321415&text=Hi,%20I%20come%20from%20your%20portfolio&type=phone_number&app_absent=0',
  linkedin: 'https://www.linkedin.com/in/ahmad-saifullah-arifin-93332212a/',
  gmail: 'mailto:asaifulas@gmail.com',
  github: 'https://github.com/asaifulas',
}

/**
 * Window chrome presets (extend with excel, powerpoint, folder, etc.).
 * @typedef {'default' | 'word' | 'excel' | 'ppt' | 'ppt-full' | 'pdf' | 'folder' | 'ie' | 'certimagic'} WindowShell
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
 * - `children` (optional): for `shell: 'folder'`, an array of `APPS[].id` shown as launchable shortcuts in `FolderApp`.
 * - `folderLabel` (optional): label inside a parent folder when `desktop` is omitted.
 * - `readmeId` (optional): key into playground README docs for Word shells on `/readme`.
 * - `externalUrl` (optional): desktop shortcut opens in a new tab (`noopener,noreferrer`); no route/window.
 * - Disambiguate same `path` with `?app=<id>` (see `openForegroundPreserveStack(..., appId)`).
 * - `APPS` order: `home` first, then rows with `desktop` ascending by `desktop.order` (ties: stable id order). Bare URLs with duplicate `path` resolve via `getAppFromLocation` to the row whose `id` equals the path segment (e.g. `/biodata` → `biodata`).
 */

function folderApp({
  id,
  title,
  folderLabel,
  children = [],
  explorerAddressPath,
  desktop = undefined,
  path = '/folder',
}) {
  return {
    id,
    path,
    page: FolderPage,
    title,
    icon: myDocsIcon,
    group: 'Playground',
    folderLabel: folderLabel ?? title,
    ...(desktop ? { desktop } : {}),
    stackable: true,
    children,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'folder',
      explorerAddressPath,
    },
    renderStack: ({ app }) => createElement(FolderApp, { childAppIds: app?.children ?? [] }),
  }
}

function playgroundReadme({ id, fileName, readmeId }) {
  return {
    id,
    path: '/readme',
    page: PlaygroundReadmePage,
    title: `${fileName} - Microsoft Word`,
    icon: docIcon,
    group: 'Playground',
    folderLabel: fileName,
    readmeId,
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'word',
    },
    renderStack: () => createElement(PlaygroundReadmeContent, { docId: readmeId }),
  }
}

export const APPS = [
  {
    id: 'home',
    path: '/',
    page: HomePage,
    stackable: false,
  },
  {
    id: 'welcome',
    path: '/welcome',
    page: WelcomePage,
    title: 'Welcome.doc - Microsoft Word',
    icon: docIcon,
    group: 'Office',
    desktop: { label: 'Welcome.doc', order: 8.2 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'word',
    },
    renderStack: () => createElement(WelcomeWindowContent),
  },
  {
    id: 'my_computer',
    path: '/my_computer',
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
      explorerVariant: 'myComputer',
    },
    renderStack: () => createElement(MyComputerContent),
  },
  {
    id: 'my_docs',
    path: '/my_documents',
    page: FolderPage,
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
    renderStack: ({ app }) => createElement(FolderApp, { childAppIds: app?.children ?? [] }),
  },
  {
    id: 'ie',
    path: '/internet_explorer',
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
      initialUrl: 'https://penyulabs.com',
    },
    renderStack: ({ app }) =>
      createElement(InternetExplorerApp, {
        initialUrl: app?.window?.initialUrl ?? 'https://penyulabs.com',
      }),
  },
  {
    id: 'winamp',
    path: '/winamp',
    page: WinampPage,
    title: 'Winamp',
    icon: winampIcon,
    group: 'Office',
    folderLabel: 'Winamp',
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
    children: [],
    window: {
      showMenuBar: false,
      className: '',
      shell: 'folder',
      explorerAddressPath: 'C:\\Documents and Settings\\Gallery',
    },
    renderStack: ({ app }) => createElement(FolderApp, { childAppIds: app?.children ?? [] }),
  },
  folderApp({
    id: 'playground_folder',
    path: '/playground',
    title: 'Playground',
    folderLabel: 'Playground',
    desktop: { label: 'Playground', order: 5.5 },
    children: ['playground_games', 'playground_applications', 'playground_webpage'],
    explorerAddressPath: 'C:\\Documents and Settings\\Desktop\\Playground',
  }),
  folderApp({
    id: 'playground_games',
    title: 'Games',
    folderLabel: 'Games',
    children: ['playground_pinball', 'playground_minesweeper', 'playground_solitaire'],
    explorerAddressPath: 'C:\\Documents and Settings\\Desktop\\Playground\\Games',
  }),
  folderApp({
    id: 'playground_applications',
    title: 'Applications',
    folderLabel: 'Applications',
    children: ['playground_winamp', 'playground_paint', 'playground_certimagic'],
    explorerAddressPath: 'C:\\Documents and Settings\\Desktop\\Playground\\Applications',
  }),
  folderApp({
    id: 'playground_webpage',
    title: 'Webpage',
    folderLabel: 'Webpage',
    children: [],
    explorerAddressPath: 'C:\\Documents and Settings\\Desktop\\Playground\\Webpage',
  }),
  folderApp({
    id: 'playground_pinball',
    title: 'Pinball',
    folderLabel: 'Pinball',
    children: ['pinball', 'readme_pinball'],
    explorerAddressPath: 'C:\\Documents and Settings\\Desktop\\Playground\\Games\\Pinball',
  }),
  folderApp({
    id: 'playground_minesweeper',
    title: 'Minesweeper',
    folderLabel: 'Minesweeper',
    children: ['minesweeper', 'readme_minesweeper'],
    explorerAddressPath: 'C:\\Documents and Settings\\Desktop\\Playground\\Games\\Minesweeper',
  }),
  folderApp({
    id: 'playground_solitaire',
    title: 'Solitaire',
    folderLabel: 'Solitaire',
    children: ['solitaire', 'readme_solitaire'],
    explorerAddressPath: 'C:\\Documents and Settings\\Desktop\\Playground\\Games\\Solitaire',
  }),
  folderApp({
    id: 'playground_winamp',
    title: 'Winamp',
    folderLabel: 'Winamp',
    children: ['winamp', 'readme_winamp'],
    explorerAddressPath: 'C:\\Documents and Settings\\Desktop\\Playground\\Applications\\Winamp',
  }),
  folderApp({
    id: 'playground_paint',
    title: 'Paint',
    folderLabel: 'Paint',
    children: ['paint', 'readme_paint'],
    explorerAddressPath: 'C:\\Documents and Settings\\Desktop\\Playground\\Applications\\Paint',
  }),
  folderApp({
    id: 'playground_certimagic',
    title: 'CertMagic',
    folderLabel: 'CertMagic',
    children: ['certimagic', 'readme_certimagic'],
    explorerAddressPath: 'C:\\Documents and Settings\\Desktop\\Playground\\Applications\\CertMagic',
  }),
  playgroundReadme({ id: 'readme_pinball', fileName: 'README.md', readmeId: 'readme_pinball' }),
  playgroundReadme({ id: 'readme_minesweeper', fileName: 'README.md', readmeId: 'readme_minesweeper' }),
  playgroundReadme({ id: 'readme_solitaire', fileName: 'README.md', readmeId: 'readme_solitaire' }),
  playgroundReadme({ id: 'readme_winamp', fileName: 'README.md', readmeId: 'readme_winamp' }),
  playgroundReadme({ id: 'readme_paint', fileName: 'README.md', readmeId: 'readme_paint' }),
  playgroundReadme({ id: 'readme_certimagic', fileName: 'README.md', readmeId: 'readme_certimagic' }),
  {
    id: 'office_word',
    path: '/word',
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
    path: '/excel',
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
    id: 'certimagic',
    path: '/certimagic',
    page: CertiMagicPage,
    title: 'CertiMagic.xls - Microsoft Excel',
    icon: certiMagicIcon,
    group: 'Office',
    folderLabel: 'CertMagic',
    desktop: { label: 'CertiMagic', order: 7.5 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'certimagic',
    },
    renderStack: () => createElement(CertiMagicApp),
  },
  {
    id: 'office_ppt',
    path: '/ppt',
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
    id: 'profile',
    path: '/profile',
    page: ProfilePage,
    title: 'Profile.doc - Microsoft Word',
    icon: docIcon,
    group: 'Office',
    desktop: { label: 'Profile.doc', order: 9 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'word',
    },
    renderStack: () => createElement(ProfileWindowContent),
  },
  {
    id: 'experience',
    path: '/experience',
    page: ExperiencePage,
    title: 'Experience.ppt - Microsoft PowerPoint',
    icon: pptIcon,
    group: 'Office',
    desktop: { label: 'Experience.ppt', order: 9 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'ppt-full',
    },
    renderStack: () => createElement(ExperiencePowerPointContent),
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
    id: 'acrobat_projects',
    path: '/pdf',
    page: PdfPage,
    title: 'Projects_Saiful.pdf - Adobe Reader',
    icon: pdfIcon,
    group: 'Office',
    desktop: { label: 'Projects_Saiful.pdf', order: 15 },
    stackable: true,
    window: {
      showMenuBar: false,
      className: '',
      shell: 'pdf',
    },
    renderStack: () => createElement(PdfReaderApp, { src: projectsPdfUrl }),
  },
  {
    id: 'whatsapp',
    desktop: { label: 'WhatsApp', order: 16 },
    icon: whatsappIcon,
    group: 'Connect',
    externalUrl: EXTERNAL_URLS.whatsapp,
    stackable: false,
  },
  {
    id: 'linkedin',
    desktop: { label: 'LinkedIn', order: 17 },
    icon: linkedinIcon,
    group: 'Connect',
    externalUrl: EXTERNAL_URLS.linkedin,
    stackable: false,
  },
  {
    id: 'gmail',
    desktop: { label: 'Gmail', order: 18 },
    icon: gmailIcon,
    group: 'Connect',
    externalUrl: EXTERNAL_URLS.gmail,
    stackable: false,
  },
  {
    id: 'github',
    desktop: { label: 'GitHub', order: 19 },
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
    id: 'pinball',
    path: '/pinball',
    page: PinballPage,
    title: '3D Pinball for Windows - Space Cadet',
    icon: pinballIcon,
    group: 'Games',
    folderLabel: '3D Pinball',
    stackable: true,
    window: {
      showMenuBar: false,
      className: 'w-[min(420px,calc(100%-24px))]',
      shell: 'default',
      allowMaximize: true,
      compactFrame: true,
      noClientPadding: true,
    },
    renderStack: ({ keyboardActive }) =>
      createElement(PinballStackBody, { keyboardActive: Boolean(keyboardActive) }),
  },
  {
    id: 'solitaire',
    path: '/solitaire',
    page: SolitairePage,
    title: 'Solitaire',
    icon: solitaireIcon,
    group: 'Games',
    folderLabel: 'Solitaire',
    stackable: true,
    window: {
      showMenuBar: false,
      className: 'w-[min(560px,calc(100%-24px))]',
      shell: 'default',
      allowMaximize: true,
      compactFrame: true,
      noClientPadding: true,
    },
    renderStack: ({ keyboardActive }) =>
      createElement(SolitaireStackBody, { keyboardActive: Boolean(keyboardActive) }),
  },
  {
    id: 'minesweeper',
    path: '/minesweeper',
    page: MinesweeperPage,
    title: 'Minesweeper',
    icon: minesweeperIcon,
    group: 'Games',
    folderLabel: 'Minesweeper',
    stackable: true,
    window: {
      showMenuBar: false,
      className: 'w-[min(520px,calc(100%-24px))]',
      shell: 'default',
      allowMaximize: true,
      compactFrame: true,
      noClientPadding: true,
    },
    renderStack: ({ keyboardActive }) =>
      createElement(MinesweeperStackBody, { keyboardActive: Boolean(keyboardActive) }),
  },
  {
    id: 'paint',
    path: '/paint',
    page: PaintPage,
    title: 'untitled - Paint',
    icon: paintIcon,
    group: 'Accessories',
    folderLabel: 'Paint',
    stackable: true,
    window: {
      showMenuBar: false,
      className: 'w-[min(720px,calc(100%-24px))]',
      shell: 'default',
      allowMaximize: true,
      compactFrame: true,
      noClientPadding: true,
    },
    renderStack: ({ keyboardActive }) =>
      createElement(PaintStackBody, { keyboardActive: Boolean(keyboardActive) }),
  },
  {
    id: 'recycle',
    path: '/recycle_bin',
    page: FolderPage,
    title: 'Recycle Bin',
    icon: recycleIcon,
    group: 'Office',
    desktop: { label: 'Recycle Bin', order: 999 },
    stackable: true,
    children: [],
    window: {
      showMenuBar: false,
      className: '',
      shell: 'folder',
      explorerAddressPath: 'Recycle Bin',
    },
    renderStack: ({ app }) => createElement(FolderApp, { childAppIds: app?.children ?? [] }),
  },
]

/** One React Router entry per pathname (shared paths disambiguate with `?app=`). */
export const ROUTES = (() => {
  const seen = new Set()
  const out = []
  for (const app of APPS) {
    if (!app.page || !app.path || seen.has(app.path)) continue
    seen.add(app.path)
    out.push({ id: app.id, path: app.path, element: app.page })
  }
  return out
})()

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

/** True when the registry entry is an Explorer folder window. */
export function isFolderApp(app) {
  return Boolean(app && app.window?.shell === 'folder')
}

/**
 * Parent folder id if `childId` appears in some folder’s `children` list.
 * @param {string} childId
 * @returns {string | null}
 */
export function getFolderParentId(childId) {
  if (!childId) return null
  for (const app of APPS) {
    if (Array.isArray(app.children) && app.children.includes(childId)) return app.id
  }
  return null
}

function normalizeExplorerPath(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/\//g, '\\')
    .replace(/\\+$/g, '')
    .toLowerCase()
}

/**
 * Resolve a typed Explorer address bar path to a folder app.
 * Matches full `explorerAddressPath`, trailing segment, or folder label.
 * @param {string} raw
 */
export function findFolderByAddressPath(raw) {
  const needle = normalizeExplorerPath(raw)
  if (!needle) return null

  const folders = APPS.filter(isFolderApp)

  const exact = folders.find(
    (a) => normalizeExplorerPath(a.window?.explorerAddressPath) === needle,
  )
  if (exact) return exact

  const byEnd = folders.find((a) => {
    const p = normalizeExplorerPath(a.window?.explorerAddressPath)
    return p === needle || p.endsWith('\\' + needle) || p.endsWith(needle)
  })
  if (byEnd) return byEnd

  const byLabel = folders.find((a) => {
    const label = normalizeExplorerPath(a.folderLabel ?? a.desktop?.label ?? a.title)
    return label === needle || label === needle.replace(/\\/g, '')
  })
  return byLabel ?? null
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
    // In-window Explorer browse may keep a host path while `?app=` points at another folder.
    const byId = APPS.find((a) => a.id === id)
    if (byId && isFolderApp(byId) && isFolderApp(appForBarePath(pathname))) return byId
  }
  return appForBarePath(pathname)
}

export function getDesktopApps() {
  return APPS.filter((app) => app.desktop)
    .slice()
    .sort((a, b) => (a.desktop?.order ?? 0) - (b.desktop?.order ?? 0))
}
