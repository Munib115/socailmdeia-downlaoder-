import os
import sys
import subprocess
import json
import urllib.parse
import re
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Automatically enable static ffmpeg if installed
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
except Exception:
    pass

app = FastAPI(title="PakGet yt-dlp Backend Microservice", version="2.1.0")

# Standard realistic browser User-Agent for Instagram, TikTok, Facebook, Twitter
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

# Allow Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoInfoRequest(BaseModel):
    url: str

def sanitize_filename(title: str) -> str:
    cleaned = re.sub(r'[\/\\:*?"<>|]', '', title).strip()
    return cleaned[:80] if cleaned else "media"

def clean_url(raw_url: str) -> str:
    if not raw_url:
        return ""
    try:
        parsed = urllib.parse.urlparse(raw_url.strip())
        qs = urllib.parse.parse_qs(parsed.query)
        
        # YouTube watch URL: keep only 'v' parameter, drop playlist/radio/mix params
        if "youtube.com" in parsed.netloc and "v" in qs:
            clean_query = urllib.parse.urlencode({"v": qs["v"][0]})
            return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", clean_query, ""))
        
        # youtu.be short URL
        if "youtu.be" in parsed.netloc:
            path_id = parsed.path.lstrip("/").split("?")[0]
            if path_id:
                return f"https://www.youtube.com/watch?v={path_id}"
                
        # Strip tracking params from Instagram, TikTok, Facebook, Twitter
        cleaned_qs = {k: v for k, v in qs.items() if k not in ['igsh', 'utm_source', 'utm_medium', 'utm_campaign', 'si', 't', 's', '_r', 'list', 'start_radio']}
        return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", urllib.parse.urlencode(cleaned_qs, doseq=True), ""))
    except Exception:
        return raw_url.strip()

@app.get("/")
def health_check():
    return {"status": "ok", "service": "PakGet yt-dlp microservice"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/info")
def get_video_info(req: VideoInfoRequest):
    raw_url = req.url.strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail="URL is required")

    url = clean_url(raw_url)

    # Use native yt_dlp Python library directly for maximum reliability and speed
    import yt_dlp

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
        'noplaylist': True,
        'extract_flat': False,
        'http_headers': {
            'User-Agent': USER_AGENT
        }
    }

    if "youtube.com" in url or "youtu.be" in url:
        ydl_opts['extractor_args'] = {
            'youtube': {
                'player_client': ['android', 'web', 'mweb']
            }
        }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            data = ydl.extract_info(url, download=False)
            if not data:
                raise HTTPException(status_code=400, detail="Could not extract video metadata")

            formats = [
                {"id": "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best", "formatNote": "1080p Full HD", "ext": "mp4", "hasVideo": True, "hasAudio": True},
                {"id": "bestvideo[height<=720]+bestaudio/best[height<=720]/best", "formatNote": "720p HD", "ext": "mp4", "hasVideo": True, "hasAudio": True},
                {"id": "bestvideo[height<=480]+bestaudio/best[height<=480]/best", "formatNote": "480p SD", "ext": "mp4", "hasVideo": True, "hasAudio": True},
                {"id": "bestvideo[height<=360]+bestaudio/best[height<=360]/best", "formatNote": "360p Low", "ext": "mp4", "hasVideo": True, "hasAudio": True},
                {"id": "bestaudio/best", "formatNote": "Audio Only (MP3)", "ext": "mp3", "hasVideo": False, "hasAudio": True}
            ]

            return {
                "id": data.get("id", "video"),
                "title": data.get("title", "Untitled Video"),
                "thumbnail": data.get("thumbnail") or (data.get("thumbnails", [{}])[0].get("url", "")),
                "duration": data.get("duration"),
                "uploader": data.get("uploader") or data.get("channel", "Creator"),
                "uploaderUrl": data.get("uploader_url"),
                "viewCount": data.get("view_count"),
                "description": data.get("description"),
                "platform": data.get("extractor_key", "Social Media"),
                "url": url,
                "formats": formats
            }
    except yt_dlp.utils.DownloadError as e:
        err = str(e)
        if "Private video" in err or "login" in err:
            raise HTTPException(status_code=403, detail="PRIVATE_VIDEO")
        if "Geo-restricted" in err or "not available in your country" in err:
            raise HTTPException(status_code=403, detail="GEO_RESTRICTED")
        if "unavailable" in err or "Video unavailable" in err:
            raise HTTPException(status_code=400, detail="This video is unavailable or has been deleted.")
        raise HTTPException(status_code=400, detail=f"INVALID_URL: {err[:120]}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download")
def download_stream(url: str, format: str = "best", audioOnly: bool = False, title: str = "video"):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    clean_target_url = clean_url(url)

    args = [
        sys.executable, "-m", "yt_dlp",
        "--user-agent", USER_AGENT,
        "--no-check-certificates",
        "--no-playlist",
        "--no-warnings",
        "--buffer-size", "64K"
    ]

    # Only apply YouTube client bypass for YouTube URLs
    if "youtube.com" in clean_target_url or "youtu.be" in clean_target_url:
        args.extend(["--extractor-args", "youtube:player_client=android,web"])

    if audioOnly:
        args.extend(["-x", "--audio-format", "mp3", "-o", "-"])
        media_type = "audio/mpeg"
        ext = "mp3"
    elif format and format != "best":
        args.extend(["-f", format, "-o", "-"])
        media_type = "video/mp4"
        ext = "mp4"
    else:
        args.extend(["-f", "best[ext=mp4]/bestvideo+bestaudio/best", "-o", "-"])
        media_type = "video/mp4"
        ext = "mp4"

    args.append(clean_target_url)

    proc = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    def iter_stream():
        while True:
            chunk = proc.stdout.read(64 * 1024)
            if not chunk:
                break
            yield chunk

    clean_title = sanitize_filename(title)
    filename = f"{clean_title}.{ext}"
    encoded_filename = urllib.parse.quote(filename)

    return StreamingResponse(
        iter_stream(),
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{encoded_filename}"',
            "Cache-Control": "no-cache"
        }
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

