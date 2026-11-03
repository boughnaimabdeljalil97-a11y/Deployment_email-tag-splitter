import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { SplitResult } from '../utils/tagSplitter';

interface SummaryAlertProps {
  result: SplitResult;
}

export const SummaryAlert: React.FC<SummaryAlertProps> = ({ result }) => {
  const { totalTagsIn, totalDuplicates, totalTagsOut, isValid, warnings, parseDurationMs } = result;

  return (
    <div className="space-y-4">
      {/* Session duplicate warnings if any */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Duplicate Sessions Detected ({warnings.length})
              </h3>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Sessions appearing in multiple columns or repeating tags were merged, keeping the first occurrence of each tag:
              </p>
              <ul className="mt-2 space-y-1 text-xs font-mono text-amber-800 dark:text-amber-300">
                {warnings.map((w, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Verification card: Total In, Duplicates, Total Out */}
      <div
        className={`border rounded-lg p-4 transition-colors ${
          isValid
            ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/60'
            : 'bg-rose-50/80 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/60'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isValid ? (
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-bold ${
                    isValid
                      ? 'text-emerald-900 dark:text-emerald-200'
                      : 'text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {isValid ? 'Verification Passed — Tag Integrity Verified' : 'Integrity Mismatch Detected'}
                </h3>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                  ({parseDurationMs} ms)
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  isValid
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-rose-700 dark:text-rose-300'
                }`}
              >
                {isValid
                  ? 'All input tags accounted for: Input tags minus duplicates strictly equals output partitioned tags.'
                  : 'Warning: Input count minus duplicates does not match final output count!'}
              </p>
            </div>
          </div>

          {/* Metric breakdown badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-2">
              <span className="text-neutral-500 font-sans">Total In</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {totalTagsIn.toLocaleString()}
              </span>
            </div>

            <span className="text-neutral-400 font-sans font-bold">−</span>

            <div className="px-3 py-1.5 rounded-md bg-white/80 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center gap-2">
              <span className="text-neutral-500 font-sans">Duplicates</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                {totalDuplicates.toLocaleString()}
              </span>
            </div>

            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />

            <div
              className={`px-3 py-1.5 rounded-md border shadow-xs flex items-center gap-2 font-bold ${
                isValid
                  ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                  : 'bg-rose-100/80 dark:bg-rose-900/40 text-rose-900 dark:text-rose-200 border-rose-300 dark:border-rose-700'
              }`}
            >
              <span className="font-sans font-normal">Total Out</span>
              <span className="tabular-nums">{totalTagsOut.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
