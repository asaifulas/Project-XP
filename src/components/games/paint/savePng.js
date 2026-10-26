/**
 * Save a canvas as PNG onto the user's disk.
 * Prefers the File System Access API (Save As dialog); falls back to a download.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} [suggestedName]
 * @returns {Promise<{ method: 'picker' | 'download' | 'cancelled', name?: string }>}
 */
export async function saveCanvasPng(canvas, suggestedName = 'untitled.png') {
  const blob = await canvasToPngBlob(canvas)
  if (!blob) throw new Error('Could not encode PNG')

  if (typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function') {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: 'PNG Image',
            accept: { 'image/png': ['.png'] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return { method: 'picker', name: handle.name || suggestedName }
    } catch (error) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
        return { method: 'cancelled' }
      }
      // Fall through to download if picker fails (permissions, insecure context, etc.)
    }
  }

  downloadBlob(blob, suggestedName)
  return { method: 'download', name: suggestedName }
}

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<Blob | null>}
 */
export function canvasToPngBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

/**
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}
