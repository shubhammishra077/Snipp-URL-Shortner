import React, { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { forgotPassword } from '../api/user.api'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-slate-100 dark:from-[#020817] dark:via-blue-950 dark:to-[#050b2e] flex items-center justify-center p-4 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-xl rounded-2xl px-8 py-10 border border-slate-200/60 dark:border-white/10 w-full max-w-sm"
      >
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl text-white mx-auto mb-4">✉️</div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              If an account exists for <span className="font-medium">{email}</span>, we've sent a password reset link. It expires in 1 hour.
            </p>
            <Link to="/auth" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-6">
              <span className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 items-center justify-center text-white text-xl mb-3">🔑</span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Forgot your password?</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter your email and we'll send you a reset link</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm">{error}</div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5" htmlFor="email">Email</label>
              <input
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </motion.button>

            <div className="text-center mt-5">
              <Link to="/auth" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default ForgotPasswordPage
