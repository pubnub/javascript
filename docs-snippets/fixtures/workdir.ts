import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Scratch directory for the file sharing samples. They read and write `./cat_picture.jpg` relative to the
 * working directory, and `downloadFileNodeBasicUsage` overwrites it. The step changes into a temp directory that
 * holds a copy of the fixture, so the tracked fixture stays untouched.
 */
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const FIXTURE_FILE = path.join(HERE, 'files', 'cat_picture.jpg');

export interface Workdir {
  dir: string;
  restore(): void;
}

/** Copies the fixture to a temp dir and `chdir`s into it. The caller must `restore()` (in a `finally`), it is process-wide state. */
export function enterWorkdir(): Workdir {
  const previous = process.cwd();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pn-docs-files-'));
  fs.copyFileSync(FIXTURE_FILE, path.join(dir, 'cat_picture.jpg'));
  process.chdir(dir);
  return {
    dir,
    restore() {
      process.chdir(previous);
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}
