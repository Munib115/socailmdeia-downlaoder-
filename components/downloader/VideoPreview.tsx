import React, { useState } from 'react';
import { VideoMetadata } from '@/lib/ytdlp';
import { PlatformConfig } from '@/lib/platforms';
import { formatDuration } from '@/lib/utils';
import { PlatformBadge } from './PlatformBadge';
import { FormatSelector } from './FormatSelector';
import { DownloadButton, DownloadState } from './DownloadButton';
import { ProgressBar } from './ProgressBar';
import { Share2, Check, Copy } from 'lucide-react';

interface VideoPreviewProps {
  metadata: VideoMetadata;
  platform: PlatformConfig | null;
  downloadState: DownloadState;
  onDownload: (formatId: string, isAudioOnly: boolean, title?: string) => void;
  progress?: number;
}

export function VideoPreview({
  metadata,
  platform,
  downloadState,
  onDownload,
  progress = 0,
}: VideoPreviewProps) {
  const [selectedFormatId, setSelectedFormatId] = useState<string>(
    metadata.formats && metadata.formats.length > 0 ? metadata.formats[0].id : 'best'
  );
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: metadata.title,
          text: `Check out this video: ${metadata.title}`,
          url: metadata.url,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (_) {
        // User cancelled
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(metadata.url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full liquid-glass-elevated rounded-3xl p-5 md:p-7 shadow-2xl space-y-6 animate-slide-up relative">
      {/* Subtle top specular sheen */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none rounded-t-3xl" />

      {/* Top: Media Info Row */}
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Thumbnail Preview */}
        <div className="relative w-full sm:w-52 aspect-video sm:aspect-[16/10] bg-black/40 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 shadow-lg group">
          {metadata.thumbnail ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={metadata.thumbnail}
              alt={metadata.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
              No Preview
            </div>
          )}

          {metadata.duration ? (
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/80 text-white text-[11px] font-bold backdrop-blur-md border border-white/10">
              {formatDuration(metadata.duration)}
            </div>
          ) : null}
        </div>

        {/* Video Metadata Details */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex items-center gap-2">
            <PlatformBadge platform={platform} size="sm" />
            {metadata.uploader && (
              <span className="text-xs text-text-muted truncate">
                by <span className="text-text-secondary font-semibold">{metadata.uploader}</span>
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-text-primary line-clamp-2 leading-snug">
            {metadata.title}
          </h2>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-text-secondary hover:text-text-primary transition-all active:scale-95"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-text-secondary hover:text-text-primary transition-all active:scale-95"
              >
                {shared ? <Check className="w-3.5 h-3.5 text-success" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>Share</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5 space-y-4">
        {/* Format Selector */}
        <FormatSelector
          formats={metadata.formats}
          selectedFormatId={selectedFormatId}
          isAudioOnly={isAudioOnly}
          onSelectFormat={setSelectedFormatId}
          onToggleAudioOnly={setIsAudioOnly}
          platform={platform}
        />

        {/* Progress Bar (during downloading state) */}
        {downloadState === 'DOWNLOADING' && (
          <ProgressBar
            progress={progress}
            isIndeterminate={progress <= 0}
            statusText={isAudioOnly ? 'Extracting MP3 audio...' : 'Processing video download...'}
          />
        )}

        {/* Action Button */}
        <DownloadButton
          state={downloadState}
          isAudioOnly={isAudioOnly}
          onClick={() => onDownload(selectedFormatId, isAudioOnly, metadata.title)}
        />
      </div>
    </div>
  );
}
