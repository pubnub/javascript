import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Scratch working directory for the file samples. They read and write `./cat_picture.jpg` relative to the working directory,
 * and the download sample overwrites it, so each test works on a temp copy of the fixture and the tracked file stays untouched.
 */
export const FIXTURE_FILE = path.join(__dirname, '..', 'fixtures', 'cat_picture.jpg');

export interface Workdir {
  dir: string;
  restore(): void;
}

/** Copies the fixture to a temp dir and `chdir`s into it. The caller must `restore()` (in a `finally`): the cwd is process-wide. */
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
