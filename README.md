# Convly – Frontend

> Modern React dashboard for Convly – AI-powered DM booking automation platform.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **TailwindCSS** | Styling |
| **Zustand** | State management |
| **React Query** | Server state & caching |
| **Framer Motion** | Animations |
| **Recharts** | Analytics charts |
| **React Router DOM** | Routing |
| **Lucide React** | Icons |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api` requests to `http://localhost:3000`.

## Project Structure

```
src/
├── api/            → API client functions (axios)
├── components/
│   ├── landing/    → Landing page components
│   └── ui/         → Reusable UI components (Button, Modal, Badge, etc.)
├── pages/
│   ├── dashboard/  → Dashboard pages (Overview, Bookings, Channels, etc.)
│   │   └── admin/  → Super Admin pages (Tenants, Blog, Settings)
│   ├── Landing.tsx → Public landing page
│   ├── Login.tsx   → Authentication
│   └── Onboarding.tsx → New tenant onboarding
├── store/          → Zustand stores (auth, theme, i18n)
├── App.tsx         → Routes & auth guards
└── main.tsx        → Entry point
```

## Features

- 🌙 **Dark/Light mode** toggle
- 🌐 **Multi-language** support (EN/AR)
- 📊 **Analytics dashboard** with Recharts
- 📝 **Markdown blog editor** with live preview
- 📥 **CSV export** for bookings
- 🔔 **Push notifications** via Service Worker
- 💬 **Unified inbox** across all channels
- 🔐 **JWT auth** with automatic token refresh

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## License

Private – All rights reserved.
