import React, { useState } from 'react';
import { ChevronDown, Video, Music, Check } from 'lucide-react';
import { VideoFormatOption } from '@/lib/ytdlp';
import { formatBytes } from '@/lib/utils';
import { PlatformConfig } from '@/lib/platforms';

interface FormatSelectorProps {
  formats: VideoFormatOption[];
  selectedFormatId: string;
  isAudioOnly: boolean;
  onSelectFormat: (formatId: string) => void;
  onToggleAudioOnly: (isAudio: boolean) => void;
  platform: PlatformConfig | null;
}

export function FormatSelector({
  formats,
  selectedFormatId,
  isAudioOnly,
  onSelectFormat,
  onToggleAudioOnly,
  platform,
}: FormatSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const videoFormats = formats.filter((f) => f.hasVideo);
  const selectedFormat = formats.find((f) => f.id === selectedFormatId) || formats[0];

  const hasAudioToggle = platform ? platform.hasAudioOnly : true;
  const hasQualitySelect = platform ? platform.hasQualitySelect : true;

  return (
    <div className="w-full space-y-3">
      {/* Type Toggle & Quality Summary Row */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Type Toggle: Video vs Audio */}
        {hasAudioToggle && (
          <div className="flex items-center p-1 bg-black/40 border border-white/10 rounded-2xl flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                onToggleAudioOnly(false);
                if (videoFormats.length > 0) {
                  onSelectFormat(videoFormats[0].id);
                }
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isAudioOnly
                  ? 'bg-accent text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleAudioOnly(true);
                onSelectFormat('bestaudio/best');
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isAudioOnly
                  ? 'bg-accent text-white shadow-md'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio (MP3)</span>
            </button>
          </div>
        )}

        {/* Quality Trigger Pill */}
        {!isAudioOnly && hasQualitySelect && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 min-h-[46px] flex items-center justify-between px-4 py-2.5 bg-black/40 hover:bg-black/60 border border-white/15 hover:border-accent/50 rounded-2xl text-left transition-all shadow-sm group select-none"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-text-muted">Quality:</span>
              <span className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                {selectedFormat?.formatNote || '1080p Full HD'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="text-[11px] font-medium hidden sm:inline text-text-muted">
                {isExpanded ? 'Hide Options' : 'Change Resolution'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${
                  isExpanded ? 'rotate-180 text-accent' : ''
                }`}
              />
            </div>
          </button>
        )}
      </div>

      {/* Smooth Inline Expandable Resolution List (No Overlapping!) */}
      {isExpanded && !isAudioOnly && (
        <div className="p-2.5 bg-black/50 border border-white/15 rounded-2xl space-y-1.5 animate-slide-up">
          <div className="px-3 py-1 text-[11px] font-bold text-text-muted uppercase tracking-wider">
            Available Video Resolutions:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {videoFormats.map((fmt) => {
              const isSelected = !isAudioOnly && selectedFormatId === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => {
                    onToggleAudioOnly(false);
                    onSelectFormat(fmt.id);
                    setIsExpanded(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? 'bg-accent/20 border-accent text-text-primary shadow-sm ring-1 ring-accent/30'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg flex-shrink-0 ${
                        isSelected ? 'bg-accent text-white' : 'bg-white/5 text-text-muted'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-text-primary truncate">
                        {fmt.formatNote}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        MP4 {fmt.filesize ? `• ~${formatBytes(fmt.filesize)}` : ''}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
