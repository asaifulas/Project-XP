/**
 * Restored (non-maximized) XP window chrome outer size — common “standard” frame.
 * Inner content scrolls inside this box.
 */
export const XP_STANDARD_FRAME_WIDTH_PX = 800
export const XP_STANDARD_FRAME_HEIGHT_PX = 600

/** Full standard frame: width, height, column layout (apply when no app-specific width). */
export const XP_STANDARD_FRAME_CLASS =
  'flex flex-col w-[min(800px,calc(100%-24px))] h-[min(600px,calc(100svh-48px))]'

/** When an app sets its own width (e.g. Calculator), still use standard height + layout. */
export const XP_STANDARD_FRAME_HEIGHT_ONLY_CLASS =
  'flex flex-col h-[min(600px,calc(100svh-48px))]'
