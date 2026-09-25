"use client";

/**
 * Debounced SearchBar.
 * Wait until the user stops typing (e.g. 500ms) before firing the onSearch event.
 */

import { useState, useEffect, useRef } from "react";

interface SearchBarProps {
  value: string;
  onSearch: (q: string) => void;
  placeholder?: string;
  delayMs?: number;
}

export default function SearchBar({
  value,
  onSearch,
  placeholder = "Search products…",
  delayMs = 500,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const isFirstMount = useRef(true);

  // Sync with external value changes (e.g., from URL)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce logic
  useEffect(() => {
    // Skip firing on the very first mount since the URL already dictates the state
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onSearch(localValue);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [localValue, onSearch, delayMs]);

  return (
    <div className="relative w-full">
      {/* Search icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
      />
    </div>
  );
}
