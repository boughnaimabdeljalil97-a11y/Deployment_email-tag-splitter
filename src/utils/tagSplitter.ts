/**
 * Tag Splitter Core Logic
 * Handles global regex parsing, duplicate removal, block partitioning, and round-robin interleaving.
 */

export interface SessionData {
  name: string;
  totalTags: number;
  duplicateCount: number;
  tags: string[]; // unique tags in order of first appearance
  base: number;
  remainder: number;
  timesAppeared: number;
}

export interface SplitResult {
  sessions: SessionData[];
  lists: string[][]; // lists[listIndex] = array of tag strings
  totalTagsIn: number;
  totalDuplicates: number;
  totalTagsOut: number;
  isValid: boolean;
  warnings: string[];
  parseDurationMs: number;
}

export function formatTag(tag: string, keepBrackets: boolean): string {
  if (keepBrackets) {
    return tag;
  }
  // Remove outer [ and ] if present
  if (tag.startsWith('[') && tag.endsWith(']')) {
    return tag.slice(1, -1);
  }
  return tag;
}

/**
 * Parses raw text and splits tags across N lists with per-session partitioning and interleaving.
 */
export function parseAndSplitTags(
  rawText: string,
  numLists: number,
  keepBrackets: boolean = true
): SplitResult {
  const startTime = performance.now();

  const safeNumLists = Math.max(1, Math.floor(numLists || 20));

  // Global regex over the whole text (do not parse line by line)
  // Matching: (\S+)\s+(\d+)\s+(\[[0-9A-Fa-f]+\])
  const regex = /(\S+)\s+(\d+)\s+(\[[0-9A-Fa-f]+\])/g;

  let totalTagsIn = 0;
  const sessionOrder: string[] = [];
  const sessionMap = new Map<
    string,
    {
      name: string;
      rawCount: number;
      duplicateCount: number;
      seenTags: Set<string>;
      uniqueTags: string[];
      profile1Count: number;
    }
  >();

  let match: RegExpExecArray | null;
  while ((match = regex.exec(rawText)) !== null) {
    totalTagsIn++;
    const sessionName = match[1];
    const profileNum = parseInt(match[2], 10);
    const tag = match[3];

    let session = sessionMap.get(sessionName);
    if (!session) {
      session = {
        name: sessionName,
        rawCount: 0,
        duplicateCount: 0,
        seenTags: new Set<string>(),
        uniqueTags: [],
        profile1Count: 0,
      };
      sessionMap.set(sessionName, session);
      sessionOrder.push(sessionName);
    }

    session.rawCount++;
    if (profileNum === 1) {
      session.profile1Count++;
    }

    if (session.seenTags.has(tag)) {
      session.duplicateCount++;
    } else {
      session.seenTags.add(tag);
      session.uniqueTags.push(tag);
    }
  }

  // Build sessions data and warnings
  const sessions: SessionData[] = [];
  const warnings: string[] = [];
  let totalDuplicates = 0;

  for (const sessionName of sessionOrder) {
    const s = sessionMap.get(sessionName)!;
    totalDuplicates += s.duplicateCount;

    const T = s.uniqueTags.length;
    const base = Math.floor(T / safeNumLists);
    const remainder = T % safeNumLists;

    // Determine how many times the session appeared
    // If profile 1 occurred multiple times, or raw count is multiple of unique
    let timesAppeared = s.profile1Count > 1 ? s.profile1Count : 1;
    if (timesAppeared === 1 && s.duplicateCount > 0) {
      timesAppeared = Math.max(2, Math.ceil(s.rawCount / Math.max(1, s.uniqueTags.length)));
    }

    if (s.duplicateCount > 0) {
      warnings.push(
        `Session ${s.name} appeared ${timesAppeared} times, duplicates removed (${s.duplicateCount} tag${s.duplicateCount > 1 ? 's' : ''})`
      );
    }

    sessions.push({
      name: s.name,
      totalTags: T,
      duplicateCount: s.duplicateCount,
      tags: s.uniqueTags,
      base,
      remainder,
      timesAppeared,
    });
  }

  // Splitting rule (per session, independently):
  // For each session:
  // List 1..remainder get base + 1 tags, others get base tags.
  // Contiguous blocks in order.
  const sessionBlocks: string[][][] = []; // sessionBlocks[sessionIdx][listIdx] = tags
  for (let sIdx = 0; sIdx < sessions.length; sIdx++) {
    const session = sessions[sIdx];
    const blocks: string[][] = [];
    let offset = 0;

    for (let listIdx = 0; listIdx < safeNumLists; listIdx++) {
      const blockSize = listIdx < session.remainder ? session.base + 1 : session.base;
      const blockTags = session.tags.slice(offset, offset + blockSize);
      blocks.push(blockTags);
      offset += blockSize;
    }
    sessionBlocks.push(blocks);
  }

  // Final order inside each list (round-robin across sessions)
  // For each list, interleave blocks received from all sessions:
  // 1st tag of Session 1's block, 1st tag of Session 2's block, ...
  // then 2nd tag of Session 1, 2nd tag of Session 2...
  const lists: string[][] = [];
  let totalTagsOut = 0;

  for (let listIdx = 0; listIdx < safeNumLists; listIdx++) {
    const listTags: string[] = [];

    // Find the max block length for this list across all sessions
    let maxBlockLen = 0;
    for (let sIdx = 0; sIdx < sessions.length; sIdx++) {
      if (sessionBlocks[sIdx][listIdx].length > maxBlockLen) {
        maxBlockLen = sessionBlocks[sIdx][listIdx].length;
      }
    }

    // Interleave
    for (let step = 0; step < maxBlockLen; step++) {
      for (let sIdx = 0; sIdx < sessions.length; sIdx++) {
        const block = sessionBlocks[sIdx][listIdx];
        if (step < block.length) {
          const rawTag = block[step];
          listTags.push(formatTag(rawTag, keepBrackets));
        }
      }
    }

    lists.push(listTags);
    totalTagsOut += listTags.length;
  }

  const isValid = totalTagsIn - totalDuplicates === totalTagsOut;
  const parseDurationMs = Math.round((performance.now() - startTime) * 10) / 10;

  return {
    sessions,
    lists,
    totalTagsIn,
    totalDuplicates,
    totalTagsOut,
    isValid,
    warnings,
    parseDurationMs,
  };
}

/**
 * Creates formatted all-lists string with '=== List X ===' separators.
 */
export function formatAllListsText(lists: string[][]): string {
  const parts: string[] = [];
  for (let i = 0; i < lists.length; i++) {
    parts.push(`=== List ${i + 1} ===\n${lists[i].join('\n')}`);
  }
  return parts.join('\n\n');
}

/**
 * Generates sample data with multiple sessions, multi-column headers, and deliberate duplicate session columns.
 */
export function generateSampleData(): string {
  // We'll generate realistic web table paste data
  // Columns: List Profile Tag repeated
  const hex = [
    '986459E6F11FD45A', 'B1A880B2919BA89A', 'FAF836E2AEF15C87', '53295FAEF049A1E5',
    '7C31DA58C4F817B2', '4A089DEB59814421', '8E104523AA82194C', '2F4981C09EBA1518',
    'A10248DF8943BC10', 'E4582910CB8471FA', '319084AFED814529', '6D7821B594CA0128',
    'B24908EFA15462D3', 'F5401829BCA98451', '19582A0984EFCBA1', '840192EBFAC8145D',
    'C4809182ABEF4120', '59018428AEFB4192', 'D1948201ABFC8491', '78194028BCAFE019',
    '901824ABFE819234', 'A481920BCE814912', '48192048AEFBC019', '81924081ABCF9284',
    'F0182490ABCE8149', 'C1849208ABFE9182', '51928401ABCF4918', '29481028BCAE9182',
    'E1928401ABCE8149', '61829408ABFE4192', 'B0192840ABCF9182', '41928401BCAE8192',
  ];

  let output = 'List\tProfile\tTag\tList\tProfile\tTag\tList\tProfile\tTag\n';

  // Row by row 3 columns side by side:
  // Session 1: CMH15_IT_1
  // Session 2: CMH15_IT_2
  // Session 3: CMH15_IT_3
  for (let i = 1; i <= 24; i++) {
    const t1 = `[${hex[(i * 3 + 1) % hex.length]}]`;
    const t2 = `[${hex[(i * 5 + 3) % hex.length]}]`;
    const t3 = `[${hex[(i * 7 + 5) % hex.length]}]`;
    output += `CMH15_IT_1\t${i}\t${t1}\tCMH15_IT_2\t${i}\t${t2}\tCMH15_IT_3\t${i}\t${t3}\n`;
  }

  output += '\nList\tProfile\tTag\tList\tProfile\tTag\n';

  // Another set of columns:
  // Session 4: CMH15_IT_4
  // Session 5: CMH15_IT_5
  // Session 6: CMH15_IT_6 (part 1)
  for (let i = 1; i <= 18; i++) {
    const t4 = `[${hex[(i * 11 + 2) % hex.length]}]`;
    const t5 = `[${hex[(i * 13 + 4) % hex.length]}]`;
    output += `CMH15_IT_4\t${i}\t${t4}\tCMH15_IT_5\t${i}\t${t5}\n`;
  }

  // Session 6 with duplicate column to test warning: "Session CMH15_IT_6 appeared 2 times, duplicates removed (X tags)"
  output += '\nList\tProfile\tTag\tList\tProfile\tTag\n';
  for (let i = 1; i <= 10; i++) {
    const t6 = `[${hex[(i * 2 + 7) % hex.length]}]`;
    // In column 2, repeat CMH15_IT_6 with duplicate tags
    output += `CMH15_IT_6\t${i}\t${t6}\tCMH15_IT_6\t${i}\t${t6}\n`;
  }

  return output;
}
