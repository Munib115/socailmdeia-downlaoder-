import { VideoMetadata } from './ytdlp';

// Production backend on Render
const RENDER_BACKEND = 'https://socailmdeia-downlaoder.onrender.com';

export interface DownloadError {
  type: 'INVALID_URL' | 'PRIVATE_VIDEO' | 'GEO_RESTRICTED' | 'UNSUPPORTED_PLATFORM' | 'SERVER_ERROR' | 'NETWORK_ERROR';
  message: string;
}

export function mapErrorMessage(rawErr: string | Error | any): DownloadError {
  const text = typeof rawErr === 'string' ? rawErr : rawErr?.message || '';

  if (text.includes('INVALID_URL') || text.includes('valid URL') || text.includes('not a supported')) {
    return { type: 'INVALID_URL', message: "This doesn't look like a supported video link." };
  }
  if (text.includes('PRIVATE_VIDEO') || text.includes('private') || text.includes('login')) {
    return { type: 'PRIVATE_VIDEO', message: 'This video is private. Only public videos can be downloaded.' };
  }
  if (text.includes('GEO_RESTRICTED') || text.includes('region') || text.includes('country')) {
    return { type: 'GEO_RESTRICTED', message: "This video isn't available in your region." };
  }
  if (text.includes('UNSUPPORTED_PLATFORM') || text.includes('not supported')) {
    return { type: 'UNSUPPORTED_PLATFORM', message: "We don't support this platform yet. Try YouTube, Instagram, TikTok, Facebook, or Twitter." };
  }
  return { type: 'SERVER_ERROR', message: 'Something went wrong on our end. Try again in a moment.' };
}

/**
 * Returns true if running on localhost (dev mode)
 */
function isLocalDev(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

export async function fetchVideoInfoClient(url: string): Promise<VideoMetadata> {
  // On localhost → use local /api/info (yt-dlp runs locally)
  // On production → call Render directly from browser
  const endpoint = isLocalDev()
    ? '/api/info'
    : `${RENDER_BACKEND}/api/info`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || data.message || 'Failed to fetch video details');
  }

  return data;
}

export function buildDownloadUrl(
  url: string,
  formatId: string = 'best',
  isAudioOnly: boolean = false,
  title?: string
): string {
  const params = new URLSearchParams({
    url,
    format: formatId,
    audioOnly: isAudioOnly ? 'true' : 'false',
  });

  if (title) {
    params.set('title', title);
  }

  // On localhost → use local /api/download
  // On production → send directly to Render
  if (isLocalDev()) {
    return `/api/download?${params.toString()}`;
  }

  return `${RENDER_BACKEND}/api/download?${params.toString()}`;
}
