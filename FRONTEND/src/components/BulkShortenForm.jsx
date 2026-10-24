import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { createBulkShortUrls } from '../api/shortUrl.api'
import { queryClient } from '../main'

const BulkShortenForm = () => {
  const [text, setText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const urls = text.split('\n').map((l) => l.trim()).filter(Boolean)
    if (urls.length === 0) return
    if (urls.length > 50) {
      setError('You can shorten up to 50 URLs at a time')
      return
    }
    setLoading(true)
    try {
      const res = await createBulkShortUrls(urls)
      setResults(res)
      queryClient.invalidateQueries({ queryKey: ['userUrls'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAll = () => {
    const successUrls = (results || []).filter((r) => r.success).map((r) => r.shortUrl).join('\n')
    navigator.clipboard.writeText(successUrls)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
            Paste one URL per line (up to 50)
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder={'https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3'}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white py-2.5 px-4 rounded-xl font-medium shadow-lg shadow-indigo-500/20 hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Shortening…' : 'Shorten All'}
        </motion.button>
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}
      </form>

      {results && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 dark:border-blue-800 overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-blue-900/60">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {results.filter((r) => r.success).length}/{results.length} shortened
            </span>
            <button onClick={handleCopyAll} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Copy all successful
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-blue-900">
            {results.map((r, i) => (
              <div key={i} className="px-4 py-2.5 text-sm flex items-center gap-2">
                <span>{r.success ? '✅' : '❌'}</span>
                <span className="truncate flex-1 text-slate-500 dark:text-slate-400">{r.input}</span>
                {r.success ? (
                  <a href={r.shortUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0">
                    {r.shortUrl.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  <span className="text-red-500 text-xs shrink-0">{r.error}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default BulkShortenForm
