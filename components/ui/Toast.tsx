import React from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-50 animate-slide-up">
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md',
          isSuccess && 'bg-surface/95 border-success/40 text-text-primary',
          isError && 'bg-surface/95 border-error/40 text-text-primary',
          !isSuccess && !isError && 'bg-surface/95 border-border text-text-primary'
        )}
      >
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
            isSuccess && 'bg-success/20 text-success',
            isError && 'bg-error/20 text-error',
            !isSuccess && !isError && 'bg-accent/20 text-accent'
          )}
        >
          {isSuccess && <Check className="w-4 h-4" />}
          {isError && <AlertCircle className="w-4 h-4" />}
          {!isSuccess && !isError && <AlertCircle className="w-4 h-4" />}
        </div>
        <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>
        <button
          onClick={onDismiss}
          className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
