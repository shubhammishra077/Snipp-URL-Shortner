import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { loadScript } from '../utils/loadScript'

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

// reCAPTCHA v2 "I'm not a robot" checkbox. Rendered explicitly (rather than
// via the auto-render <div class="g-recaptcha">) so we can grab a widget id
// and reset it after a failed submit. Exposes reset() via ref.
const Captcha = forwardRef(({ onChange }, ref) => {
  const containerRef = useRef(null)
  const widgetId = useRef(null)
  const [error, setError] = useState(false)

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetId.current)
      }
    },
  }))

  useEffect(() => {
    if (!SITE_KEY) return
    let cancelled = false

    loadScript('https://www.google.com/recaptcha/api.js?render=explicit')
      .then(() => {
        // grecaptcha.render needs grecaptcha.ready in some load orders
        const render = () => {
          if (cancelled || !containerRef.current || !window.grecaptcha || widgetId.current !== null) return
          widgetId.current = window.grecaptcha.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: (token) => onChange?.(token),
            'expired-callback': () => onChange?.(null),
            'error-callback': () => onChange?.(null),
          })
        }
        if (window.grecaptcha?.render) render()
        else window.grecaptcha?.ready?.(render)
      })
      .catch(() => setError(true))

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!SITE_KEY) return null

  return (
    <div className="mb-4">
      <div ref={containerRef} />
      {error && <p className="text-xs text-red-500 mt-1">Couldn't load CAPTCHA. Check your connection and refresh.</p>}
    </div>
  )
})

Captcha.displayName = 'Captcha'

export default Captcha
