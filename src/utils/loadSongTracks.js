/**
 * Build playlist entries from audio files in `src/assets/songs/`.
 * Vite resolves each match to a URL string at build time.
 */
export function loadSongTracks() {
  const modules = import.meta.glob('../assets/songs/*.{mp3,ogg,wav,m4a,aac}', {
    eager: true,
    query: '?url',
    import: 'default',
  })

  return Object.entries(modules)
    .map(([path, url]) => {
      const file = path.split('/').pop() ?? path
      const title = file.replace(/\.[^.]+$/i, '')
      return { id: path, title, url }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}
