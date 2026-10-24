import React from 'react'
import { motion } from 'framer-motion'

const GeoBreakdown = ({ title, data = [] }) => {
  const max = Math.max(1, ...data.map((d) => d.count))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">{title}</h3>
      {data.length ? (
        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1 text-slate-600 dark:text-slate-300">
                <span>{d.name}</span>
                <span className="font-medium">{d.count}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-blue-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                  style={{ width: `${(d.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500 py-10 text-center">No data yet</p>
      )}
    </motion.div>
  )
}

export default GeoBreakdown
