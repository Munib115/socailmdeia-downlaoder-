import { NextResponse } from 'next/server';
import { fetchVideoInfo } from '@/lib/ytdlp';
import { detectPlatform, cleanMediaUrl } from '@/lib/platforms';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const cleanedUrl = cleanMediaUrl(url.trim());

    // Check platform
    const platform = detectPlatform(cleanedUrl);
    if (!platform) {
      return NextResponse.json(
        { error: 'UNSUPPORTED_PLATFORM', message: "We don't support this platform yet." },
        { status: 400 }
      );
    }

    // If running in production on Vercel with BACKEND_API_URL defined, delegate to microservice
    const isProduction = process.env.NODE_ENV === 'production';
    const backendUrl = process.env.BACKEND_API_URL;
    if (isProduction && backendUrl) {
      try {
        const cleanBackend = backendUrl.replace(/\/$/, '');
        const res = await fetch(`${cleanBackend}/api/info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: cleanedUrl }),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      } catch (err) {
        console.error('Remote backend proxy error, falling back:', err);
      }
    }

    // Default & Local: use local yt-dlp extraction
    const metadata = await fetchVideoInfo(cleanedUrl);
    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error('Info route error:', error);
    const msg = error?.message || '';

    if (msg === 'PRIVATE_VIDEO' || msg.includes('Private video')) {
      return NextResponse.json(
        { error: 'PRIVATE_VIDEO', message: 'This video is private. Only public videos can be downloaded.' },
        { status: 403 }
      );
    }
    if (msg === 'GEO_RESTRICTED' || msg.includes('Geo-restricted')) {
      return NextResponse.json(
        { error: 'GEO_RESTRICTED', message: "This video isn't available in your region." },
        { status: 403 }
      );
    }
    if (msg === 'INVALID_URL' || msg.includes('unavailable') || msg.includes('not a supported')) {
      return NextResponse.json(
        { error: 'INVALID_URL', message: "This video is unavailable or the link is invalid." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Unable to process this video. Please check the link or try another video.' },
      { status: 500 }
    );
  }
}
