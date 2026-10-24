import React from 'react'
import { motion } from 'framer-motion'

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const deviceIcon = (device) => {
  if (device === 'Mobile') return '📱'
  if (device === 'Tablet') return '💻'
  return '🖥️'
}

const RecentActivity = ({ items = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Recent Activity</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">No clicks yet</p>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 hover:translate-x-0.5 transition-all duration-200"
            >
              <span className="text-lg">{deviceIcon(item.device)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
                  {item.title || item.shortUrl ? `/${item.shortUrl}` : ''}{' '}
                  <span className="text-slate-400 dark:text-slate-500">
                    via {item.browser} · {item.os}
                  </span>
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {item.city !== 'Unknown' ? `${item.city}, ` : ''}{item.country}
                </p>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{timeAgo(item.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default RecentActivity
