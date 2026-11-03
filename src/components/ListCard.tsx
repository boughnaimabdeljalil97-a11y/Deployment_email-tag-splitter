import React, { useState } from 'react';
import { Copy, Check, Download, Search, Maximize2, Minimize2 } from 'lucide-react';
import { copyToClipboard, downloadTextFile } from '../utils/fileHelpers';

interface ListCardProps {
  listIndex: number;
  tags: string[];
}

export const ListCard: React.FC<ListCardProps> = ({ listIndex, tags }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const listNumber = listIndex + 1;
  const rawTextContent = tags.join('\n');

  // Filter tags if searching
  const filteredTags = searchQuery.trim()
    ? tags.filter((t) => t.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : tags;

  const handleCopy = async () => {
    const success = await copyToClipboard(rawTextContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadTextFile(`list_${listNumber}.txt`, rawTextContent);
  };

  return (
    <div
      className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col transition-all duration-200 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700 ${
        isExpanded ? 'col-span-full md:row-span-2' : ''
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            List {listNumber}
          </span>
          <span className="text-xs font-mono tabular-nums text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
            {tags.length.toLocaleString()} tags
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className={`p-1.5 text-xs rounded transition-colors flex items-center gap-1 ${
              copied
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Copy list to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-medium hidden sm:inline">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors flex items-center gap-1"
            title="Download list as .txt file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium hidden sm:inline">.txt</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-xs text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Optional search bar if list has tags */}
      {tags.length > 5 && (
        <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 flex items-center gap-2">
          <Search className="w-3 h-3 text-neutral-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags in list..."
            className="w-full text-[11px] bg-transparent text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none"
          />
          {searchQuery && (
            <span className="text-[10px] font-mono text-neutral-400 shrink-0">
              {filteredTags.length}/{tags.length}
            </span>
          )}
        </div>
      )}

      {/* Scrollable box with one tag per line */}
      <div className="relative flex-1 p-2">
        {searchQuery.trim() ? (
          <textarea
            readOnly
            spellCheck={false}
            value={filteredTags.join('\n')}
            rows={isExpanded ? 24 : 12}
            className="w-full font-mono text-xs leading-relaxed p-2 rounded bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-800 resize-none focus:outline-none focus:ring-1 focus:ring-neutral-400 select-all"
          />
        ) : (
          <textarea
            readOnly
            spellCheck={false}
            value={rawTextContent}
            rows={isExpanded ? 24 : 12}
            className="w-full font-mono text-xs leading-relaxed p-2 rounded bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-800 resize-none focus:outline-none focus:ring-1 focus:ring-neutral-400 select-all"
          />
        )}
      </div>

      {/* Footer info */}
      <div className="px-3 py-1.5 border-t border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-950/30 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
        <span>Contiguous round-robin</span>
        <span className="font-mono tabular-nums">
          {tags.length > 0 ? `1 – ${tags.length}` : 'Empty'}
        </span>
      </div>
    </div>
  );
};
