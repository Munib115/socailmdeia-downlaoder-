import React from 'react';
import { Link as LinkIcon, Video, Download } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: '1',
      icon: <LinkIcon className="w-5 h-5 text-accent" />,
      title: 'Paste the video URL',
      description: 'Copy the link from YouTube, Instagram Reels, TikTok, Facebook, or Twitter/X and paste it into the field.',
    },
    {
      number: '2',
      icon: <Video className="w-5 h-5 text-accent" />,
      title: 'Choose quality & format',
      description: 'Select your preferred video resolution (1080p HD, 720p) or switch to audio-only MP3 format.',
    },
    {
      number: '3',
      icon: <Download className="w-5 h-5 text-accent" />,
      title: 'Download instantly',
      description: 'Save the media file directly to your device storage or share it with friends via the native share sheet.',
    },
  ];

  return (
    <section className="w-full space-y-6 cv-auto">
      <div className="space-y-1 text-center sm:text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          How It Works
        </h2>
        <p className="text-sm text-text-secondary">
          Stateless, fast, and secure media downloads in three simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className="p-6 liquid-glass rounded-3xl space-y-4 relative group hover:border-accent/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                {step.icon}
              </div>
              <span className="text-xs font-black text-text-muted font-mono px-2.5 py-1 rounded-xl bg-white/5 border border-white/5">
                0{step.number}
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-text-primary">{step.title}</h3>
              <p className="text-xs leading-relaxed text-text-secondary">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
