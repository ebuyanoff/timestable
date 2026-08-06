import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const outputDir = join(projectRoot, 'dist');
const siteOrigin = 'https://timestable.ru';

if (!existsSync(outputDir)) {
  console.error('Каталог dist не найден. Сначала выполните сборку проекта.');
  process.exit(1);
}

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolutePath = join(directory, entry.name);
  return entry.isDirectory() ? walk(absolutePath) : absolutePath;
});

const outputFiles = walk(outputDir);
const htmlFiles = outputFiles.filter((file) => extname(file) === '.html');
const routeToFile = new Map();

const toRoute = (file) => {
  const outputPath = relative(outputDir, file).split(sep).join('/');
  if (outputPath === 'index.html') return '/';
  if (outputPath.endsWith('/index.html')) return `/${outputPath.slice(0, -'index.html'.length)}`;
  return `/${outputPath}`;
};

for (const file of htmlFiles) routeToFile.set(toRoute(file), file);

const parseAttributes = (tag) => {
  const attributes = new Map();
  const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const match of tag.matchAll(attributePattern)) {
    attributes.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
};

const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))];
const textContent = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const findMeta = (html, attribute, value) => tags(html, 'meta')
  .map(([tag]) => parseAttributes(tag))
  .find((attributes) => attributes.get(attribute) === value)?.get('content');
const findLink = (html, rel) => tags(html, 'link')
  .map(([tag]) => parseAttributes(tag))
  .find((attributes) => attributes.get('rel')?.split(/\s+/).includes(rel))?.get('href');

const errors = [];
const warnings = [];
const titles = new Map();
const descriptions = new Map();
const pageData = new Map();

const report = (collection, route, message) => collection.push(`${route}: ${message}`);

const globalStyles = readFileSync(join(projectRoot, 'public/css/style.css'), 'utf8');
if (!/img\s*\{[^}]*max-width\s*:\s*100%[^}]*height\s*:\s*auto/i.test(globalStyles)) {
  report(errors, 'CSS', 'адаптивные изображения должны иметь max-width:100% и height:auto');
}

for (const file of htmlFiles) {
  const route = toRoute(file);
  const html = readFileSync(file, 'utf8');
  const title = textContent(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const description = findMeta(html, 'name', 'description');
  const canonical = findLink(html, 'canonical');
  const ogTitle = findMeta(html, 'property', 'og:title');
  const ogDescription = findMeta(html, 'property', 'og:description');
  const ogUrl = findMeta(html, 'property', 'og:url');
  const ogImage = findMeta(html, 'property', 'og:image');
  const robots = findMeta(html, 'name', 'robots');
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  const ids = tags(html, '[a-z][a-z0-9:-]*')
    .map(([tag]) => parseAttributes(tag).get('id'))
    .filter(Boolean);

  pageData.set(route, { file, html, ids: new Set(ids) });

  if (!title) report(errors, route, 'отсутствует title');
  if (!description) report(errors, route, 'отсутствует meta description');
  if (route === '/404.html') {
    if (!robots?.includes('noindex')) report(errors, route, 'страница 404 должна содержать noindex');
  } else {
    const expectedCanonical = new URL(route, siteOrigin).href;
    if (!canonical) report(errors, route, 'отсутствует canonical');
    else if (canonical !== expectedCanonical) report(errors, route, `canonical ${canonical} не совпадает с ${expectedCanonical}`);
    if (ogTitle !== title) report(errors, route, 'og:title не совпадает с title');
    if (ogDescription !== description) report(errors, route, 'og:description не совпадает с description');
    if (ogUrl !== canonical) report(errors, route, 'og:url не совпадает с canonical');
    if (!ogImage || !ogImage.startsWith('https://')) report(errors, route, 'og:image должен быть абсолютным HTTPS URL');
    if (h1Count !== 1) report(errors, route, `ожидался один h1, найдено ${h1Count}`);
  }

  if (title) {
    if (titles.has(title)) report(warnings, route, `дублирует title страницы ${titles.get(title)}`);
    else titles.set(title, route);
  }
  if (description) {
    if (descriptions.has(description)) report(warnings, route, `дублирует description страницы ${descriptions.get(description)}`);
    else descriptions.set(description, route);
  }

  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  for (const id of new Set(duplicateIds)) report(errors, route, `повторяется id="${id}"`);

  for (const [tag] of tags(html, 'img')) {
    const attributes = parseAttributes(tag);
    if (!attributes.has('alt')) report(errors, route, `у изображения ${attributes.get('src') ?? ''} отсутствует alt`);
    if (!attributes.has('width') || !attributes.has('height')) {
      report(warnings, route, `у изображения ${attributes.get('src') ?? ''} не заданы width/height`);
    }
  }

  for (const [tag] of tags(html, 'iframe')) {
    const attributes = parseAttributes(tag);
    const source = attributes.get('src') ?? '';
    if (!attributes.get('title')) report(errors, route, `у iframe ${source} отсутствует title`);
    if (attributes.get('loading') !== 'lazy') report(warnings, route, `iframe ${source} загружается без loading="lazy"`);
  }

  if (/<(?:p|div|span)\b[^>]*class=["'][^"']*\bbtnopen\b/i.test(html)) {
    report(errors, route, 'интерактивный элемент btnopen должен быть кнопкой');
  }
}

const resolveOutputTarget = (pathname) => {
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath.replace(/^\//, '');
  const candidates = [
    join(outputDir, relativePath),
    join(outputDir, relativePath, 'index.html'),
    join(outputDir, `${relativePath}.html`),
  ];
  return candidates.find(existsSync);
};

for (const [route, { html }] of pageData) {
  for (const tagName of ['a', 'img', 'script', 'link', 'iframe']) {
    const urlAttribute = tagName === 'a' || tagName === 'link' ? 'href' : 'src';
    for (const [tag] of tags(html, tagName)) {
      const value = parseAttributes(tag).get(urlAttribute);
      if (!value || /^(?:https?:|mailto:|tel:|data:|javascript:|#)/i.test(value)) continue;

      const targetUrl = new URL(value, new URL(route, siteOrigin));
      if (targetUrl.origin !== siteOrigin) continue;
      const targetFile = resolveOutputTarget(targetUrl.pathname);
      if (!targetFile) {
        report(errors, route, `не найден внутренний ресурс ${value}`);
        continue;
      }

      if (tagName === 'a' && targetUrl.hash) {
        const targetRoute = toRoute(targetFile);
        const targetPage = pageData.get(targetRoute);
        const anchor = decodeURIComponent(targetUrl.hash.slice(1));
        if (targetPage && anchor && !targetPage.ids.has(anchor)) {
          report(errors, route, `не найден якорь ${targetUrl.pathname}${targetUrl.hash}`);
        }
      }
    }
  }
}

console.log(`Проверено HTML-страниц: ${htmlFiles.length}`);
console.log(`Ошибок: ${errors.length}; предупреждений: ${warnings.length}`);

if (errors.length) {
  console.error('\nОшибки:');
  for (const error of errors) console.error(`- ${error}`);
}

if (warnings.length) {
  console.warn('\nПредупреждения:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) process.exit(1);
