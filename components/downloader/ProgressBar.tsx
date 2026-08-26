import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress?: number; // 0 to 100
  isIndeterminate?: boolean;
  statusText?: string;
  className?: string;
}

export function ProgressBar({
  progress = 0,
  isIndeterminate = false,
  statusText,
  className,
}: ProgressBarProps) {
  return (
    <div className={cn('w-full space-y-2', className)}>
      <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
        <span>{statusText || (isIndeterminate ? 'Fetching video stream...' : 'Downloading...')}</span>
        {!isIndeterminate && <span>{Math.round(progress)}%</span>}
      </div>

      <div className="w-full h-2.5 bg-surface border border-border rounded-full overflow-hidden relative">
        {isIndeterminate ? (
          <div className="absolute inset-y-0 w-1/3 bg-accent rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" />
        ) : (
          <div
            className="h-full bg-accent rounded-full transition-all duration-200 ease-out"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        )}
      </div>
    </div>
  );
}
