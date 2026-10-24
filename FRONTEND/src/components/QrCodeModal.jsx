import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getQrCode } from '../api/shortUrl.api'

const COLORS = [
  { hex: '111827', label: 'Black' },
  { hex: 'dc2626', label: 'Red' },
  { hex: 'ea580c', label: 'Orange' },
  { hex: '16a34a', label: 'Green' },
  { hex: '0284c7', label: 'Sky' },
  { hex: '4f46e5', label: 'Indigo' },
  { hex: '9333ea', label: 'Violet' },
  { hex: 'db2777', label: 'Pink' },
]

const QrCodeModal = ({ shortCode, onClose }) => {
  const [qr, setQr] = useState(null)
  const [error, setError] = useState(null)
  const [color, setColor] = useState(COLORS[0].hex)
  const [frame, setFrame] = useState(true)

  useEffect(() => {
    if (!shortCode) return
    setQr(null)
    setError(null)
    getQrCode(shortCode, color).then(setQr).catch((e) => setError(e.message || 'Failed to load QR code'))
  }, [shortCode, color])

  useEffect(() => {
    if (shortCode) { setColor(COLORS[0].hex); setFrame(true) }
  }, [shortCode])

  const handleDownload = () => {
    if (!qr) return
    if (!frame) {
      const a = document.createElement('a')
      a.href = qr
      a.download = `${shortCode}-qrcode.png`
      a.click()
      return
    }
    // Compose the framed version onto a canvas for download
    const img = new Image()
    img.onload = () => {
      const pad = 32
      const captionH = 40
      const canvas = document.createElement('canvas')
      canvas.width = img.width + pad * 2
      canvas.height = img.height + pad * 2 + captionH
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, pad, pad)
      ctx.fillStyle = '#111827'
      ctx.font = 'bold 20px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('SCAN ME', canvas.width / 2, img.height + pad + 28)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `${shortCode}-qrcode.png`
      a.click()
    }
    img.src = qr
  }

  return (
    <AnimatePresence>
      {shortCode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-blue-950 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl border border-slate-200 dark:border-blue-800"
          >
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Customize QR Code</h3>

            <div className={`w-56 h-56 mx-auto flex flex-col items-center justify-center bg-white rounded-xl mb-4 ${frame ? 'ring-1 ring-slate-200 shadow-inner p-3' : ''}`}>
              {error && <p className="text-sm text-red-500 px-4">{error}</p>}
              {!error && !qr && (
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
              )}
              {qr && (
                <>
                  <img src={qr} alt="QR code" className="w-44 h-44" />
                  {frame && <p className="text-xs font-bold tracking-wide text-slate-800 mt-1">SCAN ME</p>}
                </>
              )}
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 text-left">Color</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setColor(c.hex)}
                    title={c.label}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c.hex ? 'border-indigo-500 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: `#${c.hex}` }}
                  />
                ))}
              </div>
            </div>

            <label className="flex items-center justify-center gap-2 mb-4 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={frame} onChange={(e) => setFrame(e.target.checked)} className="accent-indigo-500" />
              "Scan Me" frame
            </label>

            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                disabled={!qr}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-medium disabled:opacity-50"
              >
                Download
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-blue-900 text-slate-700 dark:text-slate-200 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default QrCodeModal
