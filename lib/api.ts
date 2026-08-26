import { VideoMetadata } from './ytdlp';

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

// Get the backend base URL — works in browser (NEXT_PUBLIC_) and on server (BACKEND_API_URL)
function getBackendBase(): string {
  // Client side: use the public env var baked in at build time
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
  }
  // Server side: use the secret env var
  return (process.env.BACKEND_API_URL || '').replace(/\/$/, '');
}

export async function fetchVideoInfoClient(url: string): Promise<VideoMetadata> {
  const backend = getBackendBase();
  const endpoint = backend ? `${backend}/api/info` : '/api/info';

  const attemptFetch = async () => {
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
  };

  try {
    return await attemptFetch();
  } catch (err: any) {
    // Render free tier may be waking up — wait 5s and retry once
    await new Promise(r => setTimeout(r, 5000));
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

  const backend = getBackendBase();

  // Send download request directly to Render backend from the browser
  // This bypasses Vercel's serverless timeout for large file downloads
  if (backend) {
    return `${backend}/api/download?${params.toString()}`;
  }

  return `/api/download?${params.toString()}`;
}
