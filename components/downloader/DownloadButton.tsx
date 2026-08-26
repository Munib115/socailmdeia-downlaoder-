import React from 'react';
import { Download, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export type DownloadState = 'IDLE' | 'DETECTING' | 'PREVIEWING' | 'DOWNLOADING' | 'COMPLETE' | 'ERROR';

interface DownloadButtonProps {
  state: DownloadState;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  isAudioOnly?: boolean;
}

export function DownloadButton({
  state,
  onClick,
  disabled = false,
  className,
  isAudioOnly = false,
}: DownloadButtonProps) {
  const getButtonConfig = () => {
    switch (state) {
      case 'DETECTING':
        return {
          text: 'Fetching details...',
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          variant: 'primary' as const,
          isLoading: true,
        };
      case 'DOWNLOADING':
        return {
          text: isAudioOnly ? 'Processing Audio...' : 'Downloading Video...',
          icon: <Loader2 className="w-5 h-5 animate-spin" />,
          variant: 'primary' as const,
          isLoading: true,
        };
      case 'COMPLETE':
        return {
          text: 'Download Again',
          icon: <Check className="w-5 h-5 text-success" />,
          variant: 'secondary' as const,
          isLoading: false,
        };
      case 'ERROR':
        return {
          text: 'Try Again',
          icon: <AlertCircle className="w-5 h-5 text-error" />,
          variant: 'secondary' as const,
          isLoading: false,
        };
      case 'PREVIEWING':
      case 'IDLE':
      default:
        return {
          text: isAudioOnly ? 'Download Audio' : 'Download Now',
          icon: <Download className="w-5 h-5" />,
          variant: 'primary' as const,
          isLoading: false,
        };
    }
  };

  const config = getButtonConfig();

  return (
    <Button
      type="button"
      size="lg"
      variant={config.variant}
      isLoading={config.isLoading}
      leftIcon={!config.isLoading ? config.icon : undefined}
      disabled={disabled || config.isLoading}
      onClick={onClick}
      className={`w-full font-bold tracking-wide shadow-md ${className}`}
    >
      {config.text}
    </Button>
  );
}
