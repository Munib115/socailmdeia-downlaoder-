import os
import re
import tempfile
import urllib.parse
import streamlit as st

# Automatically enable static ffmpeg if available
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
except Exception:
    pass

import yt_dlp

# Page configuration
st.set_page_config(
    page_title="SnapGet — Social Media Video Downloader",
    page_icon="⚡",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Custom CSS for rich, dark-mode aesthetic
st.markdown("""
<style>
    /* Dark Theme Core */
    .stApp {
        background-color: #0b0f19;
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    /* Header Container */
    .hero-container {
        text-align: center;
        padding: 2.5rem 1rem 1.5rem;
    }
    .hero-badge {
        display: inline-block;
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        padding: 0.35rem 0.85rem;
        border-radius: 9999px;
        border: 1px solid rgba(96, 165, 250, 0.3);
        margin-bottom: 1rem;
        text-transform: uppercase;
    }
    .hero-title {
        font-size: 2.6rem;
        font-weight: 800;
        letter-spacing: -0.025em;
        background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    .hero-subtitle {
        color: #94a3b8;
        font-size: 1.05rem;
        max-width: 500px;
        margin: 0 auto 1.5rem auto;
    }

    /* Platform Pills */
    .platforms-bar {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-bottom: 2rem;
    }
    .platform-pill {
        background: #1e293b;
        color: #cbd5e1;
        font-size: 0.8rem;
        font-weight: 500;
        padding: 0.3rem 0.75rem;
        border-radius: 8px;
        border: 1px solid #334155;
    }

    /* Video Card */
    .video-card {
        background: #111827;
        border: 1px solid #1f2937;
        border-radius: 16px;
        padding: 1.25rem;
        margin: 1.5rem 0;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .video-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #f8fafc;
        margin-top: 0.75rem;
        margin-bottom: 0.5rem;
        line-height: 1.4;
    }
    .meta-row {
        display: flex;
        gap: 1rem;
        color: #94a3b8;
        font-size: 0.85rem;
        flex-wrap: wrap;
    }

    /* Streamlit Input & Button Overrides */
    div[data-baseweb="input"] {
        background-color: #1e293b !important;
        border-color: #334155 !important;
        border-radius: 12px !important;
    }
    div[data-baseweb="input"] input {
        color: #ffffff !important;
        font-size: 1rem !important;
    }
    .stButton>button {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
        color: white !important;
        font-weight: 600 !important;
        border-radius: 12px !important;
        border: none !important;
        padding: 0.65rem 1.5rem !important;
        width: 100% !important;
        transition: all 0.2s ease !important;
        box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.39) !important;
    }
    .stButton>button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 20px 0 rgba(37, 99, 235, 0.55) !important;
    }
    .stDownloadButton>button {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: white !important;
        font-weight: 700 !important;
        border-radius: 12px !important;
        border: none !important;
        padding: 0.75rem 1.5rem !important;
        width: 100% !important;
        box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.39) !important;
    }
    .stDownloadButton>button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.55) !important;
    }
    
    /* Footer */
    .footer-text {
        text-align: center;
        color: #64748b;
        font-size: 0.8rem;
        margin-top: 3rem;
        padding-top: 1.5rem;
        border-top: 1px solid #1e293b;
    }
</style>
""", unsafe_allow_html=True)

# User-Agent for realistic extraction
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

def get_cookies_path():
    if os.path.exists("cookies.txt"):
        return "cookies.txt"
    if os.path.exists("/etc/secrets/cookies.txt"):
        return "/etc/secrets/cookies.txt"
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
    <div class="hero-badge">⚡ Pure yt-dlp Engine</div>
    <div class="hero-title">SnapGet Media</div>
    <div class="hero-subtitle">Fast, high-quality video & audio downloader with zero ads and no registration.</div>
    <div class="platforms-bar">
        <span class="platform-pill">🎬 YouTube</span>
        <span class="platform-pill">📸 Instagram</span>
        <span class="platform-pill">🎵 TikTok</span>
        <span class="platform-pill">📘 Facebook</span>
        <span class="platform-pill">🐦 Twitter/X</span>
    </div>
</div>
""", unsafe_allow_html=True)

# URL Input
url_input = st.text_input(
    label="Video URL",
    placeholder="Paste video link here (e.g. https://www.youtube.com/watch?v=...)",
    label_visibility="collapsed"
)

col1, col2 = st.columns([3, 1])
with col1:
    fetch_btn = st.button("🔍 Fetch Video Details", use_container_width=True)
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
            'youtube': {'player_client': ['android', 'ios', 'web_embedded', 'web']}
        }

    with st.spinner("Inspecting video metadata with yt-dlp..."):
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(target_url, download=False)
                st.session_state.video_info = info
        except Exception as e:
            st.session_state.video_info = None
            err_msg = str(e)
            if "Private video" in err_msg:
                st.error("🔒 This video is private. Only public media can be downloaded.")
            elif "not available in your country" in err_msg or "Geo-restricted" in err_msg:
                st.error("🌍 This video is geo-restricted.")
            else:
                st.error(f"⚠️ Could not fetch video: {err_msg[:160]}")

# Display Video Preview and Download Section
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
    st.subheader("Select Quality & Format")
    format_choice = st.selectbox(
        "Format option:",
        [
            "1080p Full HD (MP4)",
            "720p HD (MP4)",
            "480p SD (MP4)",
            "360p Low (MP4)",
            "Audio Only (MP3)"
        ],
        index=1
    )

    is_audio = "Audio Only" in format_choice
    format_id_map = {
        "1080p Full HD (MP4)": "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best",
        "720p HD (MP4)": "bestvideo[height<=720]+bestaudio/best[height<=720]/best",
        "480p SD (MP4)": "bestvideo[height<=480]+bestaudio/best[height<=480]/best",
        "360p Low (MP4)": "bestvideo[height<=360]+bestaudio/best[height<=360]/best",
        "Audio Only (MP3)": "bestaudio/best"
    }
    selected_format = format_id_map[format_choice]

    clean_file_title = sanitize_filename(title)
    file_ext = "mp3" if is_audio else "mp4"
    output_filename = f"{clean_file_title}.{file_ext}"

    if st.button(f"⚡ Prepare Download ({format_choice.split(' ')[0]})"):
        with st.spinner("Processing with yt-dlp... please wait a few moments"):
            with tempfile.TemporaryDirectory() as temp_dir:
                out_template = os.path.join(temp_dir, f"media.%(ext)s")
                
                dl_opts = {
                    'quiet': True,
                    'no_warnings': True,
                    'nocheckcertificate': True,
                    'outtmpl': out_template,
                    'http_headers': {'User-Agent': USER_AGENT}
                }
                
                cookies = get_cookies_path()
                if cookies:
                    dl_opts['cookiefile'] = cookies

                if is_audio:
                    dl_opts['format'] = 'bestaudio/best'
                    dl_opts['postprocessors'] = [{
                        'key': 'FFmpegExtractAudio',
                        'preferredcodec': 'mp3',
                        'preferredquality': '192',
                    }]
                else:
                    dl_opts['format'] = selected_format
                    dl_opts['merge_output_format'] = 'mp4'

                try:
                    with yt_dlp.YoutubeDL(dl_opts) as ydl:
                        ydl.download([st.session_state.target_url])
                    
                    # Find created file in temp_dir
                    downloaded_files = [f for f in os.listdir(temp_dir) if not f.endswith('.part')]
                    if downloaded_files:
                        final_file_path = os.path.join(temp_dir, downloaded_files[0])
                        with open(final_file_path, "rb") as f:
                            media_bytes = f.read()
                        
                        st.success("✅ Ready! Click below to save your file:")
                        st.download_button(
                            label=f"💾 Save {output_filename}",
                            data=media_bytes,
                            file_name=output_filename,
                            mime="audio/mpeg" if is_audio else "video/mp4",
                            use_container_width=True
                        )
                    else:
                        st.error("No file was produced by yt-dlp.")
                except Exception as dl_err:
                    st.error(f"Download error: {str(dl_err)}")

# Footer
st.markdown("""
<div class="footer-text">
    SnapGet Streamlit Edition • Powered by <b>yt-dlp</b> and <b>FFmpeg</b> • Free & Open Source
</div>
""", unsafe_allow_html=True)
