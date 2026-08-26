'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, ShieldCheck, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Always show the prompt smoothly after 1.5 seconds on first visit
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('snapget_pwa_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsVisible(false);
          setDeferredPrompt(null);
          return;
        }
      } catch (_) {
        // Fallback to instruction guide
      }
    }

    // If deferredPrompt is not available (e.g. iOS or manual browser install)
    setShowInstructions(true);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('snapget_pwa_dismissed', 'true');
  };

  if (!isVisible || isInstalled) return null;

  return (
    <aside
      aria-label="Install SnapGet App Prompt"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-slide-up"
    >
      <div className="liquid-glass-elevated rounded-3xl p-5 shadow-2xl relative overflow-hidden border border-white/15">
        {/* Ambient background glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-accent/25 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-text-muted hover:text-text-primary hover:bg-white/10 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* App Icon */}
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg flex-shrink-0 border border-white/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M12 4v12" />
              <path d="m7 11 5 5 5-5" />
              <path d="M5 20h14" />
            </svg>
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                {isIOS ? 'iOS Web App' : 'Progressive Web App'}
              </span>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span className="text-[11px] text-text-muted">Free & Fast</span>
            </div>
            <h2 className="text-base font-bold text-text-primary mt-0.5 leading-snug">
              Install PakGet App
            </h2>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              Install our standalone app for instant downloads, 4K HD media saving, and 1-tap pasting from your home screen.
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1 text-[11px] font-medium text-text-secondary bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span>Zero Ads</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-text-secondary bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
            {isIOS ? <Smartphone className="w-3.5 h-3.5 text-accent" /> : <Monitor className="w-3.5 h-3.5 text-accent" />}
            <span>1-Tap Launch</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-text-secondary bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
            <Check className="w-3.5 h-3.5 text-accent" />
            <span>Stateless</span>
          </div>
        </div>

        {/* Actions or Instructions */}
        {!showInstructions ? (
          <div className="flex items-center gap-2.5 mt-4">
            <Button
              size="md"
              variant="primary"
              onClick={handleInstall}
              leftIcon={<Download className="w-4 h-4" />}
              className="flex-1 text-xs sm:text-sm font-bold shadow-lg"
            >
              Install App Now
            </Button>
            <button
              onClick={handleDismiss}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              Not Now
            </button>
          </div>
        ) : (
          <div className="mt-4 p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2.5 animate-fade-in text-xs text-text-secondary">
            {isIOS ? (
              <>
                <div className="font-bold text-text-primary text-xs">How to add to iOS Home Screen:</div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-[11px]">1</span>
                  <span>Tap the <strong className="text-text-primary">Share</strong> button (bottom of Safari)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-[11px]">2</span>
                  <span>Select <strong className="text-text-primary">Add to Home Screen</strong></span>
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-text-primary text-xs">How to install on Desktop / Mobile:</div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-[11px]">1</span>
                  <span>Click the <strong className="text-text-primary">Install icon (⊕ or ⭳)</strong> in your browser&apos;s address bar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center text-[11px]">2</span>
                  <span>Or open browser menu (⋮) → <strong className="text-text-primary">Install SnapGet</strong></span>
                </div>
              </>
            )}
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowInstructions(false)}
              className="w-full mt-2 text-xs"
            >
              Got it
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
