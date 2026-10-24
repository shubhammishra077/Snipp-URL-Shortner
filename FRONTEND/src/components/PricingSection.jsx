import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { getPlans, createOrder, verifyPayment } from '../api/payment.api'
import { login } from '../store/slice/authSlice'
import { loadScript } from '../utils/loadScript'

const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

const formatPrice = (paise, currency) => {
  const amount = paise / 100
  if (currency === 'INR') return `₹${amount.toLocaleString('en-IN')}`
  return `${amount} ${currency}`
}

const PricingSection = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [payingPlan, setPayingPlan] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data: plans, isLoading } = useQuery({
    queryKey: ['pricingPlans'],
    queryFn: getPlans,
  })

  const handleUpgrade = async (planKey) => {
    setError('')
    setSuccess('')

    if (!isAuthenticated) {
      setError('Please sign in first to upgrade your plan.')
      return
    }

    setPayingPlan(planKey)
    try {
      await loadScript(RAZORPAY_CHECKOUT_SRC)
      const order = await createOrder(planKey)

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Snipp',
        description: `${order.plan.name} plan - 30 days`,
        order_id: order.orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            const result = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            dispatch(login(result.user))
            setSuccess(`You're now on the ${order.plan.name} plan!`)
          } catch (err) {
            setError(err.message || 'Payment verification failed. If money was deducted, it will be refunded.')
          } finally {
            setPayingPlan(null)
          }
        },
        modal: {
          ondismiss: () => setPayingPlan(null),
        },
      })

      razorpay.on('payment.failed', () => {
        setError('Payment failed. Please try again.')
        setPayingPlan(null)
      })

      razorpay.open()
    } catch (err) {
      setError(err.message || 'Could not start checkout. Please try again.')
      setPayingPlan(null)
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">Loading plans…</p>
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm">{error}</div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm">{success}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {plans?.map((plan, i) => {
          const isCurrent = user?.plan === plan.key
          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl p-6 bg-white/70 dark:bg-white/5 backdrop-blur-xl border shadow-sm flex flex-col ${
                plan.key === 'gold' ? 'border-indigo-400 dark:border-indigo-500/50 ring-1 ring-indigo-400/40' : 'border-slate-200/60 dark:border-white/10'
              }`}
            >
              {plan.key === 'gold' && (
                <span className="self-start mb-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500 text-white">Most popular</span>
              )}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              <p className="mt-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{formatPrice(plan.price, plan.currency)}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400"> /month</span>
              </p>
              <ul className="mt-4 space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade(plan.key)}
                disabled={isCurrent || payingPlan === plan.key}
                className={`mt-6 w-full py-2.5 rounded-xl text-sm font-medium transition-opacity disabled:opacity-60 ${
                  isCurrent
                    ? 'bg-slate-100 dark:bg-blue-900 text-slate-500 dark:text-slate-400 cursor-default'
                    : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:opacity-90'
                }`}
              >
                {isCurrent ? 'Current plan' : payingPlan === plan.key ? 'Opening checkout…' : `Upgrade to ${plan.name}`}
              </button>
            </motion.div>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
        Payments are processed securely by Razorpay. Plans renew for 30 days from the moment of purchase.
      </p>
    </div>
  )
}

export default PricingSection
