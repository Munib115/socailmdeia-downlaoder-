import { VideoFormatOption, VideoMetadata } from './ytdlp';

export async function fetchFromRapidAPI(url: string): Promise<VideoMetadata> {
  const apiKey = process.env.RAPIDAPI_KEY || '671011f568msh81007126c2726cap10776fjsnb05cc17b5a93';
  const apiHost = process.env.RAPIDAPI_HOST || 'all-in-one-media-downloader-api.p.rapidapi.com';

  const res = await fetch(`https://${apiHost}/download?url=${encodeURIComponent(url)}`, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!json || json.success === false || !json.data) {
    throw new Error(json.message || 'RapidAPI extraction failed');
  }

  const d = json.data;
  const medias = d.medias || [];

  const formats: VideoFormatOption[] = medias.map((m: any) => ({
    id: m.url, // Direct CDN stream URL
    formatNote: m.label || m.quality || `${m.ext?.toUpperCase() || ''} ${m.type || ''}`.trim(),
    resolution: m.quality || (m.height ? `${m.height}p` : undefined),
    ext: m.ext || (m.type === 'audio' ? 'mp3' : 'mp4'),
    hasVideo: m.type !== 'audio',
    hasAudio: m.type === 'audio' || m.audioQuality != null || m.ext === 'mp4',
  }));

  return {
    id: d.id || 'video',
    title: d.title || 'Untitled Video',
    thumbnail: d.thumbnail || '',
    duration: d.duration,
    uploader: d.author || 'Creator',
    uploaderUrl: undefined,
    viewCount: undefined,
    description: undefined,
    platform: d.source || 'Social Media',
    url: url,
    formats:
      formats.length > 0
        ? formats
        : [
            {
              id: d.url || url,
              formatNote: 'Best Quality (HD)',
              ext: 'mp4',
              hasVideo: true,
              hasAudio: true,
            },
          ],
  };
}
