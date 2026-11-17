import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cp, mkdir, rm, writeFile, readFile, readdir } from 'node:fs/promises';
await rm(new URL('../docs/', import.meta.url), { recursive: true, force: true });
await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
await cp(new URL('../dist/', import.meta.url), new URL('../docs/', import.meta.url), { recursive: true });
await writeFile(new URL('../docs/.nojekyll', import.meta.url), '');
// Fingerprint local scripts/styles so browsers retrieve the deployed version.
async function versionAssets(folder){for(const entry of await readdir(folder,{withFileTypes:true})){const path=resolve(folder,entry.name);if(entry.isDirectory())await versionAssets(path);else if(entry.name.endsWith('.html')){let html=await readFile(path,'utf8');const matches=[...html.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))"/g)];for(const match of matches){if(/^https?:/.test(match[1]))continue;const asset=resolve(dirname(path),match[1]);const hash=createHash('sha256').update(await readFile(asset)).digest('hex').slice(0,12);html=html.replaceAll('"'+match[1]+'"','"'+match[1]+'?v='+hash+'"')}await writeFile(path,html)}}}
await versionAssets(fileURLToPath(new URL('../docs/',import.meta.url)));
console.log('Prepared docs/ for GitHub Pages.');

// Also support Pages publishing the repository root.
const home = await readFile(new URL('../docs/index.html', import.meta.url), 'utf8');
await writeFile(new URL('../index.html', import.meta.url), home.replace('<head>', '<head><base href="./docs/">'));
await writeFile(new URL('../.nojekyll', import.meta.url), '');
const domain = await readFile(new URL('../dist/CNAME', import.meta.url), 'utf8');
await writeFile(new URL('../CNAME', import.meta.url), domain);
