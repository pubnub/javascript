/**
 * Equivalence check of a ported page: extracts every snippet of the old file and of the new file and compares the text per id.
 * Every id must exist in both and be byte-identical. Exit code 0 when all match, 1 otherwise.
 *
 *   npx tsx test/integration/live/support/compare-snippets.ts <old file> <new file>
 *
 * It will grow into the marker lint.
 */
import fs from 'node:fs';
import { extractSnippets } from './snippets';

function main(): number {
  const [oldFile, newFile] = process.argv.slice(2);
  if (!oldFile || !newFile) {
    console.error('usage: compare-snippets.ts <old file> <new file>');
    return 2;
  }
  const before = extractSnippets(fs.readFileSync(oldFile, 'utf8'));
  const after = extractSnippets(fs.readFileSync(newFile, 'utf8'));
  let failures = 0;

  for (const [label, result] of [
    [oldFile, before],
    [newFile, after],
  ] as const) {
    for (const problem of result.problems) {
      failures += 1;
      console.log(`PROBLEM ${label}: ${problem}`);
    }
  }
  for (const id of new Set([...before.snippets.keys(), ...after.snippets.keys()])) {
    const a = before.snippets.get(id);
    const b = after.snippets.get(id);
    if (a === undefined) {
      failures += 1;
      console.log(`EXTRA    ${id}: only in the new file`);
    } else if (b === undefined) {
      failures += 1;
      console.log(`MISSING  ${id}: not in the new file`);
    } else if (a !== b) {
      failures += 1;
      console.log(`DIFFERS  ${id}\n--- old\n${a}\n--- new\n${b}`);
    } else {
      console.log(`SAME     ${id} (${Buffer.byteLength(a)} bytes)`);
    }
  }
  console.log(failures === 0 ? `OK: ${before.snippets.size} snippets identical` : `FAILED: ${failures} problem(s)`);
  return failures === 0 ? 0 : 1;
}

process.exitCode = main();
