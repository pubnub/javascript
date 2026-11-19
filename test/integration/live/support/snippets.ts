/**
 * Snippet extraction with the rules of the docs extractor (the docs repo, `src/helper/codeSnippetFetcher.ts`):
 *
 *   // snippet.<id>   starts a snippet (ids may contain `/`)
 *   // snippet.end    ends it
 *   // snippet.hide   drops the lines up to `// snippet.show`
 *   // snippet.show
 *   another start marker silently ends the open snippet (reported here as a problem, never relied on)
 *
 * The extracted lines lose their common indentation. The marker lines themselves are not part of the text.
 */
const MARKER = /^\s*\/\/\s*snippet\.([A-Za-z0-9_/-]+)\s*$/;
const LOOSE_MARKER = /^\s*\/\/\s*(?:snippet\.|end\.snippet)/;

export interface ExtractResult {
  /** Extracted text per snippet id. */
  snippets: Map<string, string>;
  /** Marker problems: nesting, a missing end, a hide without show, a repeated id, a malformed marker. */
  problems: string[];
}

function unindent(lines: string[]): string {
  const indents = lines.filter((l) => l.trim() !== '').map((l) => /^[ \t]*/.exec(l)![0].length);
  const common = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(Math.min(common, /^[ \t]*/.exec(l)![0].length))).join('\n');
}

export function extractSnippets(text: string): ExtractResult {
  const snippets = new Map<string, string>();
  const problems: string[] = [];
  let id: string | undefined;
  let startLine = 0;
  let hidden = false;
  let body: string[] = [];

  const close = (): void => {
    if (id === undefined) return;
    if (hidden) problems.push(`line ${startLine}: snippet.hide in "${id}" has no snippet.show`);
    if (snippets.has(id)) problems.push(`line ${startLine}: snippet id "${id}" is used twice`);
    snippets.set(id, unindent(body));
    id = undefined;
    hidden = false;
    body = [];
  };

  text.split('\n').forEach((raw, index) => {
    const line = index + 1;
    const word = MARKER.exec(raw)?.[1];
    if (word === undefined) {
      if (LOOSE_MARKER.test(raw))
        problems.push(`line ${line}: marker-like comment is not a valid marker: ${raw.trim()}`);
      else if (id !== undefined && !hidden) body.push(raw);
      return;
    }
    if (word === 'end') {
      if (id === undefined) problems.push(`line ${line}: snippet.end without an open snippet`);
      else close();
    } else if (word === 'hide') {
      if (id === undefined) problems.push(`line ${line}: snippet.hide outside a snippet`);
      else if (hidden) problems.push(`line ${line}: snippet.hide inside a hidden block`);
      else hidden = true;
    } else if (word === 'show') {
      if (id === undefined || !hidden) problems.push(`line ${line}: snippet.show without a matching snippet.hide`);
      else hidden = false;
    } else {
      if (id !== undefined) {
        problems.push(`line ${line}: snippet "${word}" starts inside snippet "${id}" (the outer snippet is cut short)`);
        close();
      }
      id = word;
      startLine = line;
    }
  });
  if (id !== undefined) {
    problems.push(`line ${startLine}: snippet "${id}" has no snippet.end`);
    close();
  }
  return { snippets, problems };
}

/**
 * Faithful port of `extractSnippets` of the docs repo (src/helper/codeSnippetFetcher.ts) for the default prefix list. The
 * docs component shows exactly this text for `snippets={[id]}`. Differences from `extractSnippets` above, kept on purpose:
 *
 *   - the start marker must be `// ` (slash slash SPACE) and then the literal id, so `//snippet.x` is invisible to the docs;
 *   - only the first start marker of the id counts, the explicit end is `// snippet.end`, and another marker whose id matches
 *     `[a-zA-Z0-9_-]+` ends the snippet implicitly (a marker with `/` in its id does NOT, it stays in the text);
 *   - whitespace-only lines keep their whitespace when the common indentation is removed;
 *   - no start marker, or nothing between the markers, means "not found" (returns undefined).
 */
export function docsExtract(content: string, snippetId: string): string | undefined {
  const lines = content.split('\n');
  const escaped = snippetId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const start = new RegExp(`^\\s*// \\s*snippet\\.${escaped}\\s*$`);
  const end = /^\s*\/\/ \s*snippet\.end\s*$/;
  const anyMarker = /^\s*\/\/ \s*snippet\.([a-zA-Z0-9_-]+)\s*$/;
  const hide = /^\s*\/\/ \s*snippet\.hide\s*$/;
  const show = /^\s*\/\/ \s*snippet\.show\s*$/;
  const blueprint = /^\s*\/\/ \s*blueprint\.[a-zA-Z0-9_-]+\s*$/;
  const first = lines.findIndex((l) => start.test(l));
  if (first === -1) return undefined;
  let stop = lines.length;
  for (let i = first + 1; i < lines.length; i++) {
    if (end.test(lines[i])) {
      stop = i;
      break;
    }
    const match = anyMarker.exec(lines[i]);
    if (match && match[1] !== 'hide' && match[1] !== 'show' && match[1] !== snippetId) {
      stop = i;
      break;
    }
  }
  const kept: string[] = [];
  let hidden = false;
  for (const line of lines.slice(first + 1, stop)) {
    if (hide.test(line)) hidden = true;
    else if (show.test(line)) hidden = false;
    else if (!blueprint.test(line) && !hidden) kept.push(line);
  }
  if (kept.length === 0) return undefined;
  let min = Infinity;
  for (const line of kept) if (line.trim().length > 0) min = Math.min(min, line.search(/\S/));
  if (min === Infinity || min === 0) return kept.join('\n');
  return kept.map((line) => (line.trim().length === 0 ? line : line.substring(min))).join('\n');
}
