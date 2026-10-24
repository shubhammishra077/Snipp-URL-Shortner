import React from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { API_BASE_URL } from '../utils/constants'

const PopularLinks = ({ links = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Popular Links</h3>
      {links.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">No links yet</p>
      ) : (
        <div className="space-y-2">
          {links.map((link, i) => (
            <Link
              key={link._id}
              to="/analytics/$shortUrl"
              params={{ shortUrl: link.short_url }}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 hover:translate-x-0.5 transition-all duration-200"
            >
              <span className="w-6 h-6 shrink-0 rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                  {link.title || `/${link.short_url}`}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{link.full_url}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 shrink-0">
                {link.clicks}
              </span>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default PopularLinks
