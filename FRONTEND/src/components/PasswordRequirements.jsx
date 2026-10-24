import React from 'react'
import { PASSWORD_REQUIREMENTS } from '../utils/passwordPolicy'

const PasswordRequirements = ({ password }) => {
  return (
    <ul className="space-y-1 text-xs mt-1.5">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const met = req.test(password || '')
        return (
          <li key={req.key} className={`flex items-center gap-1.5 transition-colors ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
            <span>{met ? '✓' : '○'}</span>
            {req.label}
          </li>
        )
      })}
    </ul>
  )
}

export default PasswordRequirements
