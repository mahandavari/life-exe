import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const output = path.resolve('dist-pages');
const html = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
const localAssets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((url) => !/^(?:https?:|data:|#)/.test(url));
assert.ok(localAssets.some((url) => url.endsWith('.js')), 'JavaScript entry is missing');
assert.ok(localAssets.some((url) => url.endsWith('.css')), 'Stylesheet is missing');
for (const url of localAssets) {
  assert.ok(url.startsWith('/life-exe/'), `Asset escapes the repository subpath: ${url}`);
  assert.ok(fs.existsSync(path.join(output, url.slice('/life-exe/'.length))), `Asset is missing: ${url}`);
}
const files = fs.readdirSync(path.join(output, 'assets'));
assert.ok(files.some((name) => /^three\.module-.*\.js$/.test(name)), 'Lazy Three.js asset is missing');
for (const name of files) {
  if (!/\.(?:js|css)$/.test(name)) continue;
  const text = fs.readFileSync(path.join(output, 'assets', name), 'utf8');
  assert.ok(!/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/.test(text), `Local URL in ${name}`);
  assert.ok(!/sourceMappingURL=/.test(text), `Public source map reference in ${name}`);
}
console.log(`Verified ${localAssets.length} entry assets, lazy 3D bundle, and /life-exe/ base path.`);
