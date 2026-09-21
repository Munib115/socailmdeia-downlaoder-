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
    page_title="PakGet — Free Video Downloader in Pakistan",
    page_icon="📥",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Custom CSS matching the Next.js official website liquid glass design system
st.markdown("""
<style>
    @import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,900&display=swap');

    :root {
        --bg-primary: #0A0A0A;
        --accent: #2563EB;
        --accent-hover: #1D4ED8;
        --text-primary: #F5F5F5;
        --text-secondary: #A3A3A3;
        --text-muted: #666666;
        --font-display: 'Satoshi', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    /* Hide Streamlit default branding & header chrome */
    #MainMenu {display: none !important;}
    footer {display: none !important;}
    header {display: none !important;}
    .stDeployButton {display: none !important;}
    div[data-testid="stDecoration"] {display: none !important;}
    div[data-testid="stToolbar"] {display: none !important;}
    div[data-testid="stStatusWidget"] {display: none !important;}

    /* App Base */
    html, body, .stApp {
        background-color: #0A0A0A !important;
        background: #0A0A0A !important;
        color: #F5F5F5 !important;
        font-family: var(--font-display) !important;
        -webkit-tap-highlight-color: transparent;
        overflow-x: hidden !important;
    }

    /* Responsive App Container */
    .block-container {
        padding-top: 1.25rem !important;
        padding-bottom: 5.5rem !important;
        padding-left: 0.85rem !important;
        padding-right: 0.85rem !important;
        max-width: 680px !important;
        margin: 0 auto !important;
    }

    @media (min-width: 768px) {
        .block-container {
            padding-top: 2rem !important;
            padding-bottom: 5rem !important;
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
            max-width: 720px !important;
        }
    }

    /* Global Typography */
    h1, h2, h3, h4, p, span, div, input, button, select {
        font-family: var(--font-display) !important;
    }

    /* Top App Bar / Navbar */
    .official-navbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.65rem 1rem;
        background: rgba(18, 18, 24, 0.8);
        backdrop-filter: blur(16px) saturate(170%);
        -webkit-backdrop-filter: blur(16px) saturate(170%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        margin-bottom: 1.75rem;
        box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.6);
    }
    .brand-wrap {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        text-decoration: none;
    }
    .brand-icon-box {
        width: 36px;
        height: 36px;
        border-radius: 11px;
        background: rgba(28, 28, 34, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-top: 1px solid rgba(255, 255, 255, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
    }
    .brand-icon-box::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(to bottom, rgba(255,255,255,0.25), transparent);
        pointer-events: none;
    }
    .brand-text-pak {
        font-size: 1.25rem;
        font-weight: 900;
        color: #FFFFFF;
        letter-spacing: -0.02em;
    }
    .brand-badge-get {
        background: rgba(37, 99, 235, 0.2);
        border: 1px solid rgba(37, 99, 235, 0.5);
        color: #60a5fa;
        font-size: 0.88rem;
        font-weight: 900;
        padding: 0.15rem 0.55rem;
        border-radius: 7px;
        margin-left: 0.25rem;
        box-shadow: 0 0 12px rgba(37, 99, 235, 0.3);
    }
    .nav-badge-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #a3a3a3;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 0.3rem 0.75rem;
        border-radius: 9999px;
    }

    /* Hero Section */
    .hero-wrap {
        text-align: center;
        padding: 0 0.25rem 1.25rem;
    }
    .hero-pill-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        background: rgba(24, 24, 30, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        color: #a3a3a3;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.35rem 0.95rem;
        border-radius: 9999px;
        margin-bottom: 1rem;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
    }
    .pulse-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: #22C55E;
        display: inline-block;
        box-shadow: 0 0 8px #22C55E;
    }
    .hero-h1 {
        font-size: clamp(1.75rem, 6vw, 2.75rem);
        font-weight: 900;
        letter-spacing: -0.04em;
        line-height: 1.18;
        color: #ffffff;
        margin: 0 0 0.65rem 0;
    }
    .hero-elevated-badge {
        display: inline-block;
        background: rgba(28, 28, 36, 0.85);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(37, 99, 235, 0.45);
        border-top: 1px solid rgba(255, 255, 255, 0.28);
        border-radius: 14px;
        padding: 0.25rem 1rem;
        margin-top: 0.35rem;
        position: relative;
        overflow: hidden;
        box-shadow: 0 12px 35px -6px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
    }
    .hero-elevated-badge::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 50%;
        background: linear-gradient(to bottom, rgba(255,255,255,0.22), transparent);
        pointer-events: none;
    }
    .hero-gradient-text {
        background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #93c5fd 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 900;
        text-shadow: 0 0 25px rgba(37, 99, 235, 0.5);
    }
    .hero-p {
        color: #A3A3A3;
        font-size: clamp(0.82rem, 3vw, 0.95rem);
        max-width: 480px;
        margin: 0.65rem auto 1.25rem;
        line-height: 1.5;
    }

    /* Platform Bar (Horizontal Carousel for Mobile App Feel) */
    .platforms-wrap {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 0.45rem;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding: 0.25rem 0.25rem 0.75rem;
        margin-bottom: 1.25rem;
        scrollbar-width: none;
    }
    .platforms-wrap::-webkit-scrollbar {
        display: none;
    }
    @media (min-width: 640px) {
        .platforms-wrap {
            justify-content: center;
            flex-wrap: wrap;
        }
    }
    .platform-item {
        background: rgba(22, 22, 28, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        color: #e5e5e5;
        font-size: 0.78rem;
        font-weight: 600;
        padding: 0.38rem 0.8rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-top: 1px solid rgba(255, 255, 255, 0.18);
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        white-space: nowrap;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
    }

    /* Universal Liquid Glass Inputs - 100% Theme Immune (No White Boxes) */
    div[data-testid="stTextInput"],
    div[data-testid="stTextInput"] > div,
    div[data-testid="stTextInput"] > div > div,
    div[data-baseweb="input"],
    div[data-baseweb="base-input"],
    .stTextInput input,
    div[data-testid="stTextInput"] input,
    input[type="text"],
    input[type="url"],
    input {
        background-color: rgba(18, 18, 24, 0.95) !important;
        background: rgba(18, 18, 24, 0.95) !important;
        color: #FFFFFF !important;
        -webkit-text-fill-color: #FFFFFF !important;
    }

    div[data-baseweb="input"] {
        background: rgba(18, 18, 24, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.28) !important;
        border-radius: 16px !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
        transition: all 0.2s ease !important;
        min-height: 52px !important;
    }

    div[data-baseweb="input"]:focus-within {
        border-color: #3B82F6 !important;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), 0 8px 30px rgba(37, 99, 235, 0.35) !important;
    }

    div[data-baseweb="base-input"] {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        min-height: 52px !important;
    }

    div[data-testid="stTextInput"] input {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        color: #FFFFFF !important;
        -webkit-text-fill-color: #FFFFFF !important;
        font-size: 0.92rem !important;
        padding: 0.85rem 1.1rem !important;
    }

    div[data-testid="stTextInput"] input::placeholder {
        color: #71717A !important;
        -webkit-text-fill-color: #71717A !important;
        font-size: 0.85rem !important;
    }

    /* Buttons (Native App Feel: Large, Tactile, Specular Sheen) */
    .stButton>button {
        background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%) !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        font-size: 0.95rem !important;
        border-radius: 14px !important;
        border: 1px solid rgba(255, 255, 255, 0.18) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.35) !important;
        min-height: 50px !important;
        padding: 0.75rem 1.5rem !important;
        width: 100% !important;
        box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4) !important;
        transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        cursor: pointer !important;
    }
    .stButton>button:active {
        transform: scale(0.98) !important;
    }
    .stButton>button:hover {
        box-shadow: 0 10px 30px rgba(37, 99, 235, 0.6) !important;
    }

    .stDownloadButton>button {
        background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
        color: #ffffff !important;
        font-weight: 800 !important;
        font-size: 1rem !important;
        border-radius: 14px !important;
        border: 1px solid rgba(255, 255, 255, 0.22) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.38) !important;
        min-height: 52px !important;
        padding: 0.85rem 1.5rem !important;
        width: 100% !important;
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.45) !important;
    }
    .stDownloadButton>button:active {
        transform: scale(0.98) !important;
    }

    /* Selectbox (Dropdown) Styling */
    div[data-baseweb="select"] > div {
        background-color: rgba(18, 18, 24, 0.95) !important;
        color: #F5F5F5 !important;
        border-radius: 14px !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        border-top: 1px solid rgba(255, 255, 255, 0.25) !important;
        min-height: 48px !important;
    }
    div[data-baseweb="select"] span {
        color: #FFFFFF !important;
    }
    div[data-baseweb="popover"], ul[role="listbox"] {
        background-color: #141418 !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        border-radius: 14px !important;
    }
    li[role="option"] {
        color: #E5E5E5 !important;
    }
    li[role="option"]:hover, li[aria-selected="true"] {
        background-color: rgba(37, 99, 235, 0.3) !important;
        color: #FFFFFF !important;
    }

    /* Video Preview Card */
    .official-video-card {
        background: rgba(20, 20, 26, 0.8);
        backdrop-filter: blur(16px) saturate(170%);
        -webkit-backdrop-filter: blur(16px) saturate(170%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-top: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 18px;
        padding: 1.1rem;
        margin: 1.25rem 0;
        box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
    }
    .card-title {
        font-size: 1.05rem;
        font-weight: 700;
        color: #F5F5F5;
        margin-top: 0.65rem;
        margin-bottom: 0.4rem;
        line-height: 1.35;
    }
    .card-meta {
        display: flex;
        gap: 0.6rem;
        color: #A3A3A3;
        font-size: 0.8rem;
        flex-wrap: wrap;
    }

    /* Feature Grid (How It Works & Supported Platforms) */
    .grid-wrap {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.85rem;
        margin-top: 1rem;
    }
    @media (min-width: 640px) {
        .grid-wrap {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
    }
    .grid-platforms {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
        margin-top: 1rem;
    }
    @media (min-width: 640px) {
        .grid-platforms {
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 0.85rem;
        }
    }

    .feature-card {
        background: rgba(20, 20, 26, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-top: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 16px;
        padding: 1.1rem;
        transition: all 0.2s ease;
    }
    .feature-num {
        font-size: 0.7rem;
        font-weight: 900;
        color: #3b82f6;
        font-family: monospace !important;
        background: rgba(37, 99, 235, 0.15);
        border: 1px solid rgba(37, 99, 235, 0.3);
        padding: 0.2rem 0.5rem;
        border-radius: 7px;
    }
    .feature-title {
        font-size: 0.95rem;
        font-weight: 700;
        color: #F5F5F5;
        margin-top: 0.5rem;
        margin-bottom: 0.25rem;
    }
    .feature-desc {
        font-size: 0.8rem;
        color: #A3A3A3;
        line-height: 1.45;
    }

    /* Mobile Bottom App Dock */
    .mobile-app-dock {
        display: flex;
        align-items: center;
        justify-content: space-around;
        position: fixed;
        bottom: 0.75rem;
        left: 50%;
        transform: translateX(-50%);
        width: calc(100% - 1.5rem);
        max-width: 460px;
        background: rgba(18, 18, 24, 0.85);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-top: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 9999px;
        padding: 0.6rem 1rem;
        z-index: 999;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
    }
    .dock-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.15rem;
        color: #A3A3A3;
        font-size: 0.7rem;
        font-weight: 600;
        text-decoration: none;
    }
    .dock-item.active {
        color: #60a5fa;
    }
    @media (min-width: 768px) {
        .mobile-app-dock {
            display: none;
        }
    }

    /* Alert Boxes (Streamlit Success/Error/Info) Clean Styling */
    div[data-testid="stAlert"] {
        background-color: rgba(22, 22, 28, 0.9) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        border-radius: 14px !important;
        color: #F5F5F5 !important;
    }
</style>
""", unsafe_allow_html=True)

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

def fetch_guest_cookies():
    try:
        import requests
        import time
        s = requests.Session()
        s.headers.update({'User-Agent': USER_AGENT})
        r = s.get('https://www.youtube.com', timeout=8)
        lines = ['# Netscape HTTP Cookie File']
        exp = int(time.time()) + 365*86400
        for c in s.cookies:
            domain = c.domain if c.domain.startswith('.') else '.' + c.domain
            lines.append('\t'.join([domain, 'TRUE', c.path or '/', 'TRUE' if c.secure else 'FALSE', str(exp), c.name, c.value]))
        content = '\n'.join(lines) + '\n'
        guest_path = os.path.join(tempfile.gettempdir(), "guest_cookies.txt")
        with open(guest_path, "w", encoding="utf-8") as f:
            f.write(content)
        return guest_path
    except Exception:
        return None

def get_cookies_path():
    if "custom_cookies" in st.session_state and st.session_state.custom_cookies:
        path = os.path.join(tempfile.gettempdir(), "user_cookies.txt")
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(st.session_state.custom_cookies)
            return path
        except Exception:
            pass
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
    return fetch_guest_cookies()

def get_proxy():
    try:
        if "PROXY" in st.secrets:
            return st.secrets["PROXY"].strip()
        if "HTTP_PROXY" in st.secrets:
            return st.secrets["HTTP_PROXY"].strip()
        if "HTTPS_PROXY" in st.secrets:
            return st.secrets["HTTPS_PROXY"].strip()
    except Exception:
        pass
    return (os.environ.get("HTTP_PROXY") or os.environ.get("HTTPS_PROXY") or os.environ.get("PROXY") or "").strip() or None

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

# Top Navbar & Header UI
st.markdown("""
<div class="official-navbar">
    <div class="brand-wrap">
        <div class="brand-icon-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 4v12" />
                <path d="m7 11 5 5 5-5" />
                <path d="M5 20h14" />
            </svg>
        </div>
        <div style="display:flex; align-items:center;">
            <span class="brand-text-pak">Pak</span>
            <span class="brand-badge-get">Get</span>
        </div>
    </div>
    <div class="nav-badge-pill">
        <span class="pulse-dot"></span>
        <span>App v2.0 • Free</span>
    </div>
</div>

<div class="hero-wrap">
    <div class="hero-pill-badge">
        <span class="pulse-dot"></span>
        <span style="color:#F5F5F5;">PakGet Engine</span>
        <span style="color:#666666;">•</span>
        <span style="color:#3B82F6;">100% Stateless & Free</span>
    </div>
    <h1 class="hero-h1">
        Free video downloader in Pakistan.<br>
        <span class="hero-elevated-badge">
            <span class="hero-gradient-text">Paste a link. Done.</span>
        </span>
    </h1>
    <p class="hero-p">
        Download supported public videos from YouTube, Instagram Reels, TikTok, Facebook, and X. Fast, free, and no account required.
    </p>
    <div class="platforms-wrap">
        <span class="platform-item"><span style="color:#FF0000; font-size:0.9rem;">▶</span> YouTube</span>
        <span class="platform-item"><span style="color:#E1306C; font-size:0.9rem;">●</span> Instagram</span>
        <span class="platform-item"><span style="color:#FFFFFF; font-size:0.9rem;">♪</span> TikTok</span>
        <span class="platform-item"><span style="color:#1877F2; font-size:0.9rem;">f</span> Facebook</span>
        <span class="platform-item"><span style="color:#1DA1F2; font-size:0.9rem;">𝕏</span> Twitter / X</span>
    </div>
</div>
""", unsafe_allow_html=True)

# URL Input Field
url_input = st.text_input(
    label="Video URL",
    placeholder="Paste video link here (YouTube, Instagram, TikTok, Facebook, X)...",
    label_visibility="collapsed"
)

col1, col2 = st.columns([3, 1])
with col1:
    fetch_btn = st.button("⚡ Fetch Video Details", width="stretch")
with col2:
    if st.button("Clear", width="stretch"):
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
        'geo_bypass': True,
        'js_runtimes': {'node': {}},
    }
    
    cookies = get_cookies_path()
    if cookies:
        ydl_opts['cookiefile'] = cookies

    proxy = get_proxy()
    if proxy:
        ydl_opts['proxy'] = proxy

    if "youtube.com" in target_url or "youtu.be" in target_url:
        ydl_opts['extractor_args'] = {
            'youtube': {
                'player_client': ['visionos', 'mediaconnect', 'android_creator', 'tv_embedded', 'web_safari'],
            }
        }

    with st.spinner("Analyzing media stream with yt-dlp..."):
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(target_url, download=False)
                st.session_state.video_info = info
        except Exception as e:
            err_msg = str(e)
            # Automatic fallback to tv_embedded / visionos if bot challenge encountered
            if "bot" in err_msg.lower() or "sign in" in err_msg.lower():
                try:
                    ydl_opts['extractor_args'] = {
                        'youtube': {'player_client': ['tv_embedded', 'visionos']}
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
    uploader = info.get("uploader") or info.get("channel", "Creator")
    duration_str = format_duration(info.get("duration"))
    view_count = f"{info.get('view_count', 0):,}" if info.get('view_count') else None

    # Resolve reliable image thumbnail
    video_id = info.get("id")
    if "youtube" in platform_name.lower() and video_id:
        thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    else:
        thumbnail_url = info.get("thumbnail") or (info.get("thumbnails") and info["thumbnails"][-1].get("url")) or ""

    meta_html = f"<b>Platform:</b> {platform_name} &nbsp;•&nbsp; <b>Creator:</b> {uploader}"
    if duration_str:
        meta_html += f" &nbsp;•&nbsp; <b>Duration:</b> {duration_str}"
    if view_count:
        meta_html += f" &nbsp;•&nbsp; <b>Views:</b> {view_count}"

    # Self-contained clean card layout matching official website liquid glass design
    img_html = f'<img src="{thumbnail_url}" style="width: 100%; border-radius: 14px; max-height: 420px; object-fit: cover; margin-bottom: 0.85rem;" alt="{title}" />' if thumbnail_url else ''
    card_html = f'''
    <div class="official-video-card">
        {img_html}
        <div class="card-title">{title}</div>
        <div class="card-meta">{meta_html}</div>
    </div>
    '''
    st.markdown(card_html, unsafe_allow_html=True)

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

    if st.button("⬇️ Generate Download Link", width="stretch"):
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
                        'js_runtimes': {'node': {}},
                    }
                    
                    if "youtube.com" in st.session_state.target_url or "youtu.be" in st.session_state.target_url:
                        dl_opts['extractor_args'] = {
                            'youtube': {
                                'player_client': ['visionos', 'mediaconnect', 'android_creator', 'tv_embedded'],
                            }
                        }

                    cookies = get_cookies_path()
                    if cookies:
                        dl_opts['cookiefile'] = cookies

                    proxy = get_proxy()
                    if proxy:
                        dl_opts['proxy'] = proxy

                    if is_audio:
                        dl_opts['format'] = 'bestaudio/best'
                        if has_ffmpeg:
                            dl_opts['postprocessors'] = [{
                                'key': 'FFmpegExtractAudio',
                                'preferredcodec': 'mp3',
                                'preferredquality': '192',
                            }]
                        else:
                            output_filename = f"{clean_file_title}.m4a"
                            file_ext = "m4a"
                    else:
                        if has_ffmpeg:
                            if "Best Quality" in format_choice:
                                dl_opts['format'] = 'bestvideo+bestaudio/best'
                            elif "720p" in format_choice:
                                dl_opts['format'] = 'bestvideo[height<=720]+bestaudio/best[height<=720]/bestvideo+bestaudio/best'
                            elif "480p" in format_choice:
                                dl_opts['format'] = 'bestvideo[height<=480]+bestaudio/best[height<=480]/bestvideo+bestaudio/best'
                            else:
                                dl_opts['format'] = 'bestvideo[height<=360]+bestaudio/best[height<=360]/bestvideo+bestaudio/best'
                            dl_opts['merge_output_format'] = 'mp4'
                        else:
                            dl_opts['format'] = 'best/bestvideo+bestaudio'

                    try:
                        with yt_dlp.YoutubeDL(dl_opts) as ydl:
                            ydl.download([st.session_state.target_url])
                    except Exception as dl_err:
                        # Fallback try with visionos, mediaconnect, and android_creator clients
                        download_succeeded = False
                        for fb_client in ['visionos', 'mediaconnect', 'android_creator', 'tv_embedded']:
                            try:
                                fb_opts = dict(dl_opts)
                                fb_opts['extractor_args'] = {'youtube': {'player_client': [fb_client]}}
                                fb_opts['format'] = 'bestvideo+bestaudio/best'
                                fb_opts['merge_output_format'] = 'mp4'
                                with yt_dlp.YoutubeDL(fb_opts) as fallback_ydl:
                                    fallback_ydl.download([st.session_state.target_url])
                                download_succeeded = True
                                break
                            except Exception:
                                continue
                        if not download_succeeded:
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
                            width="stretch"
                        )
                    else:
                        st.error("No output file was created.")
            except Exception as dl_err:
                err_text = str(dl_err)
                if "403" in err_text or "forbidden" in err_text.lower():
                    st.error("🚫 **YouTube Cloud Restriction (HTTP 403)**: YouTube restricts media stream downloads from public cloud hosting servers (AWS / Streamlit Cloud). Instagram, TikTok, Facebook, and Twitter work 100% on the cloud. For unrestricted YouTube downloads, run PakGet locally or deploy with residential proxy routing.")
                else:
                    st.error(f"⚠️ Download error: {err_text}")

# How It Works & Supported Platforms (Matching Official Next.js Website)
st.markdown("""
<div style="margin-top: 3.5rem; margin-bottom: 2rem;">
    <div style="text-align: left; margin-bottom: 1rem;">
        <h2 style="font-size: 1.4rem; font-weight: 700; color: #F5F5F5; margin-bottom: 0.25rem;">How It Works</h2>
        <p style="font-size: 0.85rem; color: #A3A3A3; margin: 0;">Stateless, fast, and secure media downloads in three simple steps.</p>
    </div>
    <div class="grid-wrap">
        <div class="feature-card">
            <span class="feature-num">01</span>
            <div class="feature-title">Paste video link</div>
            <div class="feature-desc">Copy the URL from YouTube, Instagram Reels, TikTok, Facebook, or Twitter/X and paste it into the field.</div>
        </div>
        <div class="feature-card">
            <span class="feature-num">02</span>
            <div class="feature-title">Choose format</div>
            <div class="feature-desc">Select your preferred video resolution (1080p HD, 720p, 480p) or switch to audio-only MP3 format.</div>
        </div>
        <div class="feature-card">
            <span class="feature-num">03</span>
            <div class="feature-title">Download instantly</div>
            <div class="feature-desc">Save the media file directly to your device storage or phone gallery with zero ads or registration.</div>
        </div>
    </div>
</div>

<div style="margin-top: 2.75rem; margin-bottom: 2rem;">
    <div style="text-align: left; margin-bottom: 0.85rem;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #F5F5F5; margin-bottom: 0.2rem;">Supported Platforms</h2>
        <p style="font-size: 0.82rem; color: #A3A3A3; margin: 0;">Optimized download engines tailored for all major social networks.</p>
    </div>
    <div class="grid-platforms">
        <div class="feature-card">
            <div style="font-size: 1.2rem; color: #FF0000; margin-bottom: 0.25rem;">▶</div>
            <div class="feature-title">YouTube</div>
            <div class="feature-desc">Videos, Shorts, MP3 audio.</div>
        </div>
        <div class="feature-card">
            <div style="font-size: 1.2rem; color: #E1306C; margin-bottom: 0.25rem;">●</div>
            <div class="feature-title">Instagram</div>
            <div class="feature-desc">Reels, Videos, Carousel.</div>
        </div>
        <div class="feature-card">
            <div style="font-size: 1.2rem; color: #FFFFFF; margin-bottom: 0.25rem;">♪</div>
            <div class="feature-title">TikTok</div>
            <div class="feature-desc">Fast videos no watermark.</div>
        </div>
        <div class="feature-card">
            <div style="font-size: 1.2rem; color: #1877F2; margin-bottom: 0.25rem;">f</div>
            <div class="feature-title">Facebook</div>
            <div class="feature-desc">Watch clips, Reels in HD.</div>
        </div>
        <div class="feature-card" style="grid-column: span 2 sm:grid-column: span 1;">
            <div style="font-size: 1.2rem; color: #1DA1F2; margin-bottom: 0.25rem;">𝕏</div>
            <div class="feature-title">Twitter / X</div>
            <div class="feature-desc">Direct MP4 video download.</div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# FAQ Accordion
with st.expander("Frequently Asked Questions"):
    st.markdown("""
    **Is this downloader free?**  
    Yes, 100% free with no limits, no registration, and no ads.
    
    **Which platforms are supported?**  
    Instagram Reels & Posts, TikTok, Facebook Videos, Twitter / X, and YouTube.
    
    **Can I download private videos?**  
    No. Only public media can be downloaded according to platform policies.
    """)

# Official Footer & Mobile App Dock
st.markdown("""
<div style="margin-top: 3.5rem; padding-top: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center; margin-bottom: 3.5rem;">
    <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.75rem;">
        <span class="brand-text-pak">Pak</span>
        <span class="brand-badge-get">Get</span>
    </div>
    <p style="color: #666666; font-size: 0.8rem; max-width: 480px; margin: 0 auto 1.25rem; line-height: 1.5;">
        A high-performance, stateless progressive web app for downloading social media in HD without accounts or tracking.
    </p>
    <div style="color: #444444; font-size: 0.75rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
        © 2026 <b>PakGet</b>. All rights reserved. Purely for personal, non-commercial use.
    </div>
</div>

<!-- Mobile Bottom App Dock for Native App Experience -->
<div class="mobile-app-dock">
    <div class="dock-item active">
        <span style="font-size: 1rem;">⚡</span>
        <span>Downloader</span>
    </div>
    <div class="dock-item">
        <span style="font-size: 1rem;">🔒</span>
        <span>Stateless</span>
    </div>
    <div class="dock-item">
        <span style="font-size: 1rem;">📱</span>
        <span>App Ready</span>
    </div>
    <div class="dock-item">
        <span style="font-size: 1rem;">✨</span>
        <span>100% Free</span>
    </div>
</div>
""", unsafe_allow_html=True)
