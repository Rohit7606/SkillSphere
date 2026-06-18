"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-surface border border-border p-10 rounded-[2.5rem] shadow-2xl max-w-md text-center">
        <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Something went wrong</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          We encountered an unexpected issue while loading your workspace. Don't worry, your data is safe.
        </p>
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent-primary hover:bg-accent-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          <RefreshCcw className="w-5 h-5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
