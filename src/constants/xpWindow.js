/**
 * Restored (non-maximized) XP window chrome outer size — common “standard” frame.
 * Inner content scrolls inside this box.
 */
export const XP_STANDARD_FRAME_WIDTH_PX = 1440
export const XP_STANDARD_FRAME_HEIGHT_PX = 1080

/** Full standard frame: width, height, column layout (apply when no app-specific width). */
export const XP_STANDARD_FRAME_CLASS =
  'flex flex-col w-[min(1440px,calc(100%-24px))] h-[min(1080px,calc(100svh-48px))]'

/** When an app sets its own width (e.g. Calculator), still use standard height + layout. */
export const XP_STANDARD_FRAME_HEIGHT_ONLY_CLASS =
  'flex flex-col h-[min(1080px,calc(100svh-48px))]'

/** Explorer `folder` shell — smaller restored frame than document-style apps. */
export const XP_FOLDER_FRAME_WIDTH_PX = 1024
export const XP_FOLDER_FRAME_HEIGHT_PX = 768

export const XP_FOLDER_FRAME_CLASS =
  'flex flex-col w-[min(1024px,calc(100%-24px))] h-[min(768px,calc(100svh-48px))]'

export const XP_FOLDER_FRAME_HEIGHT_ONLY_CLASS =
  'flex flex-col h-[min(768px,calc(100svh-48px))]'
