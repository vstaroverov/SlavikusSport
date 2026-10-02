import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const source = JSON.parse(await read('design-system-v-star-group.tokens.source.json'));
function block(selector, values, scheme = '') {
  return `${selector} {\n${scheme ? `  color-scheme: ${scheme};\n` : ''}${Object.entries(values).map(([key, value]) => `  --vsg-${key}: ${value};`).join('\n')}\n}\n`;
}
const css = '/* GENERATED. Edit tokens.source.json, then run build-tokens.mjs. */\n'
  + block('.vsg', source.tokens, 'dark')
  + Object.entries(source.themes).map(([name, values]) => block(`.vsg[data-theme="${name}"]`, values, name)).join('')
  + Object.entries(source.densities).map(([name, values]) => block(`.vsg[data-density="${name}"]`, values)).join('');
const json = JSON.stringify({name:source.name, version:source.version, sourceCommit:source.sourceCommit, tokens:source.tokens, themes:source.themes, densities:source.densities}, null, 2) + '\n';
for (const [name, content] of [['design-system-v-star-group.tokens.css', css], ['design-system-v-star-group.tokens.json', json]]) {
  if (process.argv.includes('--check')) {
    if (await read(name) !== content) throw Error(`${name} is out of date`);
  } else await writeFile(new URL(name, root), content);
}
console.log(process.argv.includes('--check') ? 'Generated tokens are up to date.' : 'CSS and JSON generated from one source.');
