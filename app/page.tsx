'use client';

import React, { useState, useEffect } from 'react';
import { URLInput } from '@/components/downloader/URLInput';
import { VideoPreview } from '@/components/downloader/VideoPreview';
import { DownloadState } from '@/components/downloader/DownloadButton';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PlatformGrid } from '@/components/home/PlatformGrid';
import { FAQ } from '@/components/home/FAQ';
import { Toast, ToastMessage } from '@/components/ui/Toast';
import { detectPlatform, PLATFORMS, PlatformConfig } from '@/lib/platforms';
import { VideoMetadata } from '@/lib/ytdlp';
import { fetchVideoInfoClient, mapErrorMessage, buildDownloadUrl } from '@/lib/api';
import { YouTubeIcon } from '@/components/icons/platforms/YouTube';
import { InstagramIcon } from '@/components/icons/platforms/Instagram';
import { TikTokIcon } from '@/components/icons/platforms/TikTok';
import { FacebookIcon } from '@/components/icons/platforms/Facebook';
import { TwitterIcon } from '@/components/icons/platforms/Twitter';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformConfig | null>(null);
  const [state, setState] = useState<DownloadState>('IDLE');
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [progress, setProgress] = useState(0);

  // Auto-detect platform whenever URL changes
  useEffect(() => {
    if (!url.trim()) {
      setDetectedPlatform(null);
      setErrorMessage(null);
      if (state !== 'DOWNLOADING') {
        setState('IDLE');
        setVideoData(null);
      }
      return;
    }

    const platform = detectPlatform(url);
    setDetectedPlatform(platform);
    setErrorMessage(null);
  }, [url, state]);

  // Handle URL fetch / submit
  const handleFetchVideo = async (targetUrl?: string) => {
    const activeUrl = (targetUrl || url).trim();
    if (!activeUrl) {
      setErrorMessage('Please enter or paste a valid video URL.');
      return;
    }

    const platform = detectPlatform(activeUrl);
    if (!platform) {
      setErrorMessage("We don't support this platform yet. Try YouTube, Instagram, TikTok, Facebook, or Twitter.");
      setState('ERROR');
      return;
    }

    setState('DETECTING');
    setErrorMessage(null);

    try {
      const data = await fetchVideoInfoClient(activeUrl);
      setVideoData(data);
      setState('PREVIEWING');
    } catch (err: any) {
      const mapped = mapErrorMessage(err);
      setErrorMessage(mapped.message);
      setState('ERROR');
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: mapped.message,
      });
    }
  };

  const handleDownload = (formatId: string, isAudioOnly: boolean, videoTitle?: string) => {
    if (!url.trim() && !videoData?.url) return;

    const downloadTargetUrl = videoData?.url || url;
    const titleToUse = videoTitle || videoData?.title || '';
    setState('DOWNLOADING');
    setProgress(30);

    const downloadEndpoint = buildDownloadUrl(downloadTargetUrl, formatId, isAudioOnly, titleToUse);

    // Trigger file download immediately
    const link = document.createElement('a');
    link.href = downloadEndpoint;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 25;
      });
    }, 200);

    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setState('COMPLETE');
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Download started instantly!',
      });
    }, 1000);
  };

  const handleClear = () => {
    setUrl('');
    setDetectedPlatform(null);
    setVideoData(null);
    setErrorMessage(null);
    setState('IDLE');
  };

  const handleQuickPlatformPillClick = (platformId: string) => {
    const p = PLATFORMS[platformId as keyof typeof PLATFORMS];
    if (p) {
      const example = p.urlPlaceholder.split(' or ')[0];
      setUrl(example);
      handleFetchVideo(example);
    }
  };

  return (
    <div className="w-full space-y-16 sm:space-y-24">
      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* SECTION 1: HERO / INPUT AREA */}
      <section className="w-full text-center space-y-8 pt-4 sm:pt-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Top Liquid Glass Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-pill text-xs font-bold text-text-secondary border border-white/15 shadow-md">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-text-primary">PakGet Engine</span>
            <span className="text-text-muted">•</span>
            <span className="text-accent font-semibold">100% Stateless & Free</span>
          </div>

          <h1 className="font-black tracking-tight text-3xl sm:text-5xl md:text-6xl leading-[1.18] select-none">
            <span className="block bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(255,255,255,0.2)]">
              Free video downloader in Pakistan.
            </span>
            <span className="inline-block mt-2 sm:mt-3">
              <span className="inline-block px-4 py-1.5 sm:px-6 sm:py-2 rounded-2xl liquid-glass-elevated border border-accent/40 shadow-2xl relative overflow-hidden group">
                <span className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-300 bg-clip-text text-transparent font-black drop-shadow-[0_0_35px_rgba(37,99,235,0.7)]">
                  Paste a link. Done.
                </span>
              </span>
            </span>
          </h1>

          <p className="text-sm sm:text-base text-text-secondary max-w-lg mx-auto leading-relaxed pt-1">
            Download supported public videos from YouTube, Instagram Reels, TikTok, Facebook, and X. Fast, free, and no account required.
          </p>
        </div>

        {/* Input & Action Wrapper */}
        <div className="max-w-2xl mx-auto space-y-4 text-left">
          <URLInput
            value={url}
            onChange={(newVal) => setUrl(newVal)}
            onSubmit={() => handleFetchVideo()}
            onClear={handleClear}
            platform={detectedPlatform}
            isLoading={state === 'DETECTING'}
            errorMessage={errorMessage}
          />

          {/* Quick Submit button on mobile / desktop */}
          {url && state !== 'PREVIEWING' && state !== 'DOWNLOADING' && (
            <button
              onClick={() => handleFetchVideo()}
              disabled={state === 'DETECTING'}
              className="w-full py-3.5 bg-accent hover:bg-accent-hover active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Fetch Video</span>
            </button>
          )}

          {/* Horizontal Platform Pills */}
          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2 text-center sm:text-left">
              Quick Support Platforms
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
              <button
                type="button"
                onClick={() => handleQuickPlatformPillClick('youtube')}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all active:scale-95"
              >
                <YouTubeIcon className="w-4 h-4 text-[#FF0000]" />
                <span>YouTube</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPlatformPillClick('instagram')}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all active:scale-95"
              >
                <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                <span>Instagram</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPlatformPillClick('tiktok')}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all active:scale-95"
              >
                <TikTokIcon className="w-4 h-4 text-text-primary" />
                <span>TikTok</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPlatformPillClick('facebook')}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all active:scale-95"
              >
                <FacebookIcon className="w-4 h-4 text-[#1877F2]" />
                <span>Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPlatformPillClick('twitter')}
                className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all active:scale-95"
              >
                <TwitterIcon className="w-4 h-4 text-[#1DA1F2]" />
                <span>Twitter / X</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: VIDEO PREVIEW (When video info loaded) */}
        {videoData && (
          <div className="max-w-2xl mx-auto pt-2">
            <VideoPreview
              metadata={videoData}
              platform={detectedPlatform}
              downloadState={state}
              progress={progress}
              onDownload={handleDownload}
            />
          </div>
        )}
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <HowItWorks />

      {/* SECTION 4: SUPPORTED PLATFORMS */}
      <PlatformGrid onSelectPlatform={(example) => {
        setUrl(example);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }} />

      {/* SECTION 5: FAQ ACCORDION */}
      <FAQ />
    </div>
  );
}
