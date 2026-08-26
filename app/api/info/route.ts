import { NextResponse } from 'next/server';
import { fetchVideoInfo } from '@/lib/ytdlp';
import { detectPlatform } from '@/lib/platforms';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const trimmedUrl = url.trim();

    // Check platform
    const platform = detectPlatform(trimmedUrl);
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
          body: JSON.stringify({ url: trimmedUrl }),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      } catch (err) {
        console.error('Remote backend proxy error, falling back:', err);
      }
    }

    // Default & Local: use local yt-dlp extraction
    const metadata = await fetchVideoInfo(trimmedUrl);
    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error('Info route error:', error);
    const msg = error?.message || '';

    if (msg === 'PRIVATE_VIDEO') {
      return NextResponse.json(
        { error: 'PRIVATE_VIDEO', message: 'This video is private. Only public videos can be downloaded.' },
        { status: 403 }
      );
    }
    if (msg === 'GEO_RESTRICTED') {
      return NextResponse.json(
        { error: 'GEO_RESTRICTED', message: "This video isn't available in your region." },
        { status: 403 }
      );
    }
    if (msg === 'INVALID_URL') {
      return NextResponse.json(
        { error: 'INVALID_URL', message: "This doesn't look like a supported video link." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Something went wrong on our end. Try again in a moment.' },
      { status: 500 }
    );
  }
}
