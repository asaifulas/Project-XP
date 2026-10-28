import { describe, expect, it } from 'vitest'
import {
  galleryAppIdForDir,
  galleryDirLabel,
  listGalleryDirs,
  listGalleryMedia,
} from './galleryMedia.js'

describe('galleryMedia discovery', () => {
  it('title-cases directory slugs', () => {
    expect(galleryDirLabel('screenshot')).toBe('Screenshot')
    expect(galleryDirLabel('my_pics')).toBe('My Pics')
    expect(galleryDirLabel('arduino')).toBe('Arduino')
  })

  it('builds stable app ids', () => {
    expect(galleryAppIdForDir('screenshot')).toBe('gallery_screenshot')
  })

  it('discovers gallery subdirs from assets (incl. empty via .gitkeep)', () => {
    const dirs = listGalleryDirs()
    expect(dirs).toContain('screenshot')
    expect(dirs).toContain('arduino')
  })

  it('lists screenshot media with lazy loaders', async () => {
    const media = listGalleryMedia('screenshot')
    expect(media.length).toBeGreaterThan(0)
    expect(media[0]).toEqual(
      expect.objectContaining({
        id: expect.stringContaining('screenshot/'),
        name: expect.any(String),
        load: expect.any(Function),
      }),
    )
    const src = await media[0].load()
    expect(typeof src).toBe('string')
    expect(src.length).toBeGreaterThan(0)
  })

  it('returns empty list for unknown dirs', () => {
    expect(listGalleryMedia('no-such-album')).toEqual([])
  })
})
