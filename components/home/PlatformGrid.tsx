import React from 'react';
import { PLATFORMS } from '@/lib/platforms';
import { YouTubeIcon } from '../icons/platforms/YouTube';
import { InstagramIcon } from '../icons/platforms/Instagram';
import { TikTokIcon } from '../icons/platforms/TikTok';
import { FacebookIcon } from '../icons/platforms/Facebook';
import { TwitterIcon } from '../icons/platforms/Twitter';
import { Badge } from '../ui/Badge';
import { Check } from 'lucide-react';

interface PlatformGridProps {
  onSelectPlatform?: (urlExample: string) => void;
}

export function PlatformGrid({ onSelectPlatform }: PlatformGridProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'youtube':
        return <YouTubeIcon className="w-6 h-6 text-[#FF0000]" />;
      case 'instagram':
        return <InstagramIcon className="w-6 h-6 text-[#E1306C]" />;
      case 'tiktok':
        return <TikTokIcon className="w-6 h-6 text-text-primary" />;
      case 'facebook':
        return <FacebookIcon className="w-6 h-6 text-[#1877F2]" />;
      case 'twitter':
        return <TwitterIcon className="w-6 h-6 text-[#1DA1F2]" />;
      default:
        return null;
    }
  };

  return (
    <section className="w-full space-y-6 cv-auto">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Supported Platforms
        </h2>
        <p className="text-sm text-text-secondary">
          Optimized download engines tailored for all major social networks.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.values(PLATFORMS).map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectPlatform && onSelectPlatform(p.urlPlaceholder.split(' or ')[0])}
            className="p-6 liquid-glass rounded-3xl space-y-4 hover:border-accent/50 transition-all cursor-pointer group shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  {getIcon(p.id)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">{p.name}</h3>
                  <span className="text-[11px] text-text-muted">
                    {p.hasAudioOnly ? 'Video & Audio' : 'Video only'}
                  </span>
                </div>
              </div>
              <Badge variant="outline" size="sm" className="bg-white/5 border-white/10">
                {p.hasQualitySelect ? 'HD / 1080p' : 'HD'}
              </Badge>
            </div>

            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-text-muted">Supported formats:</div>
              <div className="flex flex-wrap gap-1.5">
                {p.supportedMedia.map((media) => (
                  <span
                    key={media}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-xl bg-white/5 border border-white/5 text-text-secondary"
                  >
                    <Check className="w-3 h-3 text-accent" />
                    <span>{media}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
