import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, Cpu, HardDrive, Smartphone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About PakGet — Stateless Video Downloader',
  description:
    'Learn how PakGet provides a privacy-first, stateless video downloading utility for supported public social media videos in Pakistan.',
  alternates: { canonical: '/about' },
};

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-success flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
          About PakGet
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          PakGet is built on a single core philosophy: powerful media utilities should be clean, fast, and completely stateless. No signups, no paywalls, and no trackers.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 liquid-glass rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Zero Logging & Privacy</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            We store zero download history, retain no media files on our servers, and require no account creation. Your requests stream directly to your local device.
          </p>
        </div>

        <div className="p-6 liquid-glass rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">High-Performance Engine</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Backed by battle-tested extractors that decode adaptive bitrate streams and extract pristine HD resolutions up to 1080p and 4K.
          </p>
        </div>

        <div className="p-6 liquid-glass rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent">
            <Smartphone className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Mobile-First PWA</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Install PakGet directly onto your iOS or Android home screen. Enjoy full-screen standalone performance, smooth bottom sheets, and native Web Share API integration.
          </p>
        </div>

        <div className="p-6 liquid-glass rounded-3xl space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent">
            <HardDrive className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Direct Stream Piping</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Files stream in real-time as binary chunks without heavy server disk buffering, ensuring low latency and instant response.
          </p>
        </div>
      </div>

      {/* Legal & Terms Notice */}
      <div className="p-6 liquid-glass rounded-3xl space-y-4">
        <h2 className="text-lg font-bold text-text-primary">Terms of Use & Copyright</h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          PakGet is an open utility intended strictly for personal, non-commercial use, such as archiving personal videos, creating local backups of creative assets, or viewing content offline.
        </p>
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <CheckIcon />
            <span>Do not download copyrighted works without permission from the copyright owner.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <CheckIcon />
            <span>PakGet does not bypass digital rights management (DRM) or access private content.</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-text-secondary">
            <CheckIcon />
            <span>PakGet is an independent open-source project and is not affiliated with any social network.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
