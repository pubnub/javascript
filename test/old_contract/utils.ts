import fs from 'fs';

export function loadFixtureFile(persona: string) {
  const fileData = fs.readFileSync(
    `${process.cwd()}/dist/contract/contract/features/data/${persona.toLowerCase()}.json`,
    'utf8',
  );
  return JSON.parse(fileData);
}

export function getFilePath(filename) {
  return `${process.cwd()}/dist/contract/contract/features/encryption/assets/${filename}`;
}
