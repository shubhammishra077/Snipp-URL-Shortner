import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { useNavigate, Link } from '@tanstack/react-router'
import { logoutUser, updateProfile } from '../api/user.api'
import { logout, login } from '../store/slice/authSlice'
import ThemeToggle from './ThemeToggle'

const PLAN_LABELS = { free: 'Free', silver: 'Silver', gold: 'Gold', platinum: 'Platinum' }

const ProfileTab = ({ dashboard }) => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', profession: user?.profession || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  const handleLogout = async () => {
    try { await logoutUser() } catch { /* ignore */ }
    dispatch(logout())
    navigate({ to: '/' })
  }

  const startEditing = () => {
    setForm({ name: user?.name || '', email: user?.email || '', profession: user?.profession || '' })
    setError(null)
    setEditing(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const updatedUser = await updateProfile(form)
      dispatch(login(updatedUser))
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const linkLimit = dashboard?.linkLimit
  const totalLinks = dashboard?.totalLinks ?? 0
  const usagePct = linkLimit ? Math.min(100, Math.round((totalLinks / linkLimit) * 100)) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center gap-5 flex-wrap mb-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-[180px]">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            {user?.profession && <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">{user.profession}</p>}
          </div>
          <div className="flex gap-2">
            {!editing && (
              <button
                onClick={startEditing}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
              >
                Edit Profile
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              Log out
            </button>
          </div>
        </div>

        {saved && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-emerald-600 dark:text-emerald-400">
            ✓ Profile updated
          </motion.p>
        )}

        {editing && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleSave}
            className="mt-4 pt-4 border-t border-slate-200/60 dark:border-white/10 space-y-3"
          >
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm">{error}</div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Profession</label>
              <input
                type="text"
                value={form.profession}
                onChange={(e) => setForm({ ...form, profession: e.target.value })}
                placeholder="e.g. Marketing Manager"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-blue-800 bg-white/80 dark:bg-blue-900/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-blue-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-blue-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Links</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{dashboard?.totalLinks ?? '–'}</p>
        </div>
        <div className="rounded-2xl p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Clicks</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{dashboard?.totalClicks ?? '–'}</p>
        </div>
        <div className="rounded-2xl p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Date Joined</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '–'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">Plan &amp; Usage</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 capitalize">
            {PLAN_LABELS[dashboard?.plan] || dashboard?.plan || 'Free'}
          </span>
        </div>
        {linkLimit ? (
          <>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
              {totalLinks} / {linkLimit} links used
            </p>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-blue-900 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${usagePct >= 90 ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Unlimited links on your plan.</p>
        )}
        {dashboard?.planExpiresAt && dashboard.plan !== 'free' && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Renews on {new Date(dashboard.planExpiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
          Free plan links are automatically removed after {dashboard?.linkExpiryDays ?? 30} days with no clicks.
        </p>
        <Link
          to="/pricing"
          className="inline-block mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90 transition-opacity"
        >
          {dashboard?.plan === 'platinum' ? 'Manage plan' : 'Upgrade plan'}
        </Link>
      </div>

      <div className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Appearance</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Toggle dark mode for this device</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 shadow-sm">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">🔒 Security</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your links can be password protected, your click analytics use hashed IPs (we never store raw IPs),
          and every link is validated to block unsafe or internal-network URLs.
        </p>
      </div>
    </motion.div>
  )
}

export default ProfileTab
