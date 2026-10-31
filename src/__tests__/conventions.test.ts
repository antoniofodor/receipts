/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';

const SRC = path.join(__dirname, '..');

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry: fs.Dirent) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
}

const relative = (file: string) => path.relative(SRC, file).replaceAll('\\', '/');
const isTest = (file: string) => relative(file).includes('__tests__/');
const read = (file: string) => fs.readFileSync(file, 'utf8');
const appFiles = sourceFiles(SRC).filter((file) => !isTest(file));

describe('codebase conventions (see CLAUDE.md)', () => {
  it('every route screen uses <Screen> as its container', () => {
    const routeScreens = appFiles.filter(
      (file) => relative(file).startsWith('app/') && path.basename(file) !== '_layout.tsx',
    );
    const missing = routeScreens.filter((file) => !read(file).includes('<Screen'));
    expect(missing.map(relative)).toEqual([]);
  });

  it('only src/api talks to Supabase', () => {
    const offenders = appFiles.filter(
      (file) => !relative(file).startsWith('api/') && /@supabase\/supabase-js|@\/api\/supabase-client/.test(read(file)),
    );
    expect(offenders.map(relative)).toEqual([]);
  });

  it('colors come from the theme, not hex literals', () => {
    const offenders = appFiles.filter(
      (file) => relative(file) !== 'constants/theme.ts' && /['"]#[0-9a-fA-F]{3,8}['"]/.test(read(file)),
    );
    expect(offenders.map(relative)).toEqual([]);
  });

  it('writes never wait for a refetch before the screen responds', () => {
    const offenders = appFiles.filter((file) => /await invalidate\(/.test(read(file)));
    expect(offenders.map(relative)).toEqual([]);
  });

  it('no test files live inside src/app, where expo-router would treat them as routes', () => {
    const testsInApp = sourceFiles(path.join(SRC, 'app')).filter((file) => /test/.test(path.basename(file)) || isTest(file));
    expect(testsInApp.map(relative)).toEqual([]);
  });
});
