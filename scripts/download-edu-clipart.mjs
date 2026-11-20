#!/usr/bin/env node
/**
 * Download curated Openclipart (CC0) outline / line-art SVGs for Paint Edu.
 * IDs are hand-checked (slug must match the subject). XP Clip Gallery is NOT used.
 *
 * Usage: node scripts/download-edu-clipart.mjs
 */
import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../src/assets/paint/clipart')
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * Hand-curated Openclipart IDs — kid coloring-book style.
 * Prefer stroke outlines / black+white lineart; avoid coloured/emoji/gradient art.
 * Re-scored Oct 2026: replaced weak/bad pack members (filled, shaded, mega-path).
 */
const MANIFEST = [
  // Animals
  { id: 'cat', category: 'animals', label: 'Cat', oclId: 28140, slug: 'sitting-cat-outline' },
  { id: 'dog', category: 'animals', label: 'Dog', oclId: 5520, slug: 'coloring-book-dog-ilio' },
  { id: 'bird', category: 'animals', label: 'Bird', oclId: 234625, slug: 'simple-dove-outline' },
  { id: 'butterfly', category: 'animals', label: 'Butterfly', oclId: 352671, slug: 'simple-detailed-butterfly-lineart' },
  { id: 'rabbit', category: 'animals', label: 'Bunny', oclId: 213606, slug: 'bunny-outline' },
  { id: 'duck', category: 'animals', label: 'Duck', oclId: 248172, slug: 'duck-lineart' },
  { id: 'lion', category: 'animals', label: 'Lion', oclId: 74749, slug: 'lion-line-art' },
  { id: 'owl', category: 'animals', label: 'Owl', oclId: 75271, slug: 'owl-line-art' },
  { id: 'shark', category: 'animals', label: 'Shark', oclId: 330219, slug: 'great-white-shark-line-art' },

  // Transportation
  { id: 'prop-plane', category: 'transportation', label: 'Prop plane', oclId: 228075, slug: 'airplane-with-propeller-outline' },
  { id: 'plane-shape', category: 'transportation', label: 'Plane shape', oclId: 352432, slug: 'plane-shape-outline' },
  { id: 'car', category: 'transportation', label: 'Car', oclId: 190005, slug: 'simple-side-of-car' },
  { id: 'rocket', category: 'transportation', label: 'Rocket', oclId: 272531, slug: 'rocket-coloring-page' },
  { id: 'airplane', category: 'transportation', label: 'Airplane', oclId: 324035, slug: 'small-plane-outline' },
  { id: 'bicycle', category: 'transportation', label: 'Bicycle', oclId: 301073, slug: 'bike-3-outline' },
  { id: 'ship', category: 'transportation', label: 'Ship', oclId: 22646, slug: 'bark-ship' },

  // Plants
  { id: 'flower', category: 'plants', label: 'Flower', oclId: 352672, slug: 'simple-flower-head-lineart' },
  { id: 'pine', category: 'plants', label: 'Pine tree', oclId: 304732, slug: 'christmas-tree-6-outline' },
  { id: 'leaf', category: 'plants', label: 'Leaf', oclId: 354124, slug: 'lutz-oak-leaf-outline' },
  { id: 'mushroom', category: 'plants', label: 'Mushroom', oclId: 246716, slug: 'toadstool-lineart' },
  { id: 'tree', category: 'plants', label: 'Tree', oclId: 213774, slug: 'tree-lineart' },
  { id: 'daisy', category: 'plants', label: 'Daisy', oclId: 214395, slug: 'flower-lineart' },

  // Buildings
  { id: 'house', category: 'buildings', label: 'House', oclId: 275845, slug: 'simple-house-line-art' },
  { id: 'tent', category: 'buildings', label: 'Tent', oclId: 11436, slug: 'rpg-map-symbols-circus-tent-2' },

  // Food
  { id: 'apple', category: 'food', label: 'Apple', oclId: 290296, slug: 'apple-outline' },
  { id: 'carrot', category: 'food', label: 'Carrot', oclId: 215798, slug: 'carrot-lineart' },
  { id: 'banana', category: 'food', label: 'Banana', oclId: 244986, slug: 'bunch-of-bananas-lineart' },
  { id: 'cupcake', category: 'food', label: 'Cupcake', oclId: 330247, slug: 'cute-owl-cupcake' },
  { id: 'icecream', category: 'food', label: 'Ice cream', oclId: 273240, slug: 'ice-cream-line-art' },

  // Nature
  { id: 'sun', category: 'nature', label: 'Sun', oclId: 75523, slug: 'sun-line-art' },
  { id: 'cloud', category: 'nature', label: 'Cloud', oclId: 344407, slug: 'cloud-banner-with-transparent-background' },
  { id: 'balloon', category: 'objects', label: 'Balloon', oclId: 354006, slug: 'lutz-balloon-flipped' },
  { id: 'book', category: 'objects', label: 'Book', oclId: 355258, slug: 'white-open-book-being-read' },

  // Objects
]

async function downloadOne(entry) {
  const url = `https://openclipart.org/download/${entry.oclId}/${entry.slug}.svg`
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/svg+xml,*/*' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const svg = await res.text()
  if (!svg.includes('<svg') && !svg.includes('<SVG')) throw new Error('not svg')
  // Reject tiny placeholder / wrong redirects (~6KB Lazur badge)
  if (svg.length < 1500) throw new Error(`too small (${svg.length})`)
  if (svg.includes('Lazur URH') && svg.length < 8000) throw new Error('placeholder')
  return svg
}

/**
 * Original line art drawn for this pack (not downloaded). Kept across re-downloads.
 */
const LOCAL_ITEMS = [
  {
    id: "moon",
    category: "nature",
    label: "Moon",
    local: true
  },
  {
    id: "star",
    category: "nature",
    label: "Star",
    local: true
  },
  {
    id: "klcc",
    category: "buildings",
    label: "KLCC towers",
    local: true
  },
  {
    id: "village-house",
    category: "buildings",
    label: "Village house",
    local: true
  },
  {
    id: "saga",
    category: "transportation",
    label: "Old Proton Saga",
    local: true
  },
  {
    id: "grass",
    category: "plants",
    label: "Grass",
    local: true
  },
  {
    id: "stone",
    category: "nature",
    label: "Stone",
    local: true
  },
  {
    id: "bridge",
    category: "buildings",
    label: "Bridge",
    local: true
  },
  {
    id: "kancil",
    category: "transportation",
    label: "Old Kancil",
    local: true
  },
  {
    id: "c50",
    category: "transportation",
    label: "Honda C50 cub",
    local: true
  }
]

async function main() {
  await mkdir(OUT, { recursive: true })
  const localIds = new Set(LOCAL_ITEMS.map((item) => item.id))
  const previous = JSON.parse(await readFile(path.join(OUT, 'manifest.json'), 'utf8').catch(() => '{"items":[]}'))
  const coloringItems = (previous.items ?? []).filter((item) => item.file)
  for (const name of await readdir(OUT)) {
    if (name.endsWith('.svg') && !localIds.has(path.basename(name, '.svg'))) await unlink(path.join(OUT, name))
  }

  const ok = []
  const fail = []
  for (const entry of MANIFEST) {
    try {
      const svg = await downloadOne(entry)
      await writeFile(path.join(OUT, `${entry.id}.svg`), svg, 'utf8')
      ok.push(entry)
      console.log(`✓ ${entry.id} (${entry.oclId}) ${(svg.length / 1024).toFixed(1)}KB`)
    } catch (err) {
      fail.push({ id: entry.id, error: String(err?.message || err) })
      console.warn(`✗ ${entry.id}: ${err?.message || err}`)
    }
  }

  await writeFile(
    path.join(OUT, 'manifest.json'),
    JSON.stringify(
      {
        license: 'CC0-1.0 / Public Domain via Openclipart.org',
        note: 'Microsoft XP / Office Clip Gallery is proprietary — not used. This pack is Openclipart CC0 line art.',
        source: 'https://openclipart.org',
        items: [...ok, ...LOCAL_ITEMS, ...coloringItems],
        failed: fail,
      },
      null,
      2,
    ),
    'utf8',
  )

  await writeFile(
    path.join(__dirname, '../src/assets/paint/licenses/OPENCLIPART-CC0.txt'),
    [
      'Edu Clipart pack — Openclipart.org (CC0 1.0 Public Domain)',
      'https://openclipart.org/share',
      '',
      'Microsoft Windows XP / Office Clip Gallery is proprietary and is NOT included.',
      '',
      `Downloaded: ${new Date().toISOString()}`,
      `Files: ${ok.length}`,
      '',
      ...ok.map((e) => `- ${e.id}.svg  (openclipart.org/detail/${e.oclId}/${e.slug})`),
      '',
    ].join('\n'),
    'utf8',
  )

  console.log(`\nDone. ok=${ok.length} fail=${fail.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
