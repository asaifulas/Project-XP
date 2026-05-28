/**
 * Open a URL in a new browsing context (desktop shortcuts, social links).
 *
 * @param {string} url
 */
export function openExternalUrl(url) {
  window.open(url, '_blank', 'noopener,noreferrer')
}
