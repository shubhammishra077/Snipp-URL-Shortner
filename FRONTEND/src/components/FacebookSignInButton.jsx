import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from '@tanstack/react-router'
import { facebookAuth } from '../api/user.api'
import { login } from '../store/slice/authSlice'
import { loadScript } from '../utils/loadScript'

const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID

let fbInitPromise = null

// Loads the Facebook JS SDK and calls FB.init() exactly once, no matter how
// many FacebookSignInButton instances are mounted (login + register pages).
const initFacebookSdk = () => {
  if (!fbInitPromise) {
    fbInitPromise = loadScript('https://connect.facebook.net/en_US/sdk.js').then(() => {
      window.FB.init({
        appId: FACEBOOK_APP_ID,
        cookie: true,
        xfbml: false,
        version: 'v20.0',
      })
    })
  }
  return fbInitPromise
}

// Facebook doesn't offer a pre-styled drop-in button like Google's GIS, so
// this renders our own button and drives the flow via FB.login().
const FacebookSignInButton = ({ onError }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!FACEBOOK_APP_ID) return
    initFacebookSdk().catch(() => onError?.('Could not load Facebook Login. Please try again later.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!FACEBOOK_APP_ID) {
    if (typeof window !== 'undefined' && !FacebookSignInButton._warned) {
      console.warn(
        '[FacebookSignInButton] VITE_FACEBOOK_APP_ID is not set - the button will not render. ' +
        'Add it to FRONTEND/.env and restart the Vite dev server.'
      )
      FacebookSignInButton._warned = true
    }
    return null
  }

  const handleClick = async () => {
    setLoading(true)
    try {
      await initFacebookSdk()
      window.FB.login(
        async (response) => {
          if (response.authResponse?.accessToken) {
            try {
              const data = await facebookAuth(response.authResponse.accessToken)
              dispatch(login(data.user))
              navigate({ to: '/dashboard' })
            } catch (err) {
              onError?.(err.message || 'Facebook sign-in failed. Please try again.')
            }
          } else {
            onError?.('Facebook login was cancelled or not authorized.')
          }
          setLoading(false)
        },
        { scope: 'public_profile,email' }
      )
    } catch (err) {
      onError?.('Could not start Facebook Login. Please try again later.')
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-[#1877F2] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.78-1.63 1.58v1.86h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
      </svg>
      {loading ? 'Connecting…' : 'Continue with Facebook'}
    </button>
  )
}

export default FacebookSignInButton
