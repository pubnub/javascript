import fs from 'fs';

export function loadFixtureFile(persona) {
  const fileData = fs.readFileSync(
    `${process.cwd()}/dist/contract/contract/features/data/${persona.toLowerCase()}.json`,
    'utf8',
  );
  return JSON.parse(fileData);
}
