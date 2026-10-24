import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { getLinkAnalytics } from '../api/analytics.api'
import StatCard from '../components/StatCard'
import ClickChart from '../components/ClickChart'
import BreakdownChart from '../components/BreakdownChart'
import GeoBreakdown from '../components/GeoBreakdown'
import RecentActivity from '../components/RecentActivity'
import QrCodeModal from '../components/QrCodeModal'
import { API_BASE_URL } from '../utils/constants'

const AnalyticsPage = () => {
  const { shortUrl } = useParams({ strict: false })
  const [showQr, setShowQr] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['linkAnalytics', shortUrl],
    queryFn: () => getLinkAnalytics(shortUrl),
    refetchInterval: 30000,
  })

  const fullShort = `${API_BASE_URL}/${shortUrl}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#020817] dark:to-blue-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link to="/dashboard" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              ← Back to Dashboard
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-slate-900 dark:text-white mt-1"
            >
              {data?.link?.title || `/${shortUrl}`}
            </motion.h1>
            {data?.link && (
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xl">
                {fullShort} → {data.link.full_url}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowQr(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90"
          >
            View QR Code
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
          </div>
        )}

        {isError && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <StatCard label="Total Clicks" value={data.totalClicks} icon="👆" color="indigo" delay={0} />
              <StatCard label="Unique Clicks" value={data.uniqueClicks} icon="👤" color="fuchsia" delay={0.05} />
            </div>

            <ClickChart charts={data.charts} title="Clicks Over Time" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BreakdownChart title="Browsers" data={data.breakdown.browsers} />
              <BreakdownChart title="Devices" data={data.breakdown.devices} />
              <BreakdownChart title="Operating System" data={data.breakdown.os} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GeoBreakdown title="Top Countries" data={data.breakdown.countries} />
              <GeoBreakdown title="Top Cities" data={data.breakdown.cities} />
            </div>

            <RecentActivity
              items={data.recentActivity.map((c) => ({ ...c, shortUrl }))}
            />
          </>
        )}
      </div>
      <QrCodeModal shortCode={showQr ? shortUrl : null} onClose={() => setShowQr(false)} />
    </div>
  )
}

export default AnalyticsPage
