import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 px-4">
      <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-accent text-2xl font-black">
        404
      </div>
      <h1 className="text-2xl font-bold text-text-primary">Page Not Found</h1>
      <p className="text-sm text-text-secondary max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-md"
      >
        Return to Downloader
      </Link>
    </div>
  );
}
