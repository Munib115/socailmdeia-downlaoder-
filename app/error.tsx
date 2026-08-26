'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-error text-2xl font-black">
        !
      </div>
      <h1 className="text-2xl font-bold text-text-primary">Something Went Wrong</h1>
      <p className="text-sm text-text-secondary max-w-sm">
        An unexpected error occurred. Please try again or return to home.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-surface hover:bg-elevated border border-border text-text-primary text-sm font-bold rounded-xl transition-all active:scale-95"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-md"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
