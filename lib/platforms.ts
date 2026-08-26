export type PlatformId = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  shortName: string;
  domains: string[];
  color: string;
  accentColor: string;
  urlPlaceholder: string;
  supportedMedia: string[];
  hasAudioOnly: boolean;
  hasQualitySelect: boolean;
  qualities: string[];
}

export const PLATFORMS: Record<PlatformId, PlatformConfig> = {
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    shortName: 'YouTube',
    domains: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com'],
    color: '#FF0000',
    accentColor: 'text-[#FF0000] border-[#FF0000]/30 bg-[#FF0000]/10',
    urlPlaceholder: 'https://www.youtube.com/watch?v=... or youtu.be/...',
    supportedMedia: ['Videos', 'Shorts', 'Audio / MP3', 'Playlists'],
    hasAudioOnly: true,
    hasQualitySelect: true,
    qualities: ['1080p Full HD', '720p HD', '480p SD', '360p Low', 'Audio Only (MP3)'],
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    shortName: 'Instagram',
    domains: ['instagram.com', 'www.instagram.com', 'instagr.am'],
    color: '#E1306C',
    accentColor: 'text-[#E1306C] border-[#E1306C]/30 bg-[#E1306C]/10',
    urlPlaceholder: 'https://www.instagram.com/reel/... or /p/...',
    supportedMedia: ['Reels', 'Video Posts', 'Carousels', 'Stories (Public)'],
    hasAudioOnly: false,
    hasQualitySelect: false,
    qualities: ['Best Quality (HD)'],
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    shortName: 'TikTok',
    domains: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'],
    color: '#00F2FE',
    accentColor: 'text-[#00F2FE] border-[#00F2FE]/30 bg-[#00F2FE]/10',
    urlPlaceholder: 'https://www.tiktok.com/@user/video/... or vm.tiktok.com/...',
    supportedMedia: ['Videos (No Watermark)', 'HD Downloads'],
    hasAudioOnly: false,
    hasQualitySelect: false,
    qualities: ['No Watermark HD'],
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    shortName: 'Facebook',
    domains: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch', 'web.facebook.com'],
    color: '#1877F2',
    accentColor: 'text-[#1877F2] border-[#1877F2]/30 bg-[#1877F2]/10',
    urlPlaceholder: 'https://www.facebook.com/watch/?v=... or fb.watch/...',
    supportedMedia: ['Public Videos', 'Reels', 'Watch Clips'],
    hasAudioOnly: false,
    hasQualitySelect: true,
    qualities: ['HD High Quality', 'SD Standard'],
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    shortName: 'X / Twitter',
    domains: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com', 'mobile.twitter.com'],
    color: '#1DA1F2',
    accentColor: 'text-[#1DA1F2] border-[#1DA1F2]/30 bg-[#1DA1F2]/10',
    urlPlaceholder: 'https://x.com/user/status/... or twitter.com/...',
    supportedMedia: ['Videos', 'GIFs', 'Clips'],
    hasAudioOnly: false,
    hasQualitySelect: false,
    qualities: ['Best Quality (MP4)'],
  },
};

export const ALL_SUPPORTED_DOMAINS = Object.values(PLATFORMS).flatMap((p) => p.domains);

export function detectPlatform(rawUrl: string): PlatformConfig | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const clean = rawUrl.trim().toLowerCase();

  for (const platform of Object.values(PLATFORMS)) {
    for (const domain of platform.domains) {
      if (
        clean.includes(`://${domain}/`) ||
        clean.includes(`://${domain}`) ||
        clean.includes(`.${domain}/`) ||
        clean.startsWith(`http://${domain}`) ||
        clean.startsWith(`https://${domain}`) ||
        clean.startsWith(domain)
      ) {
        return platform;
      }
    }
  }

  return null;
}

/**
 * Cleans tracking params, mix playlist IDs, and clutter from URLs before feeding to yt-dlp.
 */
export function cleanMediaUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();

  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = urlObj.hostname.toLowerCase();

    // YouTube handling: extract single video ID and drop playlist / radio / mix params
    if (host.includes('youtube.com')) {
      const v = urlObj.searchParams.get('v');
      if (v) {
        return `https://www.youtube.com/watch?v=${v}`;
      }
      if (urlObj.pathname.startsWith('/shorts/')) {
        const shortId = urlObj.pathname.split('/shorts/')[1]?.split('/')[0]?.split('?')[0];
        if (shortId) return `https://www.youtube.com/shorts/${shortId}`;
      }
    } else if (host === 'youtu.be') {
      const id = urlObj.pathname.replace(/^\//, '').split('?')[0];
      if (id) return `https://www.youtube.com/watch?v=${id}`;
    }

    // Instagram / TikTok / Twitter / Facebook: strip tracking params
    ['igsh', 'utm_source', 'utm_medium', 'utm_campaign', 'si', 't', 's', '_r'].forEach((p) => {
      urlObj.searchParams.delete(p);
    });

    return urlObj.toString();
  } catch (_) {
    return trimmed;
  }
}
