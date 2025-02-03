/**
 * Inserts a full-screen loading overlay that blocks all interactions.
 */
export function showLoadingScreen() {
  // Prevent duplicate overlays
  if (document.getElementById('loading-overlay')) return

  const overlay = document.createElement('div')
  overlay.id = 'loading-overlay'
  overlay.style.position = 'fixed'
  overlay.style.top = '0'
  overlay.style.left = '0'
  overlay.style.width = '100%'
  overlay.style.height = '100%'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
  overlay.style.zIndex = '99999'
  overlay.style.display = 'flex'
  overlay.style.justifyContent = 'center'
  overlay.style.alignItems = 'center'
  overlay.innerHTML = '<div style="color: white; font-size: 24px;">Loading...</div>'
  document.body.appendChild(overlay)
}

/**
 * Removes the loading overlay if present.
 */
export function hideLoadingScreen() {
  const overlay = document.getElementById('loading-overlay')
  if (overlay) overlay.remove()
}
