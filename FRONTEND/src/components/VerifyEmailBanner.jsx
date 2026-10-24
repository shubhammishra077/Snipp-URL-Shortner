import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { resendVerification } from '../api/user.api'

const VerifyEmailBanner = () => {
  const { user } = useSelector((state) => state.auth)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  if (!user || user.isVerified) return null

  const handleResend = async () => {
    setSending(true)
    setError(null)
    try {
      await resendVerification()
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm flex items-center justify-between gap-3 flex-wrap"
    >
      <span>📧 Please verify your email address to secure your account.</span>
      <AnimatePresence mode="wait">
        {sent ? (
          <motion.span key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-medium text-emerald-600 dark:text-emerald-400">
            ✓ Verification email sent
          </motion.span>
        ) : (
          <motion.button
            key="button"
            onClick={handleResend}
            disabled={sending}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 shrink-0"
          >
            {sending ? 'Sending…' : 'Resend Email'}
          </motion.button>
        )}
      </AnimatePresence>
      {error && <span className="text-red-500 text-xs w-full">{error}</span>}
    </motion.div>
  )
}

export default VerifyEmailBanner
