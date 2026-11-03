import React, { useState } from 'react';
import { SessionData } from '../utils/tagSplitter';
import { ArrowUpDown, Layers, AlertCircle } from 'lucide-react';

interface StatsTableProps {
  sessions: SessionData[];
  numLists: number;
}

type SortField = 'order' | 'name' | 'totalTags' | 'base' | 'remainder' | 'duplicates';

export const StatsTable: React.FC<StatsTableProps> = ({ sessions, numLists }) => {
  const [sortField, setSortField] = useState<SortField>('order');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  if (sessions.length === 0) {
    return null;
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'order') {
      comparison = 0; // maintain original appearance order
    } else if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name, undefined, { numeric: true });
    } else if (sortField === 'totalTags') {
      comparison = a.totalTags - b.totalTags;
    } else if (sortField === 'base') {
      comparison = a.base - b.base;
    } else if (sortField === 'remainder') {
      comparison = a.remainder - b.remainder;
    } else if (sortField === 'duplicates') {
      comparison = a.duplicateCount - b.duplicateCount;
    }
    return sortAsc ? comparison : -comparison;
  });

  const totalUniqueTags = sessions.reduce((acc, s) => acc + s.totalTags, 0);
  const totalDuplicates = sessions.reduce((acc, s) => acc + s.duplicateCount, 0);

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden transition-colors">
      <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-neutral-500" />
            Session Statistics
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Breakdown across {sessions.length} sessions partitioned into {numLists} target lists
          </p>
        </div>
        <div className="text-xs text-neutral-500 dark:text-neutral-400">
          Showing original appearance order
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 font-medium border-b border-neutral-200 dark:border-neutral-800">
              <th className="py-2.5 px-4 text-left">
                <button
                  type="button"
                  onClick={() => handleSort('order')}
                  className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                >
                  <span>#</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              </th>
              <th className="py-2.5 px-4 text-left">
                <button
                  type="button"
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white"
                >
                  <span>Session Name</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              </th>
              <th className="py-2.5 px-4 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('totalTags')}
                  className="flex items-center justify-end gap-1 w-full hover:text-neutral-900 dark:hover:text-white"
                >
                  <span>Total Tags (T)</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              </th>
              <th className="py-2.5 px-4 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('base')}
                  className="flex items-center justify-end gap-1 w-full hover:text-neutral-900 dark:hover:text-white"
                >
                  <span>Base (floor T/{numLists})</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              </th>
              <th className="py-2.5 px-4 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('remainder')}
                  className="flex items-center justify-end gap-1 w-full hover:text-neutral-900 dark:hover:text-white"
                >
                  <span>Remainder (T % {numLists})</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              </th>
              <th className="py-2.5 px-4 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('duplicates')}
                  className="flex items-center justify-end gap-1 w-full hover:text-neutral-900 dark:hover:text-white"
                >
                  <span>Duplicates Removed</span>
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                </button>
              </th>
              <th className="py-2.5 px-4 text-left">List Allocation Rule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-mono">
            {sortedSessions.map((session, index) => {
              const hasRemainder = session.remainder > 0;
              return (
                <tr
                  key={session.name}
                  className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <td className="py-2.5 px-4 text-neutral-400 dark:text-neutral-500 tabular-nums">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100 font-sans">
                    {session.name}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                    {session.totalTags.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right text-neutral-700 dark:text-neutral-300 tabular-nums">
                    {session.base.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums">
                    {hasRemainder ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {session.remainder}
                      </span>
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-500">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums">
                    {session.duplicateCount > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium inline-flex items-center gap-1 justify-end">
                        <AlertCircle className="w-3 h-3" />
                        {session.duplicateCount}
                      </span>
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-500">0</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-neutral-600 dark:text-neutral-400 font-sans text-xs">
                    {hasRemainder ? (
                      <span>
                        Lists 1–{session.remainder} get{' '}
                        <strong className="text-neutral-900 dark:text-neutral-200">{session.base + 1}</strong>,
                        {session.remainder < numLists ? (
                          <> Lists {session.remainder + 1}–{numLists} get{' '}
                          <strong className="text-neutral-900 dark:text-neutral-200">{session.base}</strong></>
                        ) : null}
                      </span>
                    ) : (
                      <span>
                        All {numLists} lists get{' '}
                        <strong className="text-neutral-900 dark:text-neutral-200">{session.base}</strong> tags
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-100/70 dark:bg-neutral-800/80 font-semibold text-neutral-900 dark:text-neutral-100 border-t border-neutral-200 dark:border-neutral-700">
              <td className="py-2.5 px-4 font-sans text-xs" colSpan={2}>
                Total ({sessions.length} sessions)
              </td>
              <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                {totalUniqueTags.toLocaleString()}
              </td>
              <td className="py-2.5 px-4 text-right font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                —
              </td>
              <td className="py-2.5 px-4 text-right font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                —
              </td>
              <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                {totalDuplicates > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400">{totalDuplicates}</span>
                ) : (
                  '0'
                )}
              </td>
              <td className="py-2.5 px-4 font-sans text-xs text-neutral-500 dark:text-neutral-400">
                Distributed across {numLists} lists
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
