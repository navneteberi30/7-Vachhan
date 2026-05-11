import { useState, useEffect } from 'react'

/** Short hint for pinning / installing the PWA (iOS uses Share → Add to Home Screen; Android Chrome often offers Install). */
export default function InstallAppHint() {
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)')
    function update() {
      const standalone =
        mq.matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        ('standalone' in window.navigator && window.navigator.standalone === true)
      setHidden(standalone)
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  if (hidden) return null

  const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : ''
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  return (
    <p className="mt-4 max-w-md mx-auto text-center font-body text-[11px] leading-relaxed text-on-surface-variant/90 px-2">
      {isIOS ? (
        <>
          Want this on your home screen? Tap <span className="font-semibold text-secondary">Share</span>
          {' '}→{' '}
          <span className="font-semibold text-secondary">Add to Home Screen</span>.
        </>
      ) : (
        <>
          Want this on your home screen? Use your browser menu →{' '}
          <span className="font-semibold text-secondary">Install app</span>
          {' '}or Add to Home screen (Chrome / Samsung Internet).
        </>
      )}
    </p>
  )
}
