import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import UrlForm from '../components/UrlForm'
import UserUrl from '../components/UserUrl'
import BulkShortenForm from '../components/BulkShortenForm'
import StatCard from '../components/StatCard'
import ClickChart from '../components/ClickChart'
import RecentActivity from '../components/RecentActivity'
import PopularLinks from '../components/PopularLinks'
import ProfileTab from '../components/ProfileTab'
import VerifyEmailBanner from '../components/VerifyEmailBanner'
import { getDashboardSummary } from '../api/analytics.api'

const SECTIONS = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'links', label: 'Links', icon: '🔗' },
  { key: 'profile', label: 'Profile', icon: '👤' },
]

const CREATE_TABS = [
  { key: 'single', label: 'Create Link' },
  { key: 'bulk', label: 'Bulk Shorten' },
]

const DashboardPage = () => {
  const [section, setSection] = useState('overview')
  const [createTab, setCreateTab] = useState('single')
  const { data } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
    refetchInterval: 30000,
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-[#020817] dark:to-blue-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-slate-900 dark:text-white"
          >
            Dashboard
          </motion.h1>

          <div className="flex gap-1 bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-xl p-1 border border-slate-200/60 dark:border-white/10">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  section === s.key
                    ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>{s.icon}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        <VerifyEmailBanner />

        {section === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Links" value={data?.totalLinks ?? '–'} icon="🔗" color="indigo" delay={0} />
              <StatCard label="Total Clicks" value={data?.totalClicks ?? '–'} icon="👆" color="fuchsia" delay={0.05} />
              <StatCard label="Unique Clicks" value={data?.uniqueClicks ?? '–'} icon="👤" color="emerald" delay={0.1} />
              <StatCard
                label="Avg Clicks / Link"
                value={data?.totalLinks ? Math.round((data.totalClicks / data.totalLinks) * 10) / 10 : '–'}
                icon="📈"
                color="amber"
                delay={0.15}
              />
            </div>

            <ClickChart charts={{ daily: data?.clicksOverTime || [] }} title="Clicks Over Time (Last 30 Days)" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RecentActivity items={data?.recentActivity || []} />
              <PopularLinks links={data?.popularLinks || []} />
            </div>
          </>
        )}

        {section === 'links' && (
          <>
            {data?.linkLimit && data.totalLinks >= data.linkLimit && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm"
              >
                You've reached your plan's limit of {data.linkLimit} links. Delete an old link or{' '}
                <a href="/pricing" className="underline font-medium">upgrade your plan</a> to create more.
              </motion.div>
            )}

            <div className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex gap-1 bg-slate-100 dark:bg-blue-900 rounded-lg p-1 w-fit mb-5">
                {CREATE_TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setCreateTab(t.key)}
                    className={`text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
                      createTab === t.key
                        ? 'bg-white dark:bg-blue-800 text-indigo-600 dark:text-indigo-300 shadow'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {createTab === 'single' ? <UrlForm /> : <BulkShortenForm />}
            </div>

            <UserUrl />
          </>
        )}

        {section === 'profile' && <ProfileTab dashboard={data} />}
      </div>
    </div>
  )
}

export default DashboardPage
