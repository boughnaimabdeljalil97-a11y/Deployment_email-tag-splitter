import React from 'react';
import { X, BookOpen, Layers, CheckCircle2, Split } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-neutral-800 dark:text-neutral-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neutral-900 dark:text-white" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              Tag Splitter Documentation
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-6 text-sm">
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs">1</span>
              Input Format & Global Regex Parsing
            </h3>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
              Pasted text is parsed using a global regex <code className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-[11px]">/(\S+)\s+(\d+)\s+(\[[0-9A-Fa-f]+\])/g</code> across the entire text buffer. Extra web table headers like <code className="font-mono text-[11px]">"List Profile Tag"</code>, tabs, or blank lines are safely skipped.
            </p>
            <div className="mt-2 p-2.5 rounded bg-neutral-100 dark:bg-neutral-800/80 font-mono text-xs text-neutral-700 dark:text-neutral-300">
              CMH15_IT_1 1 [986459E6F11FD45A] CMH15_IT_2 1 [B1A880B2919BA89A]
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs">2</span>
              Session Grouping & Duplicate Handling
            </h3>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
              Tags are grouped by session name, maintaining the order of first appearance. If a session re-appears in multiple columns, entries are merged into one session and duplicate tags are stripped, retaining the very first occurrence.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs">3</span>
              Splitting Rule (Per Session, Independently)
            </h3>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
              For a session with <code className="font-mono text-[11px]">T</code> tags and <code className="font-mono text-[11px]">N</code> lists:
            </p>
            <div className="mt-2 p-3 rounded bg-neutral-100 dark:bg-neutral-800/80 font-mono text-xs space-y-1">
              <div>base = floor(T / N)</div>
              <div>remainder = T mod N</div>
              <div className="text-neutral-500 dark:text-neutral-400">
                • Lists 1 to remainder receive (base + 1) tags
              </div>
              <div className="text-neutral-500 dark:text-neutral-400">
                • Lists (remainder + 1) to N receive base tags
              </div>
              <div className="text-neutral-500 dark:text-neutral-400">
                • Tags are distributed in contiguous sequential blocks
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs">4</span>
              Interleaving Inside Each List (Round-Robin)
            </h3>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
              For every final list, its tags are interleaved across sessions:
            </p>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Tag 1 of Session 1's block → Tag 1 of Session 2's block → ... → Tag 2 of Session 1 → Tag 2 of Session 2, until complete. If a session block runs out of tags, it is skipped while remaining sessions continue.
            </p>
          </div>

          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
