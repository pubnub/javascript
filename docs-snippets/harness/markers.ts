/**
 * Snippet marker scanner. It mirrors the extractor the docs use (`src/helper/codeSnippetFetcher.ts` in the
 * documentation repo): `// snippet.<id>` starts a snippet, `// snippet.end` ends it, `// snippet.hide` and
 * `// snippet.show` toggle visibility, and any other start marker silently ends the snippet before it.
 * The scanner reports that last case as nesting.
 */

// Matches the same marker syntax as the docs extractor. Ids may contain `/` (one docs id does). `LOOSE_MARKER` catches near
// misses such as `//snippet.foo bar` or `// end.snippet`, which the extractor would silently ignore.
const MARKER = /^\s*\/\/\s*snippet\.([A-Za-z0-9_/-]+)\s*$/;
const LOOSE_MARKER = /^\s*\/\/\s*(?:snippet\.|end\.snippet)/;

export interface HiddenBlock {
  /** 1-based line of the `snippet.hide` marker. */
  hideLine: number;
  /** 1-based line of the `snippet.show` marker, or undefined when it is missing. */
  showLine?: number;
}

export interface SnippetRegion {
  id: string;
  /** 1-based line of the start marker. */
  startLine: number;
  /** 1-based line of the end marker, or the line that implicitly closed it. */
  endLine: number;
  explicitEnd: boolean;
  hidden: HiddenBlock[];
}

export interface MarkerProblem {
  line: number;
  message: string;
}

export interface ScanResult {
  regions: SnippetRegion[];
  problems: MarkerProblem[];
}

/**
 * One pass over a file. Returns every closed region plus problems (nesting, missing end, hide without show). Line numbers
 * are 1-based. Shared by the lint, the stage rewrite and the compare tool, so all three agree on what a snippet is.
 */
export function scanMarkers(text: string): ScanResult {
  const lines = text.split('\n');
  const regions: SnippetRegion[] = [];
  const problems: MarkerProblem[] = [];
  let open: SnippetRegion | undefined;
  let openHide: HiddenBlock | undefined;

  const close = (line: number, explicit: boolean): void => {
    if (!open) return;
    open.endLine = line;
    open.explicitEnd = explicit;
    if (openHide) {
      problems.push({ line: openHide.hideLine, message: `snippet.hide in "${open.id}" has no snippet.show` });
      openHide = undefined;
    }
    regions.push(open);
    open = undefined;
  };

  lines.forEach((raw, index) => {
    const line = index + 1;
    const match = raw.match(MARKER);
    if (!match) {
      if (LOOSE_MARKER.test(raw)) {
        problems.push({ line, message: `marker-like comment is not a valid marker: ${raw.trim()}` });
      }
      return;
    }
    const word = match[1];
    if (word === 'end') {
      if (!open) problems.push({ line, message: 'snippet.end without an open snippet' });
      else close(line, true);
    } else if (word === 'hide') {
      if (!open) problems.push({ line, message: 'snippet.hide outside a snippet' });
      else if (openHide) problems.push({ line, message: 'snippet.hide inside a hidden block' });
      else {
        openHide = { hideLine: line };
        open.hidden.push(openHide);
      }
    } else if (word === 'show') {
      if (!open || !openHide) problems.push({ line, message: 'snippet.show without a matching snippet.hide' });
      else {
        openHide.showLine = line;
        openHide = undefined;
      }
    } else {
      if (open) {
        problems.push({
          line,
          message: `snippet "${word}" starts inside snippet "${open.id}" (nesting silently truncates the outer snippet)`,
        });
        close(line, false);
      }
      open = { id: word, startLine: line, endLine: line, explicitEnd: false, hidden: [] };
    }
  });

  if (open) {
    const dangling: SnippetRegion = open;
    problems.push({ line: dangling.startLine, message: `snippet "${dangling.id}" has no snippet.end` });
    close(lines.length + 1, false);
  }
  return { regions, problems };
}

/** True when `line` (1-based) is a visible line inside `region`, not a marker and not hidden. */
export function isVisibleLine(region: SnippetRegion, line: number): boolean {
  if (line <= region.startLine || line >= region.endLine) return false;
  return !region.hidden.some((h) => line >= h.hideLine && line <= (h.showLine ?? region.endLine));
}

export function isInsideRegion(region: SnippetRegion, line: number): boolean {
  return line > region.startLine && line < region.endLine;
}
