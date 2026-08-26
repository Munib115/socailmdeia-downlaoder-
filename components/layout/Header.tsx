'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { Menu, X, Download } from 'lucide-react';
import { Button } from '../ui/Button';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          return;
        }
      } catch (_) {}
    }

    // Trigger bottom banner guide
    window.dispatchEvent(new CustomEvent('open-pwa-install'));
  };

  const navLinks = [
    { label: 'Downloader', href: '/' },
    { label: 'Supported Platforms', href: '/supported' },
    { label: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0A0A]/75 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 liquid-glass-pill px-3 py-1.5 rounded-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="flex items-center gap-2.5">
          {!isInstalled && (
            <Button
              size="sm"
              variant="elevated"
              onClick={handleInstallClick}
              leftIcon={<Download className="w-3.5 h-3.5 text-accent" />}
              className="text-xs liquid-glass border-white/15 hover:border-accent/40"
            >
              Install App
            </Button>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-xl transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 liquid-glass-elevated px-4 pt-3 pb-5 space-y-1.5 animate-slide-up">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {!isInstalled && (
            <button
              onClick={() => {
                handleInstallClick();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 mt-2 py-3 bg-accent text-white rounded-2xl text-sm font-bold shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Install App to Home Screen</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
