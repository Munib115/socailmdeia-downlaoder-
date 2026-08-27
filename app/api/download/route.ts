import { NextRequest, NextResponse } from 'next/server';
import { spawnYtDlpStream, fetchVideoInfo } from '@/lib/ytdlp';
import { sanitizeFilename } from '@/lib/utils';
import { detectPlatform } from '@/lib/platforms';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;


async function handleDownload(
  url: string,
  formatId: string = 'best',
  isAudioOnly: boolean = false,
  providedTitle?: string
) {
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Direct CDN Stream from RapidAPI
  if (formatId && (formatId.startsWith('http://') || formatId.startsWith('https://'))) {
    return NextResponse.redirect(formatId);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (isProduction && backendUrl) {
    const cleanBackend = backendUrl.replace(/\/$/, '');
    const params = new URLSearchParams({
      url,
      format: formatId,
      audioOnly: isAudioOnly ? 'true' : 'false',
    });
    if (providedTitle) params.set('title', providedTitle);
    return NextResponse.redirect(`${cleanBackend}/api/download?${params.toString()}`);
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return NextResponse.json(
      { error: 'UNSUPPORTED_PLATFORM', message: "We don't support this platform yet." },
      { status: 400 }
    );
  }

  let title = 'video';
  if (providedTitle && providedTitle.trim()) {
    title = sanitizeFilename(providedTitle.trim());
  } else {
    try {
      const meta = await fetchVideoInfo(url);
      if (meta?.title) {
        title = sanitizeFilename(meta.title);
      }
    } catch (_) {
      // Fallback
    }
  }

  const fileExt = isAudioOnly ? 'mp3' : 'mp4';
  const filename = `${title}.${fileExt}`;
  const contentType = isAudioOnly ? 'audio/mpeg' : 'video/mp4';

  const child = spawnYtDlpStream(url, formatId, isAudioOnly);

  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      child.stdout.on('data', (chunk) => {
        if (!isClosed) {
          try {
            controller.enqueue(new Uint8Array(chunk));
          } catch (e) {
            isClosed = true;
          }
        }
      });

      child.stdout.on('end', () => {
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch (e) {}
        }
      });

      child.on('error', (err) => {
        console.error('Download stream process error:', err);
        if (!isClosed) {
          isClosed = true;
          try {
            controller.error(err);
          } catch (e) {}
        }
      });

      child.stderr.on('data', (data) => {
        const msg = data.toString();
        if (msg.includes('ERROR:')) {
          console.error('yt-dlp stderr:', msg);
        }
      });
    },
    cancel() {
      isClosed = true;
      child.kill();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url') || '';
  const format = searchParams.get('format') || 'best';
  const audioOnly = searchParams.get('audioOnly') === 'true';
  const title = searchParams.get('title') || '';

  return handleDownload(url, format, audioOnly, title);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { url, format = 'best', audioOnly = false, title = '' } = body;

  return handleDownload(url, format, audioOnly, title);
}
