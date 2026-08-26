import { VideoMetadata } from './ytdlp';

// Hardcoded Render backend URL — no env vars needed
const BACKEND_URL = 'https://socailmdeia-downlaoder.onrender.com';

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

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchVideoInfoClient(url: string): Promise<VideoMetadata> {
  const endpoint = `${BACKEND_URL}/api/info`;
  const options: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  };

  const attemptFetch = async () => {
    // 50 second timeout — enough time for Render cold start
    const res = await fetchWithTimeout(endpoint, options, 50000);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Failed to fetch video details');
    }
    return data;
  };

  try {
    return await attemptFetch();
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('SERVER_ERROR');
    }
    // Wait 3s and retry once
    await new Promise(r => setTimeout(r, 3000));
    return await attemptFetch();
  }
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

  return `${BACKEND_URL}/api/download?${params.toString()}`;
}
