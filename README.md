# URL Shortener

A full-stack URL shortener with user accounts, link analytics, QR codes, password-protected links, and bulk shortening.

## Features

- Custom short links, with reserved-slug protection
- **Password-protected links** — visitors must enter a password before being redirected
- **QR codes** generated per link, downloadable as PNG
- **Bulk shortening** — up to 50 URLs in one request
- **Analytics dashboard**
  - Total links, total clicks, unique clicks
  - Click graph (daily / weekly / monthly)
  - Recent activity feed
  - Popular links
  - Per-link breakdowns: browser, device, OS, country, city
- **Dark mode** with glassmorphism UI and Framer Motion animations
- Rate limiting, SSRF-safe URL validation, `helmet` security headers

## Setup

### Backend

```bash
cd BACKEND
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, etc.
npm run dev
```

### Frontend

```bash
cd FRONTEND
npm install
cp .env.example .env   # set VITE_API_URL if backend isn't on localhost:3000
npm run dev
```

## Notes

- Geo-IP lookups use the `geoip-lite` package's bundled (offline) database — no external API key required, but city-level accuracy is limited.
- Click uniqueness is computed from a salted hash of the visitor's IP — raw IPs are never stored.
- The redirect route serves a self-contained HTML "unlock" page for password-protected links (no frontend routing involved), so short links work even when opened outside the app.
