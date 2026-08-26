import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VideoFormatOption {
  id: string;
  formatNote: string;
  resolution?: string;
  ext: string;
  filesize?: number;
  hasVideo: boolean;
  hasAudio: boolean;
}

export interface VideoMetadata {
  id: string;
  title: string;
  thumbnail: string;
  duration?: number;
  uploader?: string;
  uploaderUrl?: string;
  viewCount?: number;
  description?: string;
  platform: string;
  url: string;
  formats: VideoFormatOption[];
}

/**
 * Fetch video metadata via yt-dlp or remote backend microservice.
 */
export async function fetchVideoInfo(url: string): Promise<VideoMetadata> {
  const backendUrl = process.env.BACKEND_API_URL;

  // Remote microservice option
  if (backendUrl) {
    const res = await fetch(`${backendUrl.replace(/\/$/, '')}/api/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to fetch video info from backend' }));
      throw new Error(err.message || 'Failed to fetch video information');
    }
    return res.json();
  }

  // Local Python yt-dlp execution with Android/iOS/Web client bypass
  const safeUrl = url.replace(/"/g, '\\"');
  const fullCommand = `python -m yt_dlp --extractor-args "youtube:player_client=android,web,ios" --no-check-certificates --dump-single-json --no-playlist --no-warnings "${safeUrl}"`;

  try {
    const { stdout } = await execAsync(fullCommand, {
      timeout: 30000,
      maxBuffer: 20 * 1024 * 1024,
    });

    const data = JSON.parse(stdout.trim());
    return parseYtDlpMetadata(data, url);
  } catch (error: any) {
    const stderr = error?.stderr || error?.message || '';
    console.error('yt-dlp execution error:', stderr);

    if (stderr.includes('Private video') || stderr.includes('login') || stderr.includes('Private')) {
      throw new Error('PRIVATE_VIDEO');
    }
    if (stderr.includes('not available in your country') || stderr.includes('Geo-restricted')) {
      throw new Error('GEO_RESTRICTED');
    }
    if (stderr.includes('Unsupported URL') || stderr.includes('is not a valid URL')) {
      throw new Error('INVALID_URL');
    }
    throw new Error(`YTDLP_ERROR: ${stderr.slice(0, 300)}`);
  }
}

/**
 * Parses raw JSON output from yt-dlp into standardized client structure.
 */
function parseYtDlpMetadata(data: any, originalUrl: string): VideoMetadata {
  const formats: VideoFormatOption[] = [
    {
      id: 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
      formatNote: '1080p Full HD',
      resolution: '1080p',
      ext: 'mp4',
      hasVideo: true,
      hasAudio: true,
    },
    {
      id: 'bestvideo[height<=720]+bestaudio/best[height<=720]/best',
      formatNote: '720p HD',
      resolution: '720p',
      ext: 'mp4',
      hasVideo: true,
      hasAudio: true,
    },
    {
      id: 'bestvideo[height<=480]+bestaudio/best[height<=480]/best',
      formatNote: '480p SD',
      resolution: '480p',
      ext: 'mp4',
      hasVideo: true,
      hasAudio: true,
    },
    {
      id: 'bestvideo[height<=360]+bestaudio/best[height<=360]/best',
      formatNote: '360p Low',
      resolution: '360p',
      ext: 'mp4',
      hasVideo: true,
      hasAudio: true,
    },
    {
      id: 'bestaudio/best',
      formatNote: 'Audio Only (MP3)',
      ext: 'mp3',
      hasVideo: false,
      hasAudio: true,
    },
  ];

  return {
    id: data.id || 'video',
    title: data.title || 'Untitled Video',
    thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails[0]?.url) || '',
    duration: data.duration,
    uploader: data.uploader || data.channel || data.creator || 'Creator',
    uploaderUrl: data.uploader_url,
    viewCount: data.view_count,
    description: data.description,
    platform: data.extractor_key || 'Social Media',
    url: originalUrl,
    formats,
  };
}

/**
 * Spawns a stream process for yt-dlp to pipe video directly to the response.
 */
export function spawnYtDlpStream(url: string, formatId: string = 'best', isAudioOnly: boolean = false) {
  const args = [
    '-m',
    'yt_dlp',
    '--extractor-args',
    'youtube:player_client=android,web,ios',
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
    '--buffer-size',
    '64K',
  ];

  if (isAudioOnly) {
    args.push('-x', '--audio-format', 'mp3', '-o', '-');
  } else if (formatId && formatId !== 'best') {
    args.push('-f', formatId, '-o', '-');
  } else {
    args.push('-f', 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best', '-o', '-');
  }

  args.push(url);

  return spawn('python', args);
}
