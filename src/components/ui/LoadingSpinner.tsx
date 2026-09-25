"use client";

/**
 * LoadingSpinner – a centered animated spinner with an optional label.
 * Used in all loading states throughout the app.
 */

interface LoadingSpinnerProps {
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({
  label = "Loading…",
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-9 h-9 border-2",
    lg: "w-14 h-14 border-[3px]",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div
        className={`${sizeClasses[size]} rounded-full border-blue-500 border-t-transparent animate-spin`}
        role="status"
        aria-label={label}
      />
      {label && (
        <p className="text-sm text-zinc-400 animate-pulse">{label}</p>
      )}
    </div>
  );
}
