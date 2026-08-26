# SnapGet — Social Media Video Downloader PWA

SnapGet is a mobile-first, high-performance Progressive Web App (PWA) built with **Next.js 14 (App Router)** and **Tailwind CSS**. It is a purely stateless media download utility for YouTube, Instagram, TikTok, Facebook, and Twitter/X with zero accounts, no tracking, and no databases.

---

## Features

- **Multi-Platform Support**: YouTube (Videos, Shorts, MP3), Instagram (Reels, Posts), TikTok (No Watermark), Facebook (Public videos), and Twitter/X.
- **Satoshi Typography & Clean Utility Aesthetic**: High-contrast dark theme (`#0F0F0F` / `#1A1A1A` / `#2563EB`).
- **Progressive Web App (PWA)**:
  - Standalone mobile mode (`viewport-fit=cover`)
  - Service worker caching (`sw.js`)
  - Web Share API (`navigator.share`) for direct sharing to gallery or apps
  - Dynamic "Add to Home Screen" install prompt
  - Mobile bottom sheet for format and quality selection
- **Stateless Architecture**: Zero database, no Supabase, no user auth, and no cookies.
- **Production-Ready Streaming**: Real-time binary stream piping via `yt-dlp`.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Icons**: [Lucide React](https://lucide.dev) & Custom SVG Platform Logos
- **Font**: Satoshi via Fontshare
- **Engine**: `yt-dlp` (Local subprocess or Python FastAPI microservice)

---

## Local Development

### 1. Prerequisites

- **Node.js 18+** & **npm**
- **Python 3.8+** with `yt-dlp` installed:
  ```bash
  pip install yt-dlp
  ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Next.js Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Architecture & Production Deployment

Because serverless platforms like Vercel do not permit persistent binary execution, the app supports an optional `BACKEND_API_URL` environment variable to connect to a lightweight Python microservice.

```
[Next.js Frontend (Vercel)] ──> [Next.js API Routes] ──> [FastAPI Backend (Railway/Render)]
                                                                    │
                                                                 yt-dlp
```

### Deploying the FastAPI Backend (Railway / Render / VPS)

1. Navigate to the `backend/` directory or push it to a separate repository:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```
2. Deploy the `backend/Dockerfile` directly on **Railway** or **Render**.
3. In your Next.js environment (`.env.local` or Vercel Environment Variables), set:
   ```env
   BACKEND_API_URL=https://your-backend-service.railway.app
   ```

---

## Project Structure

```
downloader/
├── app/
│   ├── layout.tsx              # Root Layout, PWA Meta & Font
│   ├── page.tsx                # Main Downloader UI & State Machine
│   ├── globals.css             # Satoshi font, CSS variables, touch targets
│   ├── about/page.tsx          # Privacy & Architecture Philosophy
│   ├── supported/page.tsx      # Platform Matrix & Format Guide
│   └── api/
│       ├── info/route.ts       # Video metadata extraction
│       ├── download/route.ts   # Stream handler with format selection
│       └── platforms/          # Dedicated platform endpoints
├── components/
│   ├── downloader/             # URLInput, VideoPreview, FormatSelector, DownloadButton, ProgressBar
│   ├── home/                   # HowItWorks, PlatformGrid, FAQ
│   ├── layout/                 # Header, Footer
│   ├── ui/                     # Button, Input, Badge, Spinner, Toast, BottomSheet, Logo
│   └── icons/platforms/        # Clean SVG icons (YouTube, Instagram, TikTok, Facebook, Twitter)
├── lib/
│   ├── platforms.ts            # Platform configurations & URL detection
│   ├── utils.ts                # Duration & byte formatters, class merging
│   ├── ytdlp.ts                # Local & remote yt-dlp executor
│   └── api.ts                  # Client fetch wrappers & error mapping
├── public/
│   ├── manifest.json           # PWA Web App Manifest
│   ├── sw.js                   # Service worker cache
│   └── icons/                  # PWA icons (192x192, 512x512, maskable)
└── backend/
    ├── main.py                 # FastAPI microservice for Railway/Render
    ├── Dockerfile              # Container definition with ffmpeg + yt-dlp
    └── requirements.txt        # Python dependencies
```

---

## Disclaimer

SnapGet is intended purely for personal, non-commercial use (e.g. archiving personal creations or offline viewing of public media). Please respect all copyright laws and the intellectual property rights of content creators.
