import React, { useEffect, useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { verifyEmail } from '../api/user.api'

const VerifyEmailPage = () => {
  const search = useSearch({ strict: false })
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = search?.token
    if (!token) {
      setStatus('error')
      setMessage('No verification token found in the link.')
      return
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'This verification link is invalid or has expired.')
      })
  }, [search?.token])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-100 dark:from-[#020817] dark:via-blue-950 dark:to-[#050b2e] flex items-center justify-center p-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl px-8 py-10 border border-slate-200/60 dark:border-white/10 w-full max-w-sm text-center"
      >
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">Verifying your email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl text-white mx-auto mb-4">✓</div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Email verified</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Your email has been confirmed. You're all set.</p>
            <Link
              to="/dashboard"
              className="inline-block px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl text-white mx-auto mb-4">✕</div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verification failed</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{message}</p>
            <Link
              to="/dashboard"
              className="inline-block px-6 py-2.5 rounded-xl font-medium bg-slate-100 dark:bg-blue-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-blue-800 transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default VerifyEmailPage
