import { build } from 'esbuild';
await build({entryPoints:['src/account.js'],bundle:true,outfile:'dist/account-client.js',format:'iife',platform:'browser',target:['es2020'],minify:true,legalComments:'eof'});

await build({entryPoints:['src/body-map.js'],bundle:true,outfile:'dist/body-map.js',format:'iife',platform:'browser',target:['es2020'],minify:true,legalComments:'eof'});
