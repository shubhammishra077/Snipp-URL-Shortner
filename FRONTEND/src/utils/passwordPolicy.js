export const PASSWORD_REQUIREMENTS = [
  { key: 'length', label: 'At least 10 characters', test: (pw) => pw.length >= 10 },
  { key: 'letter', label: 'At least one letter', test: (pw) => /[a-zA-Z]/.test(pw) },
  { key: 'number', label: 'At least one number', test: (pw) => /[0-9]/.test(pw) },
  { key: 'special', label: 'At least one special character', test: (pw) => /[^a-zA-Z0-9]/.test(pw) },
]

export const isPasswordValid = (password) =>
  PASSWORD_REQUIREMENTS.every((req) => req.test(password || ''))
