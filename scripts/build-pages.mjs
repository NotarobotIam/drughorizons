import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
await rm(new URL('../docs/', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
await cp(new URL('../dist/', import.meta.url), new URL('../docs/', import.meta.url), { recursive: true });
await writeFile(new URL('../docs/.nojekyll', import.meta.url), '');
console.log('Prepared docs/ for GitHub Pages.');

// Also support Pages publishing the repository root.
const home = await readFile(new URL('../docs/index.html', import.meta.url), 'utf8');
await writeFile(new URL('../index.html', import.meta.url), home.replace('<head>', '<head><base href="./docs/">'));
await writeFile(new URL('../.nojekyll', import.meta.url), '');
const domain = await readFile(new URL('../dist/CNAME', import.meta.url), 'utf8');
await writeFile(new URL('../CNAME', import.meta.url), domain);
