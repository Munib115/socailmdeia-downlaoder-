import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PakGet - Free video downloader in Pakistan';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: '#0a0a0a', color: 'white', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', padding: '72px', width: '100%' }}>
      <div style={{ color: '#60a5fa', display: 'flex', fontSize: 32, fontWeight: 700 }}>PAKGET</div>
      <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, lineHeight: 1.05, marginTop: 24 }}>Download public videos. Fast.</div>
      <div style={{ color: '#cbd5e1', display: 'flex', fontSize: 32, marginTop: 28 }}>YouTube, Instagram, TikTok, Facebook, and X</div>
    </div>,
    size,
  );
}
