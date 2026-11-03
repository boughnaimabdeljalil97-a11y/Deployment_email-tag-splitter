/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  Scissors,
  Copy,
  Download,
  Trash2,
  FileText,
  Upload,
  Check,
  AlertCircle,
  HelpCircle,
  ArrowDown,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StatsTable } from './components/StatsTable';
import { SummaryAlert } from './components/SummaryAlert';
import { ListCard } from './components/ListCard';
import { GuideModal } from './components/GuideModal';
import {
  parseAndSplitTags,
  formatAllListsText,
  generateSampleData,
  SplitResult,
} from './utils/tagSplitter';
import { copyToClipboard, downloadTextFile } from './utils/fileHelpers';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ts_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Inputs
  const [rawText, setRawText] = useState<string>('');
  const [numLists, setNumLists] = useState<number>(20);
  const [keepBrackets, setKeepBrackets] = useState<boolean>(true);

  // Results & status
  const [splitResult, setSplitResult] = useState<SplitResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Global actions feedback
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Filter lists view
  const [listSearch, setListSearch] = useState<string>('');

  // Drag and drop state
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Textarea ref
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPending, startTransition] = useTransition();

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ts_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ts_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Load sample dataset
  const handleLoadSample = () => {
    const sample = generateSampleData();
    setRawText(sample);
    setErrorMsg(null);
  };

  // Clear all
  const handleClear = () => {
    setRawText('');
    setSplitResult(null);
    setErrorMsg(null);
  };

  // File upload reader
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (typeof content === 'string') {
        setRawText(content);
        setErrorMsg(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read uploaded file.');
    };
    reader.readAsText(file);
  };

  // Perform split calculation
  const handleSplit = () => {
    if (!rawText.trim()) {
      setErrorMsg('Please paste raw table text or load sample data first.');
      return;
    }

    const safeLists = Math.max(1, Math.floor(numLists || 20));
    setErrorMsg(null);
    setIsProcessing(true);

    // Yield execution to allow loading indicator to render before heavy parsing
    setTimeout(() => {
      try {
        const result = parseAndSplitTags(rawText, safeLists, keepBrackets);
        if (result.totalTagsIn === 0) {
          setErrorMsg(
            'No matching tags found. Verify input contains pattern: Session Profile [TagHex] (e.g. CMH15_IT_1 1 [986459E6F11FD45A]).'
          );
          setSplitResult(null);
        } else {
          setSplitResult(result);
        }
      } catch (err: any) {
        setErrorMsg(`An error occurred while splitting: ${err?.message || 'Unknown error'}`);
      } finally {
        setIsProcessing(false);
      }
    }, 20);
  };

  // If user toggles brackets after having split, update output lists smoothly
  const handleBracketToggle = (newVal: boolean) => {
    setKeepBrackets(newVal);
    if (splitResult && rawText.trim()) {
      startTransition(() => {
        const updated = parseAndSplitTags(rawText, numLists, newVal);
        setSplitResult(updated);
      });
    }
  };

  // Copy all lists formatted
  const handleCopyAll = async () => {
    if (!splitResult || splitResult.lists.length === 0) return;
    const fullText = formatAllListsText(splitResult.lists);
    const ok = await copyToClipboard(fullText);
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  // Download all lists as single text file
  const handleDownloadAll = () => {
    if (!splitResult || splitResult.lists.length === 0) return;
    const fullText = formatAllListsText(splitResult.lists);
    downloadTextFile('all_lists.txt', fullText);
  };

  // Filtered lists for display
  const displayedLists = splitResult
    ? splitResult.lists
        .map((tags, index) => ({ tags, index }))
        .filter(({ index }) => {
          if (!listSearch.trim()) return true;
          const search = listSearch.trim().toLowerCase();
          const listLabel = `list ${index + 1}`.toLowerCase();
          return listLabel.includes(search) || (index + 1).toString() === search;
        })
    : [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      <Navbar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onLoadSample={handleLoadSample}
        onOpenHelp={() => setIsGuideOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Intro banner */}
        <section id="input-section" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Tag Splitter
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
                Partition and interleave web table tags across balanced lists. Extracts session blocks, removes duplicate columns, and rebuilds lists in round-robin sequence with full integrity verification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-neutral-500" />
                <span>Splitting Rules</span>
              </button>
            </div>
          </div>

          {/* Input workspace card */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs transition-colors">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Number of lists */}
                <div className="flex items-center gap-2">
                  <label htmlFor="num-lists" className="text-xs font-medium text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                    Number of lists:
                  </label>
                  <input
                    id="num-lists"
                    type="number"
                    min={1}
                    max={500}
                    value={numLists}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setNumLists(isNaN(val) ? 1 : Math.max(1, val));
                    }}
                    className="w-20 px-2.5 py-1.5 text-xs font-mono font-medium rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                  />
                </div>

                {/* Keep brackets checkbox */}
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={keepBrackets}
                    onChange={(e) => handleBracketToggle(e.target.checked)}
                    className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-neutral-500"
                  />
                  <span>Keep square brackets <span className="font-mono text-neutral-500 dark:text-neutral-400">[ ]</span></span>
                </label>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .txt</span>
                  <input
                    type="file"
                    accept=".txt,.tsv,.csv,.text"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {rawText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 transition-colors"
                    title="Clear input"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Textarea */}
            <div
              className={`relative rounded-lg border transition-colors ${
                isDragging
                  ? 'border-neutral-900 dark:border-white bg-neutral-100/50 dark:bg-neutral-800/50'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
            >
              <textarea
                ref={textareaRef}
                rows={9}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={`Paste raw web table text here with columns "List  Profile  Tag", or drop a text file...\n\nExample row format:\nCMH15_IT_1 1 [986459E6F11FD45A] CMH15_IT_2 1 [B1A880B2919BA89A]\nCMH15_IT_1 2 [FAF836E2AEF15C87] CMH15_IT_2 2 [53295FAEF049A1E5]`}
                className="w-full p-3.5 font-mono text-xs leading-relaxed bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rounded-lg placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400 select-text resize-y"
              />

              {/* Counter status bar */}
              <div className="px-3 py-1.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-b-lg flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-3">
                  <span>Characters: {rawText.length.toLocaleString()}</span>
                  <span>·</span>
                  <span>Lines: {rawText ? rawText.split('\n').length.toLocaleString() : 0}</span>
                </div>
                <span>Runs 100% locally in browser</span>
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Split CTA */}
            <div className="mt-5 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSplit}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 transition-all shadow-xs"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Tags...</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>Split Tags across {numLists} Lists</span>
                  </>
                )}
              </button>

              {!rawText && (
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline underline-offset-4"
                >
                  Need test data? Load sample input
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Results section */}
        {splitResult && (
          <section id="stats-section" className="space-y-8 animate-in fade-in duration-200">
            {/* 1. Summary & Verification */}
            <SummaryAlert result={splitResult} />

            {/* 2. Stats Table */}
            <StatsTable sessions={splitResult.sessions} numLists={numLists} />

            {/* 3. Global All Lists Toolbar */}
            <div id="results-section" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div>
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-500" />
                  Generated Output Lists ({splitResult.lists.length})
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Interleaved round-robin sequence with {keepBrackets ? 'square brackets preserved' : 'square brackets stripped'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search within lists */}
                <input
                  type="text"
                  placeholder="Filter lists (e.g. 1, 5)..."
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-400 w-44"
                />

                {/* Copy All Lists */}
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    copiedAll
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90'
                  }`}
                  title="Copy all lists separated by headers"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'All Copied!' : 'Copy All Lists'}</span>
                </button>

                {/* Download All */}
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Download single .txt file with all lists"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download All</span>
                </button>
              </div>
            </div>

            {/* 4. List Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedLists.map(({ tags, index }) => (
                <ListCard
                  key={index}
                  listIndex={index}
                  tags={tags}
                />
              ))}
            </div>

            {displayedLists.length === 0 && (
              <div className="p-8 text-center border border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-500 text-xs">
                No lists match filter "{listSearch}". Clear search to view all lists.
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div>
            <span>Tag Splitter</span>
            <span className="mx-2">·</span>
            <span>Client-side tag partitioning & interleaving engine</span>
          </div>
          <div>All operations run locally in browser memory</div>
        </div>
      </footer>

      {/* Documentation Modal */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
