import React from 'react';
import { Metadata } from 'next';
import { PLATFORMS } from '@/lib/platforms';
import { YouTubeIcon } from '@/components/icons/platforms/YouTube';
import { InstagramIcon } from '@/components/icons/platforms/Instagram';
import { TikTokIcon } from '@/components/icons/platforms/TikTok';
import { FacebookIcon } from '@/components/icons/platforms/Facebook';
import { TwitterIcon } from '@/components/icons/platforms/Twitter';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Supported Platforms — PakGet Downloader',
  description:
    'See which public YouTube, Instagram, TikTok, Facebook, and X video links, formats, and quality options PakGet supports in Pakistan.',
  alternates: { canonical: '/supported' },
};

export default function SupportedPage() {
  const getIcon = (id: string) => {
    switch (id) {
      case 'youtube':
        return <YouTubeIcon className="w-6 h-6 text-[#FF0000]" />;
      case 'instagram':
        return <InstagramIcon className="w-6 h-6 text-[#E1306C]" />;
      case 'tiktok':
        return <TikTokIcon className="w-6 h-6 text-text-primary" />;
      case 'facebook':
        return <FacebookIcon className="w-6 h-6 text-[#1877F2]" />;
      case 'twitter':
        return <TwitterIcon className="w-6 h-6 text-[#1DA1F2]" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
          Supported Platforms & Formats
        </h1>
        <p className="text-base text-text-secondary leading-relaxed">
          PakGet natively decodes public media streams across all top social platforms. Review supported features and link formats below.
        </p>
      </div>

      {/* Feature Matrix Table */}
      <div className="w-full overflow-x-auto liquid-glass rounded-3xl p-3 sm:p-5 shadow-xl">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-white/10 text-text-muted">
              <th className="pb-3 px-3 font-semibold">Platform</th>
              <th className="pb-3 px-3 font-semibold">Downloads</th>
              <th className="pb-3 px-3 font-semibold">Audio Only (MP3)</th>
              <th className="pb-3 px-3 font-semibold">Quality Selection</th>
              <th className="pb-3 px-3 font-semibold">Watermark Removal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr>
              <td className="py-3.5 px-3 font-bold flex items-center gap-2">
                <YouTubeIcon className="w-4 h-4 text-[#FF0000]" /> YouTube
              </td>
              <td className="py-3.5 px-3 text-success font-medium">✅ Videos, Shorts</td>
              <td className="py-3.5 px-3 text-success font-medium">✅ MP3</td>
              <td className="py-3.5 px-3 font-medium">360p - 4K HD</td>
              <td className="py-3.5 px-3 text-text-muted">N/A</td>
            </tr>
            <tr>
              <td className="py-3.5 px-3 font-bold flex items-center gap-2">
                <InstagramIcon className="w-4 h-4 text-[#E1306C]" /> Instagram
              </td>
              <td className="py-3.5 px-3 text-success font-medium">✅ Reels, Posts</td>
              <td className="py-3.5 px-3 text-text-muted">❌</td>
              <td className="py-3.5 px-3 font-medium">Original HD</td>
              <td className="py-3.5 px-3 text-text-muted">N/A</td>
            </tr>
            <tr>
              <td className="py-3.5 px-3 font-bold flex items-center gap-2">
                <TikTokIcon className="w-4 h-4 text-text-primary" /> TikTok
              </td>
              <td className="py-3.5 px-3 text-success font-medium">✅ Videos</td>
              <td className="py-3.5 px-3 text-text-muted">❌</td>
              <td className="py-3.5 px-3 font-medium">Original HD</td>
              <td className="py-3.5 px-3 text-success font-bold">✅ Yes (No Watermark)</td>
            </tr>
            <tr>
              <td className="py-3.5 px-3 font-bold flex items-center gap-2">
                <FacebookIcon className="w-4 h-4 text-[#1877F2]" /> Facebook
              </td>
              <td className="py-3.5 px-3 text-success font-medium">✅ Public videos</td>
              <td className="py-3.5 px-3 text-text-muted">❌</td>
              <td className="py-3.5 px-3 font-medium">SD / HD</td>
              <td className="py-3.5 px-3 text-text-muted">N/A</td>
            </tr>
            <tr>
              <td className="py-3.5 px-3 font-bold flex items-center gap-2">
                <TwitterIcon className="w-4 h-4 text-[#1DA1F2]" /> Twitter / X
              </td>
              <td className="py-3.5 px-3 text-success font-medium">✅ Videos, GIFs</td>
              <td className="py-3.5 px-3 text-text-muted">❌</td>
              <td className="py-3.5 px-3 font-medium">Original MP4</td>
              <td className="py-3.5 px-3 text-text-muted">N/A</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(PLATFORMS).map((p) => (
          <div key={p.id} className="p-6 liquid-glass rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm">
                  {getIcon(p.id)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">{p.name}</h3>
                  <p className="text-xs text-text-muted">Domain: {p.domains[0]}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-text-muted">Example Link Format:</div>
              <code className="block p-2.5 bg-black/40 rounded-xl text-xs font-mono text-accent truncate border border-white/10">
                {p.urlPlaceholder}
              </code>
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-text-muted">Supported Media:</div>
              <div className="flex flex-wrap gap-1.5">
                {p.supportedMedia.map((m) => (
                  <Badge key={m} variant="default" size="sm" className="bg-white/5 border-white/10">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Back to Downloader CTA */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-accent hover:bg-accent-hover text-white rounded-2xl font-bold text-sm shadow-xl transition-all active:scale-95"
        >
          <span>Open Downloader</span>
        </Link>
      </div>
    </div>
  );
}
