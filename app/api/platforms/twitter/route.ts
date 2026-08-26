import { NextResponse } from 'next/server';
import { fetchVideoInfo } from '@/lib/ytdlp';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || (!url.includes('twitter.com') && !url.includes('x.com'))) {
      return NextResponse.json({ error: 'INVALID_URL', message: 'Not a valid Twitter/X URL' }, { status: 400 });
    }
    const info = await fetchVideoInfo(url);
    return NextResponse.json(info);
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
