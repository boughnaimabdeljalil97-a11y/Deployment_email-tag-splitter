import React from 'react';
import { Moon, Sun, PlayCircle, HelpCircle } from 'lucide-react';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onLoadSample: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  onToggleTheme,
  onLoadSample,
  onOpenHelp,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2.5 text-slate-900 dark:text-white font-semibold text-lg tracking-tight group">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-sm font-bold tracking-tighter">
              TS
            </span>
            <span>Tag Splitter</span>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <a href="#input-section" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Input & Split
          </a>
          <a href="#stats-section" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Session Stats
          </a>
          <a href="#results-section" className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            Partitioned Lists
          </a>
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Rules & Guide</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-neutral-700 bg-neutral-100 hover:bg-neutral-200 dark:text-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
            title="Load realistic sample table data"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
