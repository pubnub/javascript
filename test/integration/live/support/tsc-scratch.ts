/**
 * Scratch TypeScript projects for docs pages that make claims about types and module resolution (the v8 migration guide, the
 * TypeScript setup page). A project lives in a temporary directory outside the repository with `node_modules/pubnub`
 * linked to this checkout, so `import ... from 'pubnub'` resolves the way it does for a reader who installed the package
 * (package.json `main` / `types`). Needs `npm run build:node` for `lib/types`.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/** Root of this checkout (the `pubnub` package). */
export const SDK_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const TSC = require.resolve('typescript/lib/tsc.js');

/** Creates a temporary directory whose `node_modules/pubnub` points at this checkout. The caller removes it. */
export function makeScratch(prefix = 'pn-live-'): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  fs.mkdirSync(path.join(dir, 'node_modules'));
  fs.symlinkSync(SDK_ROOT, path.join(dir, 'node_modules', 'pubnub'), 'dir');
  return dir;
}

export interface TscResult {
  ok: boolean;
  /** `tsc` output, one diagnostic per line. */
  output: string;
}

/**
 * Compiles small TypeScript files with the real `tsc` against the SDK types and returns the diagnostics. When `files` has a
 * `tsconfig.json`, it is used as it is. Otherwise a strict one that includes every `.ts` file is written, with
 * `compilerOptions` merged in.
 */
export function tscScratch(files: Record<string, string>, compilerOptions: Record<string, unknown> = {}): TscResult {
  const dir = makeScratch('pn-live-tsc-');
  try {
    for (const [name, content] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
      fs.writeFileSync(path.join(dir, name), content);
    }
    if (!('tsconfig.json' in files)) {
      fs.writeFileSync(
        path.join(dir, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'bundler',
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            skipLibCheck: true,
            types: [],
            ...compilerOptions,
          },
          include: Object.keys(files).filter((f) => /\.tsx?$/.test(f)),
        }),
      );
    }
    const run = spawnSync(process.execPath, [TSC, '-p', dir, '--noEmit'], { encoding: 'utf8' });
    return { ok: run.status === 0, output: `${run.stdout}${run.stderr}`.trim() };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
