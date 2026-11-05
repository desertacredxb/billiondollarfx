const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { readFileSync } = require('node:fs');
const Module = require('node:module');
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const api = require('../src/app/lib/blogApi.ts');
const publishing = require('../src/app/lib/blogPublishing.ts');
const originalRequire = Module.prototype.require;
Module.prototype.require = function (name) {
  if (name === '@/app/lib/blogApi') return api;
  if (name === '@/app/lib/blogPublishing') return publishing;
  return originalRequire.apply(this, arguments);
};
const sitemap = require('../src/app/sitemap.ts');
Module.prototype.require = originalRequire;
if (previous) require.extensions['.ts'] = previous; else delete require.extensions['.ts'];

test('ordinary article lists retain caching while discovery can explicitly request fresh publications', async t => {
  const previousFetch = global.fetch, calls = [];
  t.after(() => { global.fetch = previousFetch; });
  global.fetch = async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ data: [], pages: 1 }) }; };
  await api.publishedBlogs();
  await api.publishedBlogs({ page: '2' }, { fresh: true });
  assert.equal(calls[0].options.next.revalidate, 60);
  assert.equal(calls[1].options.cache, 'no-store');
  assert.equal(calls[1].options.next, undefined);
  assert.equal(new URL(calls[1].url).searchParams.get('page'), '2');
});

test('a newly published guide appears on the next sitemap request with fresh pagination and canonical filtering', async t => {
  const previousFetch = global.fetch, calls = [];
  t.after(() => { global.fetch = previousFetch; });
  let latest = false;
  global.fetch = async (url, options) => {
    calls.push(options);
    const page = new URL(url).searchParams.get('page') || '1';
    const data = page === '1' ? [{ slug: 'first-guide' }] : [{ slug: 'second-guide' }, { slug: 'external', canonicalUrl: 'https://example.invalid/original' }, ...(latest ? [{ slug: 'new-weekly-guide' }] : [])];
    return { ok: true, json: async () => ({ data, pages: 2 }) };
  };
  const before = await sitemap.default();
  latest = true;
  const after = await sitemap.default();
  assert.equal(before.some(r => r.url.endsWith('/new-weekly-guide')), false);
  assert.ok(after.some(r => r.url.endsWith('/new-weekly-guide')));
  assert.ok(after.some(r => r.url.endsWith('/second-guide')));
  assert.equal(after.some(r => r.url.endsWith('/external')), false);
  assert.ok(after.some(r => r.url.endsWith('/learn/india/hi')));
  assert.ok(calls.every(options => options.cache === 'no-store' && options.next === undefined));
  assert.equal(sitemap.dynamic, 'force-dynamic');
  assert.equal(sitemap.revalidate, 0);
});
