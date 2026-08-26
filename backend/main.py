import os
import subprocess
import json
import urllib.parse
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="SnapGet yt-dlp Backend Microservice", version="1.0.0")

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

@app.get("/")
def health_check():
    return {"status": "ok", "service": "SnapGet yt-dlp microservice"}

@app.post("/api/info")
def get_video_info(req: VideoInfoRequest):
    url = req.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    cmd = ["yt-dlp", "--dump-single-json", "--no-playlist", "--no-warnings", url]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        if res.returncode != 0:
            err = res.stderr
            if "Private video" in err or "login" in err:
                raise HTTPException(status_code=403, detail="PRIVATE_VIDEO")
            if "Geo-restricted" in err:
                raise HTTPException(status_code=403, detail="GEO_RESTRICTED")
            raise HTTPException(status_code=400, detail="INVALID_URL")

        data = json.loads(res.stdout)
        
        # Format formats
        formats = [
            {"id": "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best", "formatNote": "1080p Full HD", "ext": "mp4", "hasVideo": True, "hasAudio": True},
            {"id": "bestvideo[height<=720]+bestaudio/best[height<=720]/best", "formatNote": "720p HD", "ext": "mp4", "hasVideo": True, "hasAudio": True},
            {"id": "bestvideo[height<=480]+bestaudio/best[height<=480]/best", "formatNote": "480p SD", "ext": "mp4", "hasVideo": True, "hasAudio": True},
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
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Request timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download")
def download_stream(url: str, format: str = "best", audioOnly: bool = False):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    args = ["yt-dlp", "--no-playlist", "--no-warnings"]
    if audioOnly:
        args.extend(["-x", "--audio-format", "mp3", "-o", "-"])
        media_type = "audio/mpeg"
        ext = "mp3"
    elif format and format != "best":
        args.extend(["-f", format, "-o", "-"])
        media_type = "video/mp4"
        ext = "mp4"
    else:
        args.extend(["-f", "bestvideo+bestaudio/best", "-o", "-"])
        media_type = "video/mp4"
        ext = "mp4"

    args.append(url)

    proc = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    def iter_stream():
        while True:
            chunk = proc.stdout.read(64 * 1024)
            if not chunk:
                break
            yield chunk

    filename = f"media.{ext}"
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
