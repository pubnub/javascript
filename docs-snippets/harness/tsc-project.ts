import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Compiles small TypeScript files with the real `tsc` against the installed SDK types and returns the diagnostics.
 * Used by the type-check-only modules (migration guide imports). The scratch directory sits below the staged suite so
 * that `pubnub` and the type packages resolve from the suite's `node_modules`.
 */
const TSC = path.resolve(path.dirname(fileURLToPath(import.meta.resolve('typescript'))), 'tsc.js');

export interface TscResult {
  ok: boolean;
  /** `tsc` output, one diagnostic per line. */
  output: string;
}

export function tscProject(parent: string, files: Record<string, string>, compilerOptions: Record<string, unknown> = {}): TscResult {
  const dir = fs.mkdtempSync(path.join(parent, '.tsc-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
      fs.writeFileSync(path.join(dir, name), content);
    }
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
    const run = spawnSync(process.execPath, [TSC, '-p', dir], { encoding: 'utf8' });
    return { ok: run.status === 0, output: `${run.stdout}${run.stderr}`.trim() };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
