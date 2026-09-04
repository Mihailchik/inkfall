#!/usr/bin/env node
// Fills in canonical URLs, og:image and a sitemap once a domain exists.
//   node set-domain.mjs https://your-domain
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const domain = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https?:\/\/[^/]+$/.test(domain)) {
  console.error('Usage: node set-domain.mjs https://your-domain');
  process.exit(1);
}

const dir = path.dirname(fileURLToPath(import.meta.url));
const pages = ['index.html'];
const ogImage = '/og.jpg';

for (const file of pages) {
  const full = path.join(dir, file);
  let s = fs.readFileSync(full, 'utf8');
  const url = domain + (file === 'index.html' ? '/' : '/' + file);
  s = s
    .replace(/\s*<link rel="canonical"[^>]*>/g, '')
    .replace(/\s*<meta property="og:url"[^>]*>/g, '')
    .replace(/\s*<meta property="og:image(?::\w+)?"[^>]*>/g, '')
    .replace(/\s*<meta name="twitter:image"[^>]*>/g, '');
  const block =
    `\n<link rel="canonical" href="${url}">` +
    `\n<meta property="og:url" content="${url}">` +
    `\n<meta property="og:image" content="${domain}${ogImage}">` +
    `\n<meta property="og:image:width" content="1200">` +
    `\n<meta property="og:image:height" content="630">` +
    `\n<meta name="twitter:image" content="${domain}${ogImage}">`;
  s = s.replace('<meta property="og:type" content="website">', '<meta property="og:type" content="website">' + block);
  fs.writeFileSync(full, s);
  console.log('updated', file);
}

const today = new Date().toISOString().slice(0, 10);
const urls = pages
  .map((f) => {
    const u = domain + (f === 'index.html' ? '/' : '/' + f);
    return `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${f === 'index.html' ? '1.0' : '0.8'}</priority></url>`;
  })
  .join('\n');
fs.writeFileSync(
  path.join(dir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
fs.writeFileSync(path.join(dir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${domain}/sitemap.xml\n`);
console.log('sitemap.xml and robots.txt written');
