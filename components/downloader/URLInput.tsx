import React, { useRef } from 'react';
import { Link as LinkIcon, X, Copy, AlertCircle, Loader2 } from 'lucide-react';
import { PlatformConfig } from '@/lib/platforms';
import { PlatformBadge } from './PlatformBadge';

interface URLInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  platform: PlatformConfig | null;
  isLoading: boolean;
  errorMessage?: string | null;
  placeholder?: string;
}

export function URLInput({
  value,
  onChange,
  onSubmit,
  onClear,
  platform,
  isLoading,
  errorMessage,
  placeholder = 'Paste video link here (YouTube, Instagram, TikTok, Facebook, Twitter)...',
}: URLInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChange(clipText.trim());
      }
    } catch (_) {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full space-y-2">
      <div
        className={`relative flex items-center w-full min-h-[62px] liquid-glass-input rounded-2xl transition-all duration-200 shadow-2xl ${
          errorMessage
            ? 'border-error/80 ring-2 ring-error/30'
            : platform
            ? 'border-accent/70 ring-2 ring-accent/20'
            : 'focus-within:border-accent/80 focus-within:ring-2 focus-within:ring-accent/25'
        }`}
      >
        {/* Left Link Icon */}
        <div className="pl-4 pr-2 flex items-center pointer-events-none text-text-muted">
          <LinkIcon className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent py-4 text-text-primary placeholder:text-text-muted text-sm sm:text-base outline-none font-sans"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Action icons on right */}
        <div className="pr-3 flex items-center gap-2">
          {isLoading && (
            <div className="p-1.5 text-accent">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}

          {!isLoading && value && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 text-text-muted hover:text-text-primary rounded-lg transition-colors active:scale-95 hover:bg-white/10"
              title="Clear input"
              aria-label="Clear input"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {!value && (
            <button
              type="button"
              onClick={handlePaste}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-text-secondary hover:text-text-primary text-xs font-semibold border border-white/10 transition-all active:scale-95 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          )}
        </div>
      </div>

      {/* Platform auto-detected tag or inline error message */}
      <div className="flex items-center justify-between px-1 text-xs">
        {errorMessage ? (
          <div className="flex items-center gap-1.5 text-error font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Detected platform:</span>
            <PlatformBadge platform={platform} />
          </div>
        )}
      </div>
    </div>
  );
}
