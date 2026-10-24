import React, { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'

const RANGES = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 bg-slate-900/90 text-white text-sm shadow-xl border border-white/10">
      <p className="font-medium">{label}</p>
      <p className="text-indigo-300">{payload[0].value} clicks</p>
    </div>
  )
}

const ClickChart = ({ charts, title = 'Clicks Over Time' }) => {
  const [range, setRange] = useState('daily')
  const data = charts?.[range] || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        <div className="flex gap-1 bg-slate-100 dark:bg-blue-900 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                range === r.key
                  ? 'bg-white dark:bg-blue-800 text-indigo-600 dark:text-indigo-300 shadow'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" opacity={0.4} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="currentColor" className="text-slate-400" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="currentColor" className="text-slate-400" />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#clickGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default ClickChart
