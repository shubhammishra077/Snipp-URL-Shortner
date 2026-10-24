import React, { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllUserUrls } from '../api/user.api'
import { deleteShortUrl } from '../api/shortUrl.api'
import { API_BASE_URL } from '../utils/constants'
import { queryClient } from '../main'
import QrCodeModal from './QrCodeModal'

const UserUrl = () => {
  const { data: urls, isLoading, isError, error } = useQuery({
    queryKey: ['userUrls'],
    queryFn: () => getAllUserUrls(),
    refetchInterval: 30000,
    staleTime: 0,
  })
  const [copiedId, setCopiedId] = useState(null)
  const [qrTarget, setQrTarget] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)

  const deleteMutation = useMutation({
    mutationFn: deleteShortUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userUrls'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
      setConfirmingId(null)
    },
  })

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteClick = (shortUrlSlug, id) => {
    if (confirmingId === id) {
      deleteMutation.mutate(shortUrlSlug)
    } else {
      setConfirmingId(id)
      setTimeout(() => setConfirmingId((cur) => (cur === id ? null : cur)), 4000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl my-4 text-sm">
        Error loading your URLs: {error.message}
      </div>
    )
  }

  if (!urls.urls || urls.urls.length === 0) {
    return (
      <div className="text-center text-slate-400 dark:text-slate-500 my-6 p-8 rounded-2xl border border-dashed border-slate-200 dark:border-blue-800">
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No links yet</p>
        <p className="mt-1 text-sm">Shorten your first URL above to see it here.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-2xl mt-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-blue-900">
            <thead className="bg-slate-50/80 dark:bg-white/5">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Original URL</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Short URL</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clicks</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-900">
              <AnimatePresence>
                {[...urls.urls].reverse().map((url) => {
                  const fullShort = `${API_BASE_URL}/${url.short_url}`
                  const isConfirming = confirmingId === url._id
                  const isDeleting = deleteMutation.isPending && deleteMutation.variables === url.short_url
                  return (
                    <motion.tr
                      key={url._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/5"
                    >
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-xs">{url.full_url}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          {url.isPasswordProtected && <span title="Password protected">🔒</span>}
                          <a
                            href={fullShort}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            {`${API_BASE_URL.replace(/^https?:\/\//, '')}/${url.short_url}`}
                          </a>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                          {url.clicks} {url.clicks === 1 ? 'click' : 'clicks'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(fullShort, url._id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              copiedId === url._id
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 dark:bg-blue-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-blue-800'
                            }`}
                          >
                            {copiedId === url._id ? 'Copied!' : 'Copy'}
                          </button>
                          <button
                            onClick={() => setQrTarget(url.short_url)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-blue-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-blue-800"
                          >
                            QR
                          </button>
                          <Link
                            to="/analytics/$shortUrl"
                            params={{ shortUrl: url.short_url }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90"
                          >
                            Analytics
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(url.short_url, url._id)}
                            disabled={isDeleting}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                              isConfirming
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20'
                            }`}
                          >
                            {isDeleting ? 'Deleting…' : isConfirming ? 'Confirm?' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
      <QrCodeModal shortCode={qrTarget} onClose={() => setQrTarget(null)} />
    </>
  )
}

export default UserUrl
