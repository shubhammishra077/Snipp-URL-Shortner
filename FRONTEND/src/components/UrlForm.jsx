import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createShortUrl } from '../api/shortUrl.api'
import { useSelector } from 'react-redux'
import { queryClient } from '../main'

const UrlForm = () => {
  const [url, setUrl] = useState("")
  const [customSlug, setCustomSlug] = useState("")
  const [password, setPassword] = useState("")
  const [protect, setProtect] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [shortUrl, setShortUrl] = useState()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useSelector((state) => state.auth)

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    setError(null)
    setLoading(true)
    try {
      const result = await createShortUrl({
        url,
        slug: customSlug || undefined,
        password: protect ? password : undefined,
      })
      setShortUrl(result)
      queryClient.invalidateQueries({ queryKey: ['userUrls'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
          Enter your URL
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onInput={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/my-long-link"
          required
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
        />
      </div>

      {isAuthenticated && (
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {showAdvanced ? '– Hide' : '+ Show'} advanced options
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                      Custom URL (optional)
                    </label>
                    <input
                      type="text"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value)}
                      placeholder="my-brand-link"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="protect"
                      checked={protect}
                      onChange={(e) => setProtect(e.target.checked)}
                      className="h-4 w-4 rounded accent-indigo-500"
                    />
                    <label htmlFor="protect" className="text-sm text-slate-600 dark:text-slate-300">
                      🔒 Password protect this link
                    </label>
                  </div>

                  {protect && (
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Set a password"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white py-2.5 px-4 rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Shortening…' : 'Shorten URL'}
      </motion.button>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      <AnimatePresence>
        {shortUrl && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pt-2"
          >
            <h2 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Your shortened URL</h2>
            <div className="flex items-center rounded-xl overflow-hidden border border-slate-200 dark:border-blue-800">
              <input
                type="text"
                readOnly
                value={shortUrl}
                className="flex-1 p-2.5 bg-slate-50 dark:bg-blue-900 text-slate-900 dark:text-white text-sm"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-blue-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

export default UrlForm
