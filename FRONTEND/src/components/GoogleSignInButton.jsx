import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from '@tanstack/react-router'
import { googleAuth } from '../api/user.api'
import { login } from '../store/slice/authSlice'
import { loadScript } from '../utils/loadScript'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Renders Google's own "Sign in with Google" button via Google Identity
// Services (GIS). GIS hands us a signed ID token (JWT) which we send to
// the backend for verification - we never see or handle a Google password.
const GoogleSignInButton = ({ onError }) => {
  const buttonRef = useRef(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn(
        '[GoogleSignInButton] VITE_GOOGLE_CLIENT_ID is not set - the button will not render. ' +
        'Add it to FRONTEND/.env and restart the Vite dev server.'
      )
      return
    }
    let cancelled = false

    const handleCredentialResponse = async (response) => {
      try {
        const data = await googleAuth(response.credential)
        dispatch(login(data.user))
        navigate({ to: '/dashboard' })
      } catch (err) {
        onError?.(err.message || 'Google sign-in failed. Please try again.')
      }
    }

    loadScript('https://accounts.google.com/gsi/client')
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
          })
          if (buttonRef.current) {
            window.google.accounts.id.renderButton(buttonRef.current, {
              theme: 'outline',
              size: 'large',
              width: 320,
              text: 'continue_with',
            })
          }
          setReady(true)
        } catch (err) {
          console.error('[GoogleSignInButton] initialize/render failed:', err)
          onError?.('Google Sign-In could not be set up. Check that this origin is authorized in Google Cloud Console.')
        }
      })
      .catch((err) => {
        console.error('[GoogleSignInButton] failed to load Google script:', err)
        onError?.('Could not load Google Sign-In. Please try again later.')
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="flex justify-center">
      <div ref={buttonRef} className={ready ? '' : 'opacity-0 h-0 overflow-hidden'} />
    </div>
  )
}

export default GoogleSignInButton
