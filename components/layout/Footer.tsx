import React from 'react';
import Link from 'next/link';
import { Logo } from '../ui/Logo';

export function Footer() {
  return (
    <footer className="w-full bg-[#0A0A0A]/80 backdrop-blur-2xl border-t border-white/10 mt-20 relative overflow-hidden">
      {/* Subtle bottom ambient light glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-accent/10 blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <Logo size="md" />
            <p className="text-xs text-text-muted max-w-sm leading-relaxed">
              A high-performance, stateless progressive web app for downloading social media in HD without accounts or tracking.
            </p>
          </div>

          {/* Liquid Glass Capsule Links like Header */}
          <div className="flex flex-wrap items-center gap-2 liquid-glass-pill px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <Link
              href="/"
              className="px-3 py-1 rounded-full text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all"
            >
              Downloader
            </Link>
            <span className="text-white/10">•</span>
            <Link
              href="/supported"
              className="px-3 py-1 rounded-full text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all"
            >
              Supported Platforms
            </Link>
            <span className="text-white/10">•</span>
            <Link
              href="/about"
              className="px-3 py-1 rounded-full text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-white/10 transition-all"
            >
              About & Privacy
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-text-muted">
          <div>
            © {new Date().getFullYear()} <span className="font-bold text-text-secondary">PakGet</span>. All rights reserved. Not affiliated with YouTube, Meta, ByteDance, or X.
          </div>
          <div>
            Purely for personal, non-commercial use only. Respect copyright laws and creators&apos; rights.
          </div>
        </div>
      </div>
    </footer>
  );
}
