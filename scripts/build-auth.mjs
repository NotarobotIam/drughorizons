import { build } from 'esbuild';
await build({entryPoints:['src/account.js'],bundle:true,outfile:'dist/account-client.js',format:'iife',platform:'browser',target:['es2020'],minify:true,legalComments:'eof'});
