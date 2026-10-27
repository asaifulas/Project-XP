#!/usr/bin/env node
/**
 * Download curated Openclipart (CC0) outline / line-art SVGs for Paint Edu.
 * IDs are hand-checked (slug must match the subject). XP Clip Gallery is NOT used.
 *
 * Usage: node scripts/download-edu-clipart.mjs
 */
import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises'
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
  { id: 'fish', category: 'animals', label: 'Fish', oclId: 273123, slug: 'trace-or-cut-out-and-color-the-fish' },
  { id: 'bird', category: 'animals', label: 'Bird', oclId: 234625, slug: 'simple-dove-outline' },
  { id: 'butterfly', category: 'animals', label: 'Butterfly', oclId: 352671, slug: 'simple-detailed-butterfly-lineart' },
  { id: 'elephant', category: 'animals', label: 'Elephant', oclId: 12749, slug: 'elephant-outline' },
  { id: 'rabbit', category: 'animals', label: 'Bunny', oclId: 213606, slug: 'bunny-outline' },
  { id: 'duck', category: 'animals', label: 'Duck', oclId: 248172, slug: 'duck-lineart' },
  { id: 'lion', category: 'animals', label: 'Lion', oclId: 74749, slug: 'lion-line-art' },
  { id: 'bear', category: 'animals', label: 'Bear', oclId: 195906, slug: 'coloring-book-grizzly' },
  { id: 'owl', category: 'animals', label: 'Owl', oclId: 75271, slug: 'owl-line-art' },
  { id: 'shark', category: 'animals', label: 'Shark', oclId: 330219, slug: 'great-white-shark-line-art' },
  { id: 'pig', category: 'animals', label: 'Pig', oclId: 177040, slug: 'zeldas-pig' },
  { id: 'turtle', category: 'animals', label: 'Turtle', oclId: 354473, slug: 'turtle' },
  { id: 'penguin', category: 'animals', label: 'Penguin', oclId: 330246, slug: 'cute-penguin-head' },

  // Transportation
  { id: 'airplane', category: 'transportation', label: 'Airplane', oclId: 173951, slug: 'airplane-silhouette' },
  { id: 'biplane', category: 'transportation', label: 'Biplane', oclId: 319632, slug: 'biplane-outline-1918' },
  { id: 'prop-plane', category: 'transportation', label: 'Prop plane', oclId: 228075, slug: 'airplane-with-propeller-outline' },
  { id: 'plane-shape', category: 'transportation', label: 'Plane shape', oclId: 352432, slug: 'plane-shape-outline' },
  { id: 'car', category: 'transportation', label: 'Car', oclId: 190005, slug: 'simple-side-of-car' },
  { id: 'bicycle', category: 'transportation', label: 'Bicycle', oclId: 26979, slug: 'bicycle' },
  { id: 'helicopter', category: 'transportation', label: 'Helicopter', oclId: 324037, slug: 'big-helicopter-outline' },
  { id: 'rocket', category: 'transportation', label: 'Rocket', oclId: 272531, slug: 'rocket-coloring-page' },
  { id: 'sailboat', category: 'transportation', label: 'Sailboat', oclId: 298680, slug: 'sail-ship-2-masts-outline' },
  { id: 'train', category: 'transportation', label: 'Train', oclId: 306359, slug: 'toy-train-outline' },
  { id: 'submarine', category: 'transportation', label: 'Submarine', oclId: 329963, slug: 'submarine4-21gkg' },

  // Plants
  { id: 'flower', category: 'plants', label: 'Flower', oclId: 352672, slug: 'simple-flower-head-lineart' },
  { id: 'pine', category: 'plants', label: 'Pine tree', oclId: 304732, slug: 'christmas-tree-6-outline' },
  { id: 'leaf', category: 'plants', label: 'Leaf', oclId: 354124, slug: 'lutz-oak-leaf-outline' },
  { id: 'mushroom', category: 'plants', label: 'Mushroom', oclId: 246716, slug: 'toadstool-lineart' },
  { id: 'cactus', category: 'plants', label: 'Cactus', oclId: 24040, slug: 'cactus' },

  // Buildings
  { id: 'house', category: 'buildings', label: 'House', oclId: 275845, slug: 'simple-house-line-art' },
  { id: 'tent', category: 'buildings', label: 'Tent', oclId: 11436, slug: 'rpg-map-symbols-circus-tent-2' },

  // Food
  { id: 'apple', category: 'food', label: 'Apple', oclId: 290296, slug: 'apple-outline' },
  { id: 'carrot', category: 'food', label: 'Carrot', oclId: 215798, slug: 'carrot-lineart' },
  { id: 'banana', category: 'food', label: 'Banana', oclId: 244986, slug: 'bunch-of-bananas-lineart' },

  // Nature
  { id: 'sun', category: 'nature', label: 'Sun', oclId: 75523, slug: 'sun-line-art' },
  { id: 'snowflake', category: 'nature', label: 'Snowflake', oclId: 279895, slug: 'flat-white-snowflake-with-hollow-circular-center' },
  { id: 'balloon', category: 'objects', label: 'Balloon', oclId: 354006, slug: 'lutz-balloon-flipped' },

  // Objects
  { id: 'trophy', category: 'objects', label: 'Trophy', oclId: 303459, slug: 'sketched-trophy' },
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

async function main() {
  await mkdir(OUT, { recursive: true })
  for (const name of await readdir(OUT)) {
    if (name.endsWith('.svg')) await unlink(path.join(OUT, name))
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
        items: ok,
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
