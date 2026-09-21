import os
import re
import shutil
import tempfile
import urllib.parse
import streamlit as st

# Automatically ensure ffmpeg is available
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
except Exception:
    pass

# Verify ffmpeg presence
FFMPEG_AVAILABLE = shutil.which("ffmpeg") is not None

import yt_dlp

# Page configuration
st.set_page_config(
    page_title="PakGet — Free Video Downloader",
    page_icon="⚡",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Custom CSS matching the Next.js dark liquid glass aesthetic
st.markdown("""
<style>
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@700,800,900&display=swap');

    .stApp {
        background-color: #0b0f19;
        color: #f1f5f9;
        font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    /* Header Section */
    .hero-container {
        text-align: center;
        padding: 2rem 0.5rem 1rem;
    }
    .hero-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(37, 99, 235, 0.12);
        color: #93c5fd;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.4rem 1rem;
        border-radius: 9999px;
        border: 1px solid rgba(59, 130, 246, 0.3);
        margin-bottom: 1.25rem;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
    }
    .pill-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #3b82f6;
        display: inline-block;
        box-shadow: 0 0 10px #3b82f6;
    }
    .hero-title {
        font-size: 2.5rem;
        font-weight: 900;
        letter-spacing: -0.03em;
        line-height: 1.15;
        color: #ffffff;
        margin-bottom: 0.75rem;
    }
    .hero-title-highlight {
        display: inline-block;
        background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #818cf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 900;
        text-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
    }
    .hero-subtitle {
        color: #94a3b8;
        font-size: 0.95rem;
        max-width: 520px;
        margin: 0 auto 1.5rem;
        line-height: 1.5;
    }

    /* Platform Pills */
    .platforms-bar {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 1.75rem;
    }
    .platform-pill {
        background: #151d2f;
        color: #e2e8f0;
        font-size: 0.78rem;
        font-weight: 600;
        padding: 0.35rem 0.8rem;
        border-radius: 10px;
        border: 1px solid #1e293b;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
    }

    /* Video Card */
    .video-card {
        background: #111827;
        border: 1px solid #1f2937;
        border-radius: 16px;
        padding: 1.25rem;
        margin: 1.5rem 0;
        box-shadow: 0 12px 30px -8px rgba(0, 0, 0, 0.6);
    }
    .video-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: #f8fafc;
        margin-top: 0.75rem;
        margin-bottom: 0.5rem;
        line-height: 1.35;
    }
    .meta-row {
        display: flex;
        gap: 0.85rem;
        color: #94a3b8;
        font-size: 0.85rem;
        flex-wrap: wrap;
    }

    /* Streamlit Input & Button Styling */
    div[data-baseweb="input"] {
        background-color: #131b2e !important;
        border: 1px solid #24324f !important;
        border-radius: 14px !important;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.2) !important;
    }
    div[data-baseweb="input"] input {
        color: #ffffff !important;
        font-size: 1rem !important;
        padding: 0.65rem 0.85rem !important;
    }
    .stButton>button {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
        color: white !important;
        font-weight: 700 !important;
        font-size: 0.95rem !important;
        border-radius: 14px !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        padding: 0.7rem 1.5rem !important;
        width: 100% !important;
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4) !important;
        transition: all 0.2s ease !important;
    }
    .stButton>button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 8px 25px rgba(37, 99, 235, 0.6) !important;
    }
    .stDownloadButton>button {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: white !important;
        font-weight: 800 !important;
        font-size: 1rem !important;
        border-radius: 14px !important;
        border: none !important;
        padding: 0.8rem 1.5rem !important;
        width: 100% !important;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
    }
    
    /* FAQ Accordion Box */
    .faq-card {
        background: #0f172a;
        border: 1px solid #1e293b;
        border-radius: 12px;
        padding: 1rem;
        margin-top: 1rem;
        color: #94a3b8;
        font-size: 0.88rem;
        line-height: 1.5;
    }
</style>
""", unsafe_allow_html=True)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

def get_cookies_path():
    if os.path.exists("cookies.txt"):
        return "cookies.txt"
    if os.path.exists("/etc/secrets/cookies.txt"):
        return "/etc/secrets/cookies.txt"
    raw = ""
    try:
        if "YOUTUBE_COOKIES" in st.secrets:
            raw = st.secrets["YOUTUBE_COOKIES"]
    except Exception:
        pass
    if not raw:
        raw = os.environ.get("YOUTUBE_COOKIES", "").strip()
    if raw:
        path = os.path.join(tempfile.gettempdir(), "cookies.txt")
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(raw)
            return path
        except Exception:
            pass
    return None

def clean_url(raw_url: str) -> str:
    if not raw_url:
        return ""
    try:
        parsed = urllib.parse.urlparse(raw_url.strip())
        qs = urllib.parse.parse_qs(parsed.query)
        if "youtube.com" in parsed.netloc and "v" in qs:
            clean_query = urllib.parse.urlencode({"v": qs["v"][0]})
            return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", clean_query, ""))
        if "youtu.be" in parsed.netloc:
            path_id = parsed.path.lstrip("/").split("?")[0]
            if path_id:
                return f"https://www.youtube.com/watch?v={path_id}"
        cleaned_qs = {k: v for k, v in qs.items() if k not in ['igsh', 'utm_source', 'utm_medium', 'utm_campaign', 'si', 't', 's', '_r']}
        return urllib.parse.urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", urllib.parse.urlencode(cleaned_qs, doseq=True), ""))
    except Exception:
        return raw_url.strip()

def detect_platform(url: str) -> str:
    lower = url.lower()
    if "youtube.com" in lower or "youtu.be" in lower:
        return "YouTube"
    if "instagram.com" in lower:
        return "Instagram"
    if "tiktok.com" in lower:
        return "TikTok"
    if "facebook.com" in lower or "fb.watch" in lower:
        return "Facebook"
    if "twitter.com" in lower or "x.com" in lower:
        return "Twitter/X"
    return "Universal Video"

def format_duration(seconds):
    if not seconds:
        return ""
    mins = int(seconds) // 60
    secs = int(seconds) % 60
    if mins >= 60:
        hrs = mins // 60
        mins = mins % 60
        return f"{hrs}:{mins:02d}:{secs:02d}"
    return f"{mins}:{secs:02d}"

def sanitize_filename(title: str) -> str:
    cleaned = re.sub(r'[\/\\:*?"<>|]', '', title).strip()
    return cleaned[:80] if cleaned else "video"

# Header UI
st.markdown("""
<div class="hero-container">
    <div class="hero-pill">
        <span class="pill-dot"></span>
        <span>PakGet Engine</span>
        <span>•</span>
        <span style="color:#60a5fa;">100% Stateless & Free</span>
    </div>
    <div class="hero-title">
        Free video downloader in Pakistan.<br>
        <span class="hero-title-highlight">Paste a link. Done.</span>
    </div>
    <div class="hero-subtitle">
        Download supported public videos from YouTube, Instagram Reels, TikTok, Facebook, and X. Fast, free, and no account required.
    </div>
    <div class="platforms-bar">
        <span class="platform-pill">🎬 YouTube</span>
        <span class="platform-pill">📸 Instagram</span>
        <span class="platform-pill">🎵 TikTok</span>
        <span class="platform-pill">📘 Facebook</span>
        <span class="platform-pill">🐦 Twitter / X</span>
    </div>
</div>
""", unsafe_allow_html=True)

# URL Input
url_input = st.text_input(
    label="Video URL",
    placeholder="Paste video link here (e.g., https://www.youtube.com/watch?v=...)",
    label_visibility="collapsed"
)

col1, col2 = st.columns([3, 1])
with col1:
    fetch_btn = st.button("⚡ Fetch Video Details", use_container_width=True)
with col2:
    if st.button("🧹 Clear", use_container_width=True):
        st.session_state.clear()
        st.rerun()

if "video_info" not in st.session_state:
    st.session_state.video_info = None

if fetch_btn and url_input.strip():
    target_url = clean_url(url_input.strip())
    st.session_state.target_url = target_url
    
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
        'noplaylist': True,
        'extract_flat': False,
        'http_headers': {'User-Agent': USER_AGENT}
    }
    
    cookies = get_cookies_path()
    if cookies:
        ydl_opts['cookiefile'] = cookies

    if "youtube.com" in target_url or "youtu.be" in target_url:
        ydl_opts['extractor_args'] = {
            'youtube': {
                'player_client': ['web_safari', 'visionos', 'mweb'],
            }
        }

    with st.spinner("Analyzing media stream with yt-dlp..."):
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(target_url, download=False)
                st.session_state.video_info = info
        except Exception as e:
            err_msg = str(e)
            # Automatic fallback to visionos/tv if bot challenge encountered
            if "bot" in err_msg.lower() or "sign in" in err_msg.lower():
                try:
                    ydl_opts['extractor_args'] = {
                        'youtube': {'player_client': ['visionos', 'tv']}
                    }
                    with yt_dlp.YoutubeDL(ydl_opts) as retry_ydl:
                        info = retry_ydl.extract_info(target_url, download=False)
                        st.session_state.video_info = info
                        err_msg = ""
                except Exception as retry_err:
                    err_msg = str(retry_err)

            if err_msg:
                st.session_state.video_info = None
                if "Private video" in err_msg or "login" in err_msg:
                    st.error("🔒 This video is private. Only public media can be downloaded.")
                elif "not available in your country" in err_msg or "Geo-restricted" in err_msg:
                    st.error("🌍 This video is geo-restricted.")
                elif "bot" in err_msg.lower() or "sign in" in err_msg.lower():
                    st.error("🤖 YouTube Cloud Bot Detection: YouTube detected a cloud datacenter IP. Please see the 'Cookie Authentication' guide below to bypass this.")
                else:
                    st.error(f"⚠️ Could not fetch video: {err_msg[:160]}")

# Display Video Preview and Download
info = st.session_state.video_info
if info:
    platform_name = detect_platform(st.session_state.target_url)
    title = info.get("title", "Untitled Video")
    thumbnail = info.get("thumbnail") or (info.get("thumbnails", [{}])[-1].get("url", ""))
    uploader = info.get("uploader") or info.get("channel", "Creator")
    duration_str = format_duration(info.get("duration"))
    view_count = f"{info.get('view_count', 0):,}" if info.get('view_count') else None

    # Card layout
    st.markdown('<div class="video-card">', unsafe_allow_html=True)
    if thumbnail:
        st.image(thumbnail, use_container_width=True)
    
    st.markdown(f'<div class="video-title">{title}</div>', unsafe_allow_html=True)
    meta_html = f"<b>Platform:</b> {platform_name} &nbsp;•&nbsp; <b>Creator:</b> {uploader}"
    if duration_str:
        meta_html += f" &nbsp;•&nbsp; <b>Duration:</b> {duration_str}"
    if view_count:
        meta_html += f" &nbsp;•&nbsp; <b>Views:</b> {view_count}"
    st.markdown(f'<div class="meta-row">{meta_html}</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    # Format Quality Selection
    st.subheader("Choose Download Quality")
    format_choice = st.selectbox(
        "Available formats:",
        [
            "Best Quality (Auto MP4)",
            "720p HD (MP4)",
            "480p SD (MP4)",
            "360p Low (MP4)",
            "Audio Only (MP3)"
        ],
        index=0
    )

    is_audio = "Audio Only" in format_choice
    clean_file_title = sanitize_filename(title)
    file_ext = "mp3" if is_audio else "mp4"
    output_filename = f"{clean_file_title}.{file_ext}"

    if st.button(f"⬇️ Generate Download Link"):
        with st.spinner("Processing media with yt-dlp... please wait a moment"):
            try:
                with tempfile.TemporaryDirectory() as temp_dir:
                    out_template = os.path.join(temp_dir, f"media.%(ext)s")
                    
                    has_ffmpeg = shutil.which("ffmpeg") is not None
                    
                    dl_opts = {
                        'quiet': True,
                        'no_warnings': True,
                        'nocheckcertificate': True,
                        'outtmpl': out_template,
                        'geo_bypass': True,
                        'http_headers': {
                            'User-Agent': USER_AGENT,
                            'Accept': '*/*',
                            'Accept-Language': 'en-US,en;q=0.9',
                        }
                    }
                    
                    if "youtube.com" in st.session_state.target_url or "youtu.be" in st.session_state.target_url:
                        dl_opts['extractor_args'] = {
                            'youtube': {
                                'player_client': ['web_safari', 'visionos', 'mweb'],
                            }
                        }

                    cookies = get_cookies_path()
                    if cookies:
                        dl_opts['cookiefile'] = cookies

                    if is_audio:
                        if has_ffmpeg:
                            dl_opts['format'] = 'bestaudio/best'
                            dl_opts['postprocessors'] = [{
                                'key': 'FFmpegExtractAudio',
                                'preferredcodec': 'mp3',
                                'preferredquality': '192',
                            }]
                        else:
                            dl_opts['format'] = 'bestaudio/best'
                            output_filename = f"{clean_file_title}.m4a"
                            file_ext = "m4a"
                    else:
                        if has_ffmpeg:
                            if "Best Quality" in format_choice:
                                dl_opts['format'] = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best[ext=mp4]/best'
                            elif "720p" in format_choice:
                                dl_opts['format'] = 'bestvideo[height<=720]+bestaudio/best[height<=720]/best'
                            elif "480p" in format_choice:
                                dl_opts['format'] = 'bestvideo[height<=480]+bestaudio/best[height<=480]/best'
                            else:
                                dl_opts['format'] = 'bestvideo[height<=360]+bestaudio/best[height<=360]/best'
                            dl_opts['merge_output_format'] = 'mp4'
                        else:
                            # Fallback when ffmpeg is missing: single stream pre-muxed mp4
                            dl_opts['format'] = 'best[ext=mp4]/best'

                    try:
                        with yt_dlp.YoutubeDL(dl_opts) as ydl:
                            ydl.download([st.session_state.target_url])
                    except Exception as dl_err:
                        err_str = str(dl_err)
                        if "403" in err_str or "forbidden" in err_str.lower() or "bot" in err_str.lower() or "sign in" in err_str.lower():
                            st.warning("🔄 Bypassing stream protection with visionos... retrying...")
                            dl_opts['extractor_args'] = {
                                'youtube': {'player_client': ['visionos', 'tv']}
                            }
                            dl_opts['format'] = 'best[ext=mp4]/best'
                            with yt_dlp.YoutubeDL(dl_opts) as fallback_ydl:
                                fallback_ydl.download([st.session_state.target_url])
                        else:
                            raise dl_err
                        
                    downloaded_files = [f for f in os.listdir(temp_dir) if not f.endswith('.part')]
                    if downloaded_files:
                        final_file_path = os.path.join(temp_dir, downloaded_files[0])
                        with open(final_file_path, "rb") as f:
                            media_bytes = f.read()
                        
                        st.success("✅ Video ready! Click below to download:")
                        st.download_button(
                            label=f"💾 Save {output_filename}",
                            data=media_bytes,
                            file_name=output_filename,
                            mime="audio/mpeg" if is_audio else "video/mp4",
                            use_container_width=True
                        )
                    else:
                        st.error("No output file was created.")
            except Exception as dl_err:
                st.error(f"Download error: {str(dl_err)}")

# FAQ
with st.expander("❓ Frequently Asked Questions"):
    st.markdown("""
    **Is this downloader free?**  
    Yes, 100% free with no limits, no registration, and no ads.
    
    **Why does it say ffmpeg is needed?**  
    YouTube stores 1080p and 720p video and audio tracks separately. FFmpeg automatically merges them into a single MP4 file.
    
    **Can I download private videos?**  
    No. Only public media can be downloaded according to platform policies.
    """)

# Cookie authentication for permanent cloud bot bypass
with st.expander("🍪 YouTube Cookie Authentication (Permanent Cloud Bot Bypass)"):
    st.markdown("""
    YouTube occasionally challenges cloud hosting IP addresses (AWS, Streamlit Cloud). To guarantee 100% uninterrupted downloads:
    1. Install the free Chrome extension **Get cookies.txt locally**.
    2. Visit [youtube.com](https://youtube.com) and click **Export**.
    3. In your Streamlit Cloud dashboard &rarr; App **Settings** &rarr; **Secrets**, paste:
    ```toml
    YOUTUBE_COOKIES = \"\"\"
    # Netscape HTTP Cookie File
    # Paste your exported cookies here
    \"\"\"
    ```
    4. Save! Your app will authenticate with YouTube directly as a real browser user.
    """)

# Footer
st.markdown("""
<div style="text-align: center; color: #64748b; font-size: 0.8rem; margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #1e293b;">
    PakGet Streamlit Edition • Powered by <b>yt-dlp</b> & <b>FFmpeg</b> • 100% Free & Open Source
</div>
""", unsafe_allow_html=True)
