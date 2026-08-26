import React from 'react';
import { PlatformConfig } from '@/lib/platforms';
import { YouTubeIcon } from '../icons/platforms/YouTube';
import { InstagramIcon } from '../icons/platforms/Instagram';
import { TikTokIcon } from '../icons/platforms/TikTok';
import { FacebookIcon } from '../icons/platforms/Facebook';
import { TwitterIcon } from '../icons/platforms/Twitter';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlatformBadgeProps {
  platform: PlatformConfig | null;
  size?: 'sm' | 'md';
  className?: string;
}

export function PlatformBadge({ platform, size = 'md', className }: PlatformBadgeProps) {
  if (!platform) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-elevated text-text-muted text-xs font-medium border border-border select-none',
          className
        )}
      >
        <Globe className="w-3.5 h-3.5" />
        <span>Auto-detect</span>
      </div>
    );
  }

  const renderIcon = () => {
    switch (platform.id) {
      case 'youtube':
        return <YouTubeIcon className="w-4 h-4 text-[#FF0000]" />;
      case 'instagram':
        return <InstagramIcon className="w-4 h-4 text-[#E1306C]" />;
      case 'tiktok':
        return <TikTokIcon className="w-4 h-4 text-text-primary" />;
      case 'facebook':
        return <FacebookIcon className="w-4 h-4 text-[#1877F2]" />;
      case 'twitter':
        return <TwitterIcon className="w-4 h-4 text-[#1DA1F2]" />;
      default:
        return <Globe className="w-4 h-4 text-text-secondary" />;
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all animate-fade-in select-none',
        platform.accentColor,
        className
      )}
    >
      {renderIcon()}
      <span>{platform.shortName}</span>
    </div>
  );
}
