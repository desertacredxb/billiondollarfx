const test = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { readFileSync } = require('node:fs');
const Module = require('node:module');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const loaders = { ts: require.extensions['.ts'], tsx: require.extensions['.tsx'] };
const compile = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
require.extensions['.ts'] = compile; require.extensions['.tsx'] = compile;
const originalRequire = Module.prototype.require;
Module.prototype.require = function (name) {
  if (/components\/(Navbar|Footer)$/.test(name)) return { __esModule: true, default: () => null };
  if (name === 'next/link') return { __esModule: true, default: ({ href, children, ...props }) => React.createElement('a', { href, ...props }, children) };
  if (name === 'next/navigation') return { notFound: () => { throw new Error('NOT_FOUND'); } };
  if (name === '@/app/lib/blogApi') return { publishedBlogs: async () => ({ data: [{ slug: 'existing-guide', canonicalUrl: '', updatedAt: '2026-10-21' }, { slug: 'external', canonicalUrl: 'https://example.invalid/original' }], pages: 1 }) };
  if (name === '@/app/lib/blogPublishing') return { SITE_URL: 'https://www.billiondollarfx.com', blogCanonicalUrl: (slug, canonical) => canonical || `https://www.billiondollarfx.com/blogs/${slug}` };
  return originalRequire.apply(this, arguments);
};
const content = require('../lib/countryGuides.ts');
const routes = require('../lib/countryGuidePaths.ts');
const page = require('../src/app/learn/[country]/[language]/page.tsx');
const sitemap = require('../src/app/sitemap.ts').default;
const { publicAnalyticsPaths } = require('../lib/analytics.ts');
Module.prototype.require = originalRequire;
for (const [ext, old] of Object.entries(loaders)) { if (old) require.extensions['.' + ext] = old; else delete require.extensions['.' + ext]; }

const expected = [['india', 'en', 'en-IN'], ['india', 'hi', 'hi-IN'], ['pakistan', 'en', 'en-PK'], ['pakistan', 'ur', 'ur-PK'], ['vietnam', 'en', 'en-VN'], ['vietnam', 'vi', 'vi-VN']];
test('only the three requested countries and their complete language pairs have public routes', async () => {
  assert.deepEqual(page.generateStaticParams(), expected.map(([country, language]) => ({ country, language })));
  assert.deepEqual(routes.countryGuideRoutes, page.generateStaticParams());
  assert.equal(new Set(content.countryGuides.map(content.guidePath)).size, 6);
  for (const [country, language] of [['uae', 'en'], ['india', 'ur'], ['pakistan', 'hi'], ['vietnam', '../en']]) {
    assert.equal(content.getCountryGuide(country, language), undefined);
    await assert.rejects(page.default({ params: Promise.resolve({ country, language }) }), /NOT_FOUND/);
  }
});
test('every translation has a self-canonical and reciprocal alternates within its own country', async () => {
  for (const [country, language, locale] of expected) {
    const metadata = await page.generateMetadata({ params: Promise.resolve({ country, language }) });
    const url = `https://www.billiondollarfx.com/learn/${country}/${language}`;
    assert.equal(metadata.alternates.canonical, url);
    assert.equal(metadata.alternates.languages[locale], url);
    assert.equal(metadata.alternates.languages['x-default'], `https://www.billiondollarfx.com/learn/${country}/en`);
    assert.equal(Object.keys(metadata.alternates.languages).length, 3);
    for (const alternate of Object.values(metadata.alternates.languages)) assert.ok(alternate.startsWith(`https://www.billiondollarfx.com/learn/${country}/`));
    assert.equal(metadata.robots.index, true); assert.ok(metadata.description.length > 70);
  }
});
test('real server-rendered guides include native content, Urdu direction, official sources and education-only actions', async () => {
  for (const [country, language, locale] of expected) {
    const guide = content.getCountryGuide(country, language);
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ country, language }) }));
    assert.ok(html.includes(`lang="${locale}"`)); assert.ok(html.includes(`dir="${language === 'ur' ? 'rtl' : 'ltr'}"`));
    assert.ok(html.includes(guide.heading)); assert.ok(html.includes(guide.sections[0].text));
    assert.ok(html.includes('"@type":"Article"')); assert.ok(html.includes(`"inLanguage":"${locale}"`));
    assert.ok(html.includes('href="/education"')); assert.ok(html.includes('href="/help-centre"'));
    assert.equal(html.includes('href="/register"'), false); assert.equal(html.includes('href="/deposits"'), false);
    for (const source of guide.sources) assert.ok(html.includes(source.url));
  }
});
test('sitemap adds all localized public guides while preserving the existing blog canonical filter', async () => {
  const result = await sitemap();
  for (const [country, language, locale] of expected) {
    const url = `https://www.billiondollarfx.com/learn/${country}/${language}`;
    const entry = result.find(row => row.url === url); assert.ok(entry);
    assert.equal(entry.lastModified, '2026-11-04'); assert.equal(entry.alternates.languages[locale], url);
  }
  assert.ok(result.some(row => row.url === 'https://www.billiondollarfx.com/learn'));
  assert.ok(result.some(row => row.url.endsWith('/blogs/existing-guide')));
  assert.equal(result.some(row => row.url.endsWith('/blogs/external')), false);
});
test('consented analytics can measure only the new fixed public routes, without opening private or arbitrary paths', () => {
  for (const path of routes.countryGuidePublicPaths) assert.ok(publicAnalyticsPaths.has(path));
  for (const path of ['/learn/uae/en', '/learn/india/en?email=private', '/learn/unknown/en', '/users', '/dashboard', '/register']) assert.equal(publicAnalyticsPaths.has(path), false);
  assert.equal(routes.countryGuidePublicPaths.length, 7);
});
